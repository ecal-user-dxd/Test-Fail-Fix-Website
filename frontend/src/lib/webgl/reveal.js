/**
 * WebGL before → after reveal (Three.js), used by the BeforeAfterReveal block.
 *
 * One plane, in CSS pixels: the plane is the size of the frame at rest and the camera sees the
 * canvas exactly, so the untilted render lines up with the HTML image underneath. The canvas is
 * larger than the frame (a bleed) so the tilted corners are not cut.
 *
 * The shader grows a radial front from the middle of the left edge: the after image appears
 * inside it, with a radial shading (before side darkens as the front comes, shadow and light rim
 * on the front), a radial push of the pixels and a slight colour split on the front.
 *
 * Renders on demand only: while the progress or the tilt are easing, or while the cursor is on a
 * visible front (the front slowly ripples). Nothing runs at rest or off screen.
 */
import {
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	WebGLRenderer
} from 'three';

/** @import { Texture } from 'three' */

/** Maximum tilt towards the cursor, in radians (6°). */
const MAX_TILT = (6 * Math.PI) / 180;
/** Camera distance in frame widths: lower = stronger perspective. */
const DISTANCE = 1.6;
/** Easing rates (per second) of the dragged progress, the tilt and the highlight. */
const RATE = { progress: 16, tilt: 7, hover: 5 };
/** Below this, a value has reached its target. */
const EPSILON = 1e-4;

const vertexShader = /* glsl */ `
	varying vec2 vUv;

	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const fragmentShader = /* glsl */ `
	uniform sampler2D uBefore;
	uniform sampler2D uAfter;
	uniform vec2 uBeforeScale;   // cover fit of each image in the frame
	uniform vec2 uAfterScale;
	uniform float uProgress;     // 0 = before, 1 = after
	uniform float uTime;
	uniform float uAspect;       // frame width / height
	uniform float uRadius;       // corner radius, in frame heights
	uniform float uEdge;         // 1 CSS px, in frame heights
	uniform vec2 uLight;         // highlight position (uv), follows the cursor
	uniform float uHover;        // 0..1 highlight strength

	varying vec2 vUv;

	float hash(vec2 p) {
		p = fract(p * vec2(123.34, 456.21));
		p += dot(p, p + 45.32);
		return fract(p.x * p.y);
	}

	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		vec2 u = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
			mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
			u.y
		);
	}

	float fbm(vec2 p) {
		float value = 0.0;
		float amplitude = 0.5;
		for (int i = 0; i < 4; i++) {
			value += amplitude * noise(p);
			p *= 2.03;
			amplitude *= 0.5;
		}
		return value;
	}

	vec2 cover(vec2 uv, vec2 scale) {
		return (uv - 0.5) * scale + 0.5;
	}

	float roundedBox(vec2 p, vec2 size, float radius) {
		vec2 q = abs(p) - size + radius;
		return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
	}

	void main() {
		// Aspect-correct space (frame height = 1), origin at the middle of the left edge.
		vec2 p = vec2(vUv.x * uAspect, vUv.y - 0.5);
		float dist = length(p);
		vec2 dir = dist > 0.0001 ? p / dist : vec2(1.0, 0.0);

		// Organic front: the radius ripples with the angle, slowly drifting over time.
		float angle = atan(p.y, p.x);
		float ripple = fbm(vec2(angle * 2.5, dist * 2.0 - uTime * 0.25)) - 0.5;

		// From well before the origin to well past the farthest corner, so that at 0 and 1 no
		// shading is left (the widest effect reaches 0.4 from the front, the ripple ±0.09).
		float reach = length(vec2(uAspect, 0.5));
		float radius = mix(-0.55, reach + 0.55, uProgress);
		float front = dist + ripple * 0.18 - radius;      // < 0: after, > 0: before

		// Shading ring around the front (front² rather than pow(): pow of a negative is undefined).
		float band = exp(-(front * front) / 0.0144);
		float mask = smoothstep(-0.008, 0.008, front);    // 0 = after, 1 = before

		// Radial push: the before image is pushed outwards by the front, the after image unfolds
		// from it, with a slight colour split along the radius.
		vec2 push = dir * band * 0.06;
		vec2 pushUv = vec2(push.x / uAspect, push.y);

		vec3 before = texture2D(uBefore, cover(vUv - pushUv, uBeforeScale)).rgb;

		vec2 afterUv = vUv + pushUv * 0.6;
		vec2 split = pushUv * 0.35;
		vec3 after = vec3(
			texture2D(uAfter, cover(afterUv + split, uAfterScale)).r,
			texture2D(uAfter, cover(afterUv, uAfterScale)).g,
			texture2D(uAfter, cover(afterUv - split, uAfterScale)).b
		);

		// Radial shading: the before side darkens as the front comes, a soft shadow falls right
		// behind the front on the after side, and the front itself catches a light rim.
		before *= 1.0 - 0.3 * (1.0 - smoothstep(0.0, 0.4, front));
		after *= 1.0 - 0.25 * smoothstep(-0.3, 0.0, front);
		vec3 color = mix(after, before, mask);
		color += pow(band, 8.0) * 0.3;

		// Highlight following the cursor (3D feel).
		vec2 toLight = (vUv - uLight) * vec2(uAspect, 1.0);
		color += exp(-dot(toLight, toLight) * 2.5) * 0.1 * uHover;

		// Rounded corners (antialiased) and the 1 px hairline of the carousel slides.
		// fwidth(sd) drops to 0 on the box's inner creases (abs / max): keep a floor, or the
		// divisions give NaN lines along the middle and the corner diagonals.
		vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
		float sd = roundedBox(q, vec2(uAspect * 0.5, 0.5), uRadius);
		float aa = max(fwidth(sd), uEdge * 0.5);
		float alpha = clamp(0.5 - sd / aa, 0.0, 1.0);
		float hairline = clamp((uEdge + sd) / aa + 0.5, 0.0, 1.0);
		color *= 1.0 - 0.1 * hairline;

		gl_FragColor = vec4(color, alpha);
	}
