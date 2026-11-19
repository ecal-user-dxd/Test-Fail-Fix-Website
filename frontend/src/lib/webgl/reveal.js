/**
 * WebGL before → after reveal (Three.js), used by the viewer of the gallery block (GalleryViewer).
 *
 * One plane, in CSS pixels: the plane is the size of the frame at rest and the camera sees the
 * canvas exactly, so the untilted render lines up with the HTML image underneath. The canvas is
 * larger than the frame (a bleed) so the tilted corners are not cut.
 *
 * The shader grows a radial front from the middle of the left edge: the after image appears
 * inside it, with a radial shading (before side darkens as the front comes, shadow and light rim
 * on the front), a radial push of the pixels and a slight colour split on the front.
 *
 * One viewer shows many items: setPair() reveals the next item's (before) image over the image
 * shown, with the same shader, then hands over to it. A plain image is a pair whose two images are
 * the same file (loaded once).
 *
 * Renders on demand only: while the progress or the tilt are easing, or while the cursor is on a
 * visible front (the front slowly ripples). Nothing runs at rest or off screen.
 */
import {
	Color,
	Mesh,
	NoColorSpace,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	WebGLRenderer
} from 'three';
import { tuning } from '#lib/tuning/tuning.svelte.js';

/** @import { Texture } from 'three' */

/*
 * Settings: `tuning.reveal` (`#lib/tuning/values.json`, live in the dev tuning panel): tilt (°),
 * camera distance (× frame width), tilt / drag follow speeds (1/s), highlight, swap duration
 * (ms) and the shader's front (width, edge softness, darken, shadow, rim, push, colour split,
 * ripple and its speed). Read on every frame.
 */