`;

/**
 * @param {number} t
 */
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Cover fit of an image in a frame, as a uv scale.
 * @param {Vector2} scale
 * @param {Texture} texture
 * @param {number} frameAspect
 */
function coverScale(scale, texture, frameAspect) {
	const { width, height } = /** @type {HTMLImageElement} */ (texture.image);
	const imageAspect = width / height;
	if (imageAspect > frameAspect) scale.set(frameAspect / imageAspect, 1);
	else scale.set(1, imageAspect / frameAspect);
}

/**
 * @typedef {object} RevealOptions
 * @property {HTMLCanvasElement} canvas  covers the frame plus the bleed, centred on it
 * @property {HTMLElement} frame         box of the image at rest (size, corner radius)
 * @property {string} before             texture URLs
 * @property {string} after
 * @property {number} progress           initial progress, 0..1
 * @property {boolean} reducedMotion     no tilt, no ripple, no tween
 * @property {() => void} [onLost]       the WebGL context was lost
 */

/**
 * Creates the renderer and loads both textures. Throws without WebGL or if a texture fails.
 * @param {RevealOptions} options
 */
export async function createReveal({ canvas, frame, before, after, progress, reducedMotion, onLost }) {
	const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
	renderer.setClearColor(0x000000, 0);

	/** @type {[Texture, Texture]} */
	let maps;
	try {
		const loader = new TextureLoader();
		maps = /** @type {[Texture, Texture]} */ (
			await Promise.all([loader.loadAsync(before), loader.loadAsync(after)])
		);
	} catch (error) {
		renderer.dispose();
		throw error;
	}

	// Textures keep their sRGB values and the shader writes them as is: exact image colours.
	const anisotropy = renderer.capabilities.getMaxAnisotropy();
	for (const map of maps) map.anisotropy = anisotropy;

	const uniforms = {
		uBefore: { value: maps[0] },
		uAfter: { value: maps[1] },
		uBeforeScale: { value: new Vector2(1, 1) },
		uAfterScale: { value: new Vector2(1, 1) },
		uProgress: { value: progress },
		uTime: { value: 0 },
		uAspect: { value: 16 / 9 },
		uRadius: { value: 0 },
		uEdge: { value: 0 },
		uLight: { value: new Vector2(0.5, 0.5) },
		uHover: { value: 0 }
	};

	const geometry = new PlaneGeometry(1, 1);
	const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
	const mesh = new Mesh(geometry, material);
	const scene = new Scene();
	scene.add(mesh);
	const camera = new PerspectiveCamera();

	const target = { progress, x: 0, y: 0, hover: 0 };
	const current = { ...target };
	/** @type {{ from: number, to: number, start: number, duration: number } | null} */
	let tween = null;
	let reduced = reducedMotion;
	let visible = true;
	/** Cursor over the frame. */
	let active = false;
	let raf = 0;
	let last = 0;

	function resize() {
		const width = frame.clientWidth;
		const height = frame.clientHeight;
		const canvasWidth = canvas.clientWidth;
		const canvasHeight = canvas.clientHeight;
		if (!width || !height || !canvasWidth || !canvasHeight) return;

		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(canvasWidth, canvasHeight, false);

		const distance = width * DISTANCE;
		camera.position.set(0, 0, distance);
		camera.fov = (2 * Math.atan(canvasHeight / 2 / distance) * 180) / Math.PI;
		camera.aspect = canvasWidth / canvasHeight;
		camera.near = distance / 10;
		camera.far = distance * 10;
		camera.updateProjectionMatrix();

		mesh.scale.set(width, height, 1);
		const aspect = width / height;
		uniforms.uAspect.value = aspect;
		coverScale(uniforms.uBeforeScale.value, maps[0], aspect);
		coverScale(uniforms.uAfterScale.value, maps[1], aspect);
		uniforms.uRadius.value = (parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0) / height;
		uniforms.uEdge.value = 1 / height;

		renderer.render(scene, camera);
	}

	/**
	 * @param {number} value
	 * @param {number} goal
	 * @param {number} rate
	 * @param {number} dt
	 */
	function ease(value, goal, rate, dt) {
		const next = value + (goal - value) * (1 - Math.exp(-rate * dt));
		return Math.abs(goal - next) < EPSILON ? goal : next;
	}

	/** @param {number} now */
	function frameLoop(now) {
		raf = 0;
		const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
		last = now;

		if (tween) {
			const t = Math.min(1, (now - tween.start) / tween.duration);
			current.progress = tween.from + (tween.to - tween.from) * easeInOut(t);
			if (t === 1) tween = null;
		} else {
			current.progress = reduced ? target.progress : ease(current.progress, target.progress, RATE.progress, dt);
		}
		current.x = ease(current.x, target.x, RATE.tilt, dt);
		current.y = ease(current.y, target.y, RATE.tilt, dt);
		current.hover = ease(current.hover, target.hover, RATE.hover, dt);

		const moving =
			tween !== null ||
			current.progress !== target.progress ||
			current.x !== target.x ||
			current.y !== target.y ||
			current.hover !== target.hover;
		const front = current.progress > 0.001 && current.progress < 0.999;
		const rippling = !reduced && front && (active || moving);
		if (rippling) uniforms.uTime.value += dt;

		uniforms.uProgress.value = current.progress;
		uniforms.uHover.value = current.hover;
		uniforms.uLight.value.set(0.5 + current.x * 0.6, 0.5 - current.y * 0.6);
		// Pressed under the cursor: the side it points at moves away.
		mesh.rotation.set(current.y * MAX_TILT, current.x * MAX_TILT, 0);

		renderer.render(scene, camera);

		if (visible && (moving || rippling)) raf = requestAnimationFrame(frameLoop);
		else last = 0;
	}

	function wake() {
		if (!raf && visible) raf = requestAnimationFrame(frameLoop);
	}

	const observer = new ResizeObserver(() => {
		resize();
		wake();
	});
	observer.observe(canvas);
	observer.observe(frame);

	function handleLost() {
		onLost?.();
	}
	canvas.addEventListener('webglcontextlost', handleLost);

	resize();

	return {
		/**
		 * @param {number} value     0..1
		 * @param {number} [duration] ms; 0 = follow (drag, range), > 0 = play the transition
		 */
		setProgress(value, duration = 0) {
			target.progress = value;
			tween =
				duration > 0 && !reduced
					? { from: current.progress, to: value, start: performance.now(), duration }
					: null;
			wake();
		},

		/**
		 * Cursor over the frame, -1..1 from its centre.
		 * @param {number} x
		 * @param {number} y
		 */
		setPointer(x, y) {
			active = true;
			if (!reduced) Object.assign(target, { x, y, hover: 1 });
			wake();
		},

		leave() {
			active = false;
			Object.assign(target, { x: 0, y: 0, hover: 0 });
			wake();
		},

		/** @param {boolean} value */
		setVisible(value) {
			visible = value;
			if (visible) return wake();
			cancelAnimationFrame(raf);
			raf = 0;
			last = 0;
		},

		/** @param {boolean} value */
		setReducedMotion(value) {
			reduced = value;
			if (reduced) {
				tween = null;
				Object.assign(target, { x: 0, y: 0, hover: 0 });
			}
			wake();
		},

		destroy() {
			cancelAnimationFrame(raf);
			observer.disconnect();
			canvas.removeEventListener('webglcontextlost', handleLost);
			for (const map of maps) map.dispose();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			// Free the context now: client-side navigation can create many of them.
			renderer.forceContextLoss();
		}
	};
}

/** @typedef {Awaited<ReturnType<typeof createReveal>>} Reveal */