/** Easing rate (per second) of the highlight. */
const HOVER_RATE = 5;
/** Below this, a value has reached its target. */
const EPSILON = 1e-4;
const DEGREE = Math.PI / 180;

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
	uniform vec2 uBeforeScale;   // contain fit of each image in the frame (whole image visible)
	uniform vec2 uAfterScale;
	uniform vec3 uBackground;    // frame colour around an image of another ratio
	uniform float uProgress;     // 0 = before, 1 = after
	uniform float uTime;
	uniform float uAspect;       // frame width / height
	uniform float uRadius;       // corner radius, in frame heights
	uniform float uEdge;         // 1 CSS px, in frame heights
	uniform vec2 uLight;         // highlight position (uv), follows the cursor
	uniform float uHover;        // 0..1 highlight presence (cursor over the frame)
	uniform float uHighlight;    // highlight strength
	// Front (tuning.reveal), in frame heights where it is a length.
	uniform float uFrontWidth;   // width of the shading ring
	uniform float uSoftness;     // half width of the before / after edge
	uniform float uDarken;       // before side darkening as the front comes
	uniform float uShadow;       // after side shadow behind the front
	uniform float uRim;          // light rim on the front
	uniform float uPush;         // radial push of the pixels
	uniform float uSplit;        // colour split, share of the push
	uniform float uRipple;       // ripple of the front
	uniform float uMargin;       // progress 0 / 1 start this far past the image: no shading left

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

	// Contain fit: the frame has the before image's ratio, so it fills it exactly; an after image
	// of another ratio is letterboxed. A few texels of mismatch (pairs cut by hand) stay clamped
	// to the edge instead of showing a hairline of background.
	vec3 fit(sampler2D map, vec2 uv, vec2 scale) {
		vec2 st = (uv - 0.5) * scale + 0.5;
		vec2 outside = max(-st, st - 1.0);
		float letterbox = step(0.004, max(outside.x, outside.y));
		return mix(texture2D(map, st).rgb, uBackground, letterbox);
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
		float ripple = fbm(vec2(angle * 2.5, dist * 2.0 - uTime)) - 0.5;

		// From well before the origin to well past the farthest corner (uMargin), so that at 0
		// and 1 no shading is left.
		float reach = length(vec2(uAspect, 0.5));
		float radius = mix(-uMargin, reach + uMargin, uProgress);
		float front = dist + ripple * uRipple - radius;   // < 0: after, > 0: before

		// Shading ring around the front (front² rather than pow(): pow of a negative is undefined).
		float band = exp(-(front * front) / (uFrontWidth * uFrontWidth));
		float mask = smoothstep(-uSoftness, uSoftness, front);   // 0 = after, 1 = before

		// Radial push: the before image is pushed outwards by the front, the after image unfolds
		// from it, with a slight colour split along the radius.
		vec2 push = dir * band * uPush;
		vec2 pushUv = vec2(push.x / uAspect, push.y);

		vec3 before = fit(uBefore, vUv - pushUv, uBeforeScale);

		vec2 afterUv = vUv + pushUv * 0.6;
		vec2 split = pushUv * uSplit;
		vec3 after = vec3(
			fit(uAfter, afterUv + split, uAfterScale).r,
			fit(uAfter, afterUv, uAfterScale).g,
			fit(uAfter, afterUv - split, uAfterScale).b
		);

		// Radial shading: the before side darkens as the front comes, a soft shadow falls right
		// behind the front on the after side, and the front itself catches a light rim.
		before *= 1.0 - uDarken * (1.0 - smoothstep(0.0, uFrontWidth * 3.3, front));
		after *= 1.0 - uShadow * smoothstep(-uFrontWidth * 2.5, 0.0, front);
		vec3 color = mix(after, before, mask);
		color += pow(band, 8.0) * uRim;

		// Highlight following the cursor (3D feel).
		vec2 toLight = (vUv - uLight) * vec2(uAspect, 1.0);
		color += exp(-dot(toLight, toLight) * 2.5) * uHighlight * uHover;

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
 * Contain fit of an image in a frame, as a uv scale (≥ 1 on the letterboxed axis).
 * @param {Vector2} scale
 * @param {Texture} texture
 * @param {number} frameAspect
 */
function containScale(scale, texture, frameAspect) {
	const { width, height } = /** @type {HTMLImageElement} */ (texture.image);
	const imageAspect = width / height;
	if (imageAspect > frameAspect) scale.set(1, imageAspect / frameAspect);
	else scale.set(frameAspect / imageAspect, 1);
}

/**
 * @typedef {object} RevealOptions
 * @property {HTMLCanvasElement} canvas  covers the frame plus the bleed, centred on it
 * @property {HTMLElement} frame         box of the image at rest (size, corner radius)
 * @property {string} before             texture URLs of the first pair
 * @property {string} after
 * @property {number} progress           initial progress, 0..1
 * @property {boolean} reducedMotion     no tilt, no ripple, no tween
 * @property {() => void} [onLost]       the WebGL context was lost
 */

/**
 * @typedef {object} TexturePair
 * @property {Texture} before
 * @property {Texture} after
 * @property {string} key  both URLs, to skip a pair that is already shown
 */

/**
 * Creates the renderer and loads the first pair. Throws without WebGL or if a texture fails.
 * @param {RevealOptions} options
 */
export async function createReveal({ canvas, frame, before, after, progress, reducedMotion, onLost }) {
	const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
	renderer.setClearColor(0x000000, 0);
	const loader = new TextureLoader();
	const anisotropy = renderer.capabilities.getMaxAnisotropy();

	/**
	 * Textures keep their sRGB values and the shader writes them as is: exact image colours.
	 * @param {string} beforeUrl
	 * @param {string} afterUrl
	 * @returns {Promise<TexturePair>}
	 */
	async function loadPair(beforeUrl, afterUrl) {
		const [first, second] = await Promise.all([
			loader.loadAsync(beforeUrl),
			afterUrl === beforeUrl ? null : loader.loadAsync(afterUrl)
		]);
		const pair = { before: first, after: second ?? first, key: `${beforeUrl} ${afterUrl}` };
		for (const map of textures(pair)) map.anisotropy = anisotropy;
		return pair;
	}

	/**
	 * The distinct textures of a pair (one for a plain image).
	 * @param {{ before: Texture, after: Texture }} pair
	 */
	function textures(pair) {
		return pair.before === pair.after ? [pair.before] : [pair.before, pair.after];
	}

	/** Pair shown at rest (the one the range drives). */
	/** @type {TexturePair} */
	let pair;
	try {
		pair = await loadPair(before, after);
	} catch (error) {
		renderer.dispose();
		throw error;
	}

	const uniforms = {
		uBefore: { value: pair.before },
		uAfter: { value: pair.after },
		uBeforeScale: { value: new Vector2(1, 1) },
		uAfterScale: { value: new Vector2(1, 1) },
		uBackground: { value: new Color(1, 1, 1) },
		uProgress: { value: progress },
		uTime: { value: 0 },
		uAspect: { value: 16 / 9 },
		uRadius: { value: 0 },
		uEdge: { value: 0 },
		uLight: { value: new Vector2(0.5, 0.5) },
		uHover: { value: 0 },
		uHighlight: { value: 0 },
		uFrontWidth: { value: 0.12 },
		uSoftness: { value: 0.008 },
		uDarken: { value: 0 },
		uShadow: { value: 0 },
		uRim: { value: 0 },
		uPush: { value: 0 },
		uSplit: { value: 0 },
		uRipple: { value: 0 },
		uMargin: { value: 0.6 }
	};

	/** Copies the tuning values into the shader (cheap: called on every frame). */
	function applyTuning() {
		const t = tuning.reveal;
		uniforms.uHighlight.value = t.highlight;
		uniforms.uFrontWidth.value = Math.max(0.005, t.frontWidth);
		uniforms.uSoftness.value = Math.max(0.0005, t.edgeSoftness);
		uniforms.uDarken.value = t.darken;
		uniforms.uShadow.value = t.shadow;
		uniforms.uRim.value = t.rim;
		uniforms.uPush.value = t.push;
		uniforms.uSplit.value = t.split;
		uniforms.uRipple.value = t.ripple;
		// Past the widest effect (darken reaches 3.3 front widths) and half the ripple.
		uniforms.uMargin.value = t.frontWidth * 3.5 + t.ripple * 0.5 + t.edgeSoftness + 0.05;
	}
	applyTuning();

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
	/**
	 * Change of pair in progress: the shader reveals the new before image over the image that
	 * was shown, then the new pair takes over at progress 0 (same picture, no jump).
	 * @type {{ retire: Texture[], start: number } | null}
	 */
	let swap = null;
	/** Latest setPair call: an older load that finishes late is dropped. */
	let request = 0;
	let destroyed = false;
	let reduced = reducedMotion;
	let visible = true;
	/** Cursor over the frame. */
	let active = false;
	let raf = 0;
	let last = 0;

	/**
	 * Puts two textures in the shader, contain-fitted in the frame.
	 * @param {Texture} first   shown at progress 0
	 * @param {Texture} second  revealed towards progress 1
	 */
	function bind(first, second) {
		uniforms.uBefore.value = first;
		uniforms.uAfter.value = second;
		containScale(uniforms.uBeforeScale.value, first, uniforms.uAspect.value);
		containScale(uniforms.uAfterScale.value, second, uniforms.uAspect.value);
	}

	function finishSwap() {
		if (!swap) return;
		for (const map of swap.retire) map.dispose();
		swap = null;
		bind(pair.before, pair.after);
		current.progress = 0;
	}

	function resize() {
		const width = frame.clientWidth;
		const height = frame.clientHeight;
		const canvasWidth = canvas.clientWidth;
		const canvasHeight = canvas.clientHeight;
		if (!width || !height || !canvasWidth || !canvasHeight) return;

		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(canvasWidth, canvasHeight, false);

		const distance = width * tuning.reveal.perspective;
		camera.position.set(0, 0, distance);
		camera.fov = (2 * Math.atan(canvasHeight / 2 / distance) * 180) / Math.PI;
		camera.aspect = canvasWidth / canvasHeight;
		camera.near = distance / 10;
		camera.far = distance * 10;
		camera.updateProjectionMatrix();

		mesh.scale.set(width, height, 1);
		uniforms.uAspect.value = width / height;
		bind(uniforms.uBefore.value, uniforms.uAfter.value);
		uniforms.uBackground.value.setStyle(
			getComputedStyle(frame).getPropertyValue('--picture-bg').trim() || '#fff',
			NoColorSpace
		);
		uniforms.uRadius.value = (parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0) / height;
		uniforms.uEdge.value = 1 / height;

		applyTuning();
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

		/** Progress sent to the shader: the swap's own, or the pair's. */
		let shown;
		if (swap) {
			const t = Math.min(1, (now - swap.start) / Math.max(1, tuning.reveal.swapDuration));
			shown = easeInOut(t);
			if (t === 1) {
				finishSwap();
				shown = current.progress;
			}
		} else {
			if (tween) {
				const t = Math.min(1, (now - tween.start) / tween.duration);
				current.progress = tween.from + (tween.to - tween.from) * easeInOut(t);
				if (t === 1) tween = null;
			} else {
				current.progress = reduced
					? target.progress
					: ease(current.progress, target.progress, tuning.reveal.followSpeed, dt);
			}
			shown = current.progress;
		}
		current.x = ease(current.x, target.x, tuning.reveal.tiltSpeed, dt);
		current.y = ease(current.y, target.y, tuning.reveal.tiltSpeed, dt);
		current.hover = ease(current.hover, target.hover, HOVER_RATE, dt);

		const moving =
			swap !== null ||
			tween !== null ||
			current.progress !== target.progress ||
			current.x !== target.x ||
			current.y !== target.y ||
			current.hover !== target.hover;
		const front = shown > 0.001 && shown < 0.999;
		const rippling = !reduced && front && (active || moving);
		if (rippling) uniforms.uTime.value += dt * tuning.reveal.rippleSpeed;
		applyTuning();

		uniforms.uProgress.value = shown;
		uniforms.uHover.value = current.hover;
		uniforms.uLight.value.set(0.5 + current.x * 0.6, 0.5 - current.y * 0.6);
		// Pressed under the cursor: the side it points at moves away.
		const tilt = tuning.reveal.tilt * DEGREE;
		mesh.rotation.set(current.y * tilt, current.x * tilt, 0);

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
			finishSwap();
			target.progress = value;
			tween =
				duration > 0 && !reduced
					? { from: current.progress, to: value, start: performance.now(), duration }
					: null;
			wake();
		},

		/**
		 * Shows another pair, starting on its before image. The current pair stays until the new
		 * textures are loaded, then the new before image is revealed over what was shown.
		 * @param {string} beforeUrl
		 * @param {string} afterUrl
		 */
		async setPair(beforeUrl, afterUrl) {
			const call = ++request;
			if (`${beforeUrl} ${afterUrl}` === pair.key) return;
			/** @type {TexturePair} */
			let next;
			try {
				next = await loadPair(beforeUrl, afterUrl);
			} catch {
				return; // keep the current pair
			}
			if (destroyed || call !== request) {
				for (const map of textures(next)) map.dispose();
				return;
			}

			finishSwap();
			const old = pair;
			const was = current.progress >= 0.5 ? old.after : old.before;
			pair = next;
			tween = null;
			target.progress = 0;
			current.progress = 0;

			if (reduced) {
				for (const map of textures(old)) map.dispose();
				bind(pair.before, pair.after);
			} else {
				bind(was, pair.before);
				swap = { retire: textures(old), start: performance.now() };
			}
			// The first frame of the swap must not show the new pair at the old progress.
			uniforms.uProgress.value = 0;
			renderer.render(scene, camera);
			wake();
		},

		/** Tuning values changed (dev panel): camera and shader again, then one frame. */
		refresh() {
			resize();
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
				finishSwap();
				tween = null;
				Object.assign(target, { x: 0, y: 0, hover: 0 });
			}
			wake();
		},

		destroy() {
			destroyed = true;
			cancelAnimationFrame(raf);
			observer.disconnect();
			canvas.removeEventListener('webglcontextlost', handleLost);
			finishSwap();
			for (const map of textures(pair)) map.dispose();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			// Free the context now: client-side navigation can create many of them.
			renderer.forceContextLoss();
		}
	};
}

/** @typedef {Awaited<ReturnType<typeof createReveal>>} Reveal */
