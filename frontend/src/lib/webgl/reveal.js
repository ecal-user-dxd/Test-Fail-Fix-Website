/**
 * WebGL before → after reveal (Three.js), used by the viewer of the gallery block (GalleryViewer).
 * The image is a supple sheet: a wave runs through it with the front, it gives way under the
 * cursor and its relief catches the light (vertex shader).
 *
 * One plane, in CSS pixels: the plane is the size of the frame at rest and the camera sees the
 * canvas exactly, so the untilted render lines up with the HTML image underneath. The canvas is
 * larger than the frame (a bleed) so the tilted corners are not cut.
 *
 * The shader grows a radial front from the middle of the left edge and transforms one image into
 * the other across it, without a cut: in a wide blend zone the old image zooms forward, blurs and
 * flows away while the new one arrives enlarged, blurred and distorted, then settles sharp. Radial
 * shading (old side darkens as the front comes, shadow and light rim on the front), a radial push
 * of the pixels and a slight colour split go with it. The blur is a mip bias: almost free.
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
	Matrix4,
	Mesh,
	NoColorSpace,
	PerspectiveCamera,
	Plane,
	PlaneGeometry,
	Raycaster,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer
} from 'three';
import { tuning } from '#lib/tuning/tuning.svelte.js';
import { dragRadius } from '#lib/webgl/front.js';

/** @import { Texture } from 'three' */

/*
 * Settings: `tuning.reveal` (`#lib/tuning/values.json`, live in the dev tuning panel): tilt (°),
 * camera distance (× frame width), tilt / follow speeds (1/s; follow: the range, and the gap
 * closing at a drag's grab, after which the front moves exactly with the cursor), throw (share of
 * the release speed kept, 0 = off; friction, 1/s, as on the desk; elasticity, 0 = none), highlight,
 * swap duration (ms) and the shader's front (width, edge softness, darken, shadow, rim, push, colour split,
 * ripple and its speed). Read on every frame.
 */

/** Easing rate (per second) of the highlight. */
const HOVER_RATE = 5;
/** Below this, a value has reached its target. */
const EPSILON = 1e-4;
const DEGREE = Math.PI / 180;
/**
 * Throw, as on the desk (GalleryDesk): release speed measured over the last ms of the drag; none
 * if the cursor stood still that long before the release; progress / s to start gliding, and
 * below which a glide has stopped.
 */
const THROW_WINDOW = 80;
const THROW_STILL = 60;
const THROW_MIN = 0.05;
const GLIDE_STOP = 1e-3;
/** Glide integration step, s (the spring is stiff for a 60 Hz step at high friction). */
const GLIDE_STEP = 1 / 240;

/** Value noise and fractal noise, shared by both shaders (same ripple on the mesh and pixels). */
const noiseGlsl = /* glsl */ `
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
`;

/*
 * The front, shared by both shaders (after noiseGlsl; uses uTime, uAspect, uMargin, uProgress and
 * uRipple). Positions are aspect-correct (frame height = 1), origin at the middle of the left edge.
 */
const frontGlsl = /* glsl */ `
	uniform vec2 uAnchor;     // point the front passes through while dragged (uv, in the image)
	uniform float uAnchored;  // 0..1: how much the front is held at uAnchor

	// Ripple of the front at p: its radius ripples with the angle, slowly drifting over time.
	float rippleAt(vec2 p) {
		// + 1e-5: atan(0, 0) is undefined, and the middle of the left edge is a vertex.
		float angle = atan(p.y, p.x + 1e-5);
		return fbm(vec2(angle * 2.5, length(p) * 2.0 - uTime)) - 0.5;
	}

	// Radius of the front: from well before the origin to well past the farthest corner
	// (uMargin), so that at 0 and 1 no shading is left. While dragged, the progress puts the
	// radius on the cursor and the ripple there is added: the front passes exactly under it.
	float frontRadius() {
		float reach = length(vec2(uAspect, 0.5));
		vec2 anchor = vec2(uAnchor.x * uAspect, uAnchor.y - 0.5);
		return mix(-uMargin, reach + uMargin, uProgress) + rippleAt(anchor) * uRipple * uAnchored;
	}
`;

/*
 * The plane is a supple sheet (a fine grid): a soft wave runs through it with the front, and it
 * gives way under the cursor. Its slope shades the image (light from the top left), so the folds
 * read as relief. Flat at rest: it lines up with the HTML image underneath.
 */
const vertexShader = /* glsl */ `
	uniform float uProgress;
	uniform float uTime;
	uniform float uAspect;
	uniform float uRipple;
	uniform float uMargin;
	uniform float uFrameHeight; // px: the mesh is in CSS pixels
	uniform float uWave;        // height of the wave on the front, in frame heights
	uniform float uWaveWidth;   // its width, in frame heights
	uniform float uPress;       // depth of the dent under the cursor, in frame heights
	uniform float uPressRadius; // its radius, in frame heights
	uniform float uShade;       // strength of the light on the slopes
	uniform float uHover;
	uniform vec2 uPointer;      // cursor, in uv

	varying vec2 vUv;
	varying float vShade;

	${noiseGlsl}
	${frontGlsl}

	// Height of the sheet at uv, in frame heights (towards the viewer).
	float height(vec2 uv, float radius) {
		vec2 p = vec2(uv.x * uAspect, uv.y - 0.5);
		float front = length(p) + rippleAt(p) * uRipple - radius;

		// A wave packet on the front: crest on it, shallow troughs on each side.
		float w = max(uWaveWidth, 0.01);
		float wave = exp(-(front * front) / (w * w)) * cos(front / w * 2.0);

		vec2 toPointer = (uv - uPointer) * vec2(uAspect, 1.0);
		float r = max(uPressRadius, 0.01);
		float press = exp(-dot(toPointer, toPointer) / (r * r)) * uHover;

		return uWave * wave - uPress * press;
	}

	void main() {
		vUv = uv;
		float radius = frontRadius();
		float h = height(uv, radius);

		// Slope by finite differences, in frame heights on both axes.
		float e = 0.004;
		float dx = (height(uv + vec2(e, 0.0), radius) - height(uv - vec2(e, 0.0), radius)) / (2.0 * e * uAspect);
		float dy = (height(uv + vec2(0.0, e), radius) - height(uv - vec2(0.0, e), radius)) / (2.0 * e);
		vec3 normal = normalize(vec3(-dx, -dy, 1.0));
		vec3 light = normalize(vec3(-0.45, 0.55, 1.0));
		vShade = 1.0 + uShade * (dot(normal, light) - light.z);

		vec3 displaced = position + vec3(0.0, 0.0, h * uFrameHeight);
		gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
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
	uniform float uSoftness;     // half width of the blend zone (0 = sharp cut)
	uniform float uZoom;         // old image magnifies by this as it goes, new one settles from it
	uniform float uBlur;         // blur of the image leaving / arriving, in mip levels
	uniform float uFlow;         // liquid flow through the blend zone, in frame heights
	uniform float uDarken;       // before side darkening as the front comes
	uniform float uShadow;       // after side shadow behind the front
	uniform float uRim;          // light rim on the front
	uniform float uPush;         // radial push of the pixels
	uniform float uSplit;        // colour split, share of the push
	uniform float uRipple;       // ripple of the front
	uniform float uMargin;       // progress 0 / 1 start this far past the image: no shading left

	varying vec2 vUv;
	varying float vShade;        // light on the slopes of the sheet (1 = flat)

	${noiseGlsl}
	${frontGlsl}

	// Contain fit: the frame has the before image's ratio, so it fills it exactly; an after image
	// of another ratio is letterboxed. A few texels of mismatch (pairs cut by hand) stay clamped
	// to the edge instead of showing a hairline of background.
	// blur: mip bias, in levels (0 = sharp).
	vec3 fit(sampler2D map, vec2 uv, vec2 scale, float blur) {
		vec2 st = (uv - 0.5) * scale + 0.5;
		vec2 outside = max(-st, st - 1.0);
		float letterbox = step(0.004, max(outside.x, outside.y));
		// Transparent images (Fix pairs in fix-alpha/): composite over the frame colour.
		vec4 tex = texture2D(map, st, blur);
		return mix(mix(uBackground, tex.rgb, tex.a), uBackground, letterbox);
	}

	// Magnifies by (1 + amount) around the origin of the front (middle of the left edge), in uv.
	vec2 zoomFrom(vec2 uv, float amount) {
		vec2 origin = vec2(0.0, 0.5);
		return origin + (uv - origin) / (1.0 + amount);
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

		// Organic front (rippled circle), < 0: after, > 0: before.
		float front = dist + rippleAt(p) * uRipple - frontRadius();

		// Shading ring around the front (front² rather than pow(): pow of a negative is undefined).
		float band = exp(-(front * front) / (uFrontWidth * uFrontWidth));

		// How far the transformation has gone here: 0 = old image, 1 = new image. A wide blend
		// zone (uSoftness) makes the front a gradual transformation instead of a cut.
		float t = 1.0 - smoothstep(-uSoftness, uSoftness, front);
		float arriving = 1.0 - t;

		// Liquid flow through the blend zone, drifting with the ripple (uv units).
		vec2 swirl = p * 2.5;
		vec2 flow = vec2(
			fbm(swirl + vec2(uTime * 0.6, 0.0)),
			fbm(swirl + vec2(5.2, 1.3) - uTime * 0.6)
		) - 0.5;
		flow = vec2(flow.x / uAspect, flow.y) * 2.0 * uFlow;

		// Radial push: the old image is pushed outwards by the front, the new one unfolds from
		// it, with a slight colour split along the radius.
		vec2 push = dir * band * uPush;
		vec2 pushUv = vec2(push.x / uAspect, push.y);

		// Old image: magnified, carried by the flow and blurred as it goes. Untouched where t = 0.
		vec2 beforeUv = zoomFrom(vUv - pushUv, uZoom * t) + flow * t;
		vec3 before = fit(uBefore, beforeUv, uBeforeScale, uBlur * t);

		// New image: arrives magnified, distorted and blurred, settles sharp where t = 1.
		vec2 afterUv = zoomFrom(vUv + pushUv * 0.6, uZoom * arriving) - flow * arriving;
		vec2 split = pushUv * uSplit;
		float afterBlur = uBlur * arriving;
		vec3 after = vec3(
			fit(uAfter, afterUv + split, uAfterScale, afterBlur).r,
			fit(uAfter, afterUv, uAfterScale, afterBlur).g,
			fit(uAfter, afterUv - split, uAfterScale, afterBlur).b
		);

		// Radial shading: the old side darkens as the front comes, a soft shadow falls right
		// behind the front on the new side, and the front itself catches a light rim.
		before *= 1.0 - uDarken * (1.0 - smoothstep(0.0, uFrontWidth * 3.3, front));
		after *= 1.0 - uShadow * smoothstep(-uFrontWidth * 2.5, 0.0, front);
		vec3 color = mix(before, after, t);
		color += pow(band, 8.0) * uRim;

		// Relief of the sheet, then the highlight following the cursor (3D feel).
		color *= vShade;
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
 * @property {(x: number, y: number) => void} [onTilt]  tilt shown, on each frame: -1..1 of
 *   `tuning.reveal.tilt` around the vertical / horizontal axis (x: right side away, y: bottom
 *   side away), for HTML to tilt along (the before / after bar)
 * @property {(progress: number) => void} [onGlide]  progress shown while the front glides on
 *   after a throw, on each frame, 0..1, for the range
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
export async function createReveal({
	canvas,
	frame,
	before,
	after,
	progress,
	reducedMotion,
	onLost,
	onTilt,
	onGlide
}) {
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
		uZoom: { value: 0 },
		uBlur: { value: 0 },
		uFlow: { value: 0 },
		uDarken: { value: 0 },
		uShadow: { value: 0 },
		uRim: { value: 0 },
		uPush: { value: 0 },
		uSplit: { value: 0 },
		uRipple: { value: 0 },
		uMargin: { value: 0.6 },
		uFrameHeight: { value: 1 },
		uWave: { value: 0 },
		uWaveWidth: { value: 0.2 },
		uPress: { value: 0 },
		uPressRadius: { value: 0.3 },
		uShade: { value: 0 },
		uPointer: { value: new Vector2(0.5, 0.5) },
		uAnchor: { value: new Vector2(0, 0.5) },
		uAnchored: { value: 0 }
	};

	/** Copies the tuning values into the shader (cheap: called on every frame). */
	/**
	 * @param {number} share  part of the blend transformation (zone, zoom, blur, flow) to use: 1 for
	 *                        a change of item, `pairMorph` for a before / after pair, which must
	 *                        stay readable when the range stops half way
	 */
	function applyTuning(share) {
		const t = tuning.reveal;
		uniforms.uHighlight.value = t.highlight;
		uniforms.uFrontWidth.value = Math.max(0.005, t.frontWidth);
		uniforms.uSoftness.value = Math.max(0.0005, t.edgeSoftness * share);
		uniforms.uZoom.value = t.zoom * share;
		uniforms.uBlur.value = t.blur * share;
		uniforms.uFlow.value = t.flow * share;
		uniforms.uDarken.value = t.darken;
		uniforms.uShadow.value = t.shadow;
		uniforms.uRim.value = t.rim;
		uniforms.uPush.value = t.push;
		uniforms.uSplit.value = t.split;
		uniforms.uRipple.value = t.ripple;
		uniforms.uWave.value = t.wave * share;
		uniforms.uWaveWidth.value = t.waveWidth;
		uniforms.uPress.value = t.press;
		uniforms.uPressRadius.value = t.pressRadius;
		uniforms.uShade.value = t.shade;
		// Past the widest effect (darken reaches 3.3 front widths), the blend zone and half the
		// ripple: at 0 and 1 the image is untouched.
		uniforms.uMargin.value = t.frontWidth * 3.5 + t.ripple * 0.5 + t.edgeSoftness + 0.05;
	}
	applyTuning(tuning.reveal.pairMorph);

	// A fine grid, so the sheet can bend (≈ 5 000 vertices: nothing for the GPU).
	const geometry = new PlaneGeometry(1, 1, 96, 54);
	const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
	const mesh = new Mesh(geometry, material);
	const scene = new Scene();
	scene.add(mesh);
	const camera = new PerspectiveCamera();

	// anchored: the front is held under the drag point (see frontGlsl).
	const target = { progress, x: 0, y: 0, hover: 0, anchored: 0 };
	const current = { ...target };
	/** @type {{ from: number, to: number, start: number, duration: number } | null} */
	let tween = null;
	/**
	 * Dragged (set by drag(), until another motion): the progress is the target plus this gap,
	 * which closes after the grab, so the front then moves exactly with the cursor.
	 * @type {number | null}
	 */
	let grip = null;
	/** Viewport point of the cursor while the button is down (drag), or null. */
	/** @type {{ x: number, y: number } | null} */
	let held = null;
	/** Progress aimed at by the drag over its last THROW_WINDOW ms, and the one before (ms). */
	/** @type {{ progress: number, time: number }[]} */
	let samples = [];
	/**
	 * Thrown (released during a move): the front glides on at the release speed and slows down
	 * with the friction. It runs on a spring towards the point where the friction stops it
	 * (`rest`): critically damped, that is exactly the desk's glide; a little under-damped
	 * (elasticity), it goes a touch past that point and settles back. Offset from `rest` and
	 * speed, in progress (/ s).
	 * @type {{ rest: number, offset: number, speed: number } | null}
	 */
	let glide = null;
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
		uniforms.uFrameHeight.value = height;

		applyTuning(swap ? 1 : tuning.reveal.pairMorph);
		renderer.render(scene, camera);
	}

	const raycaster = new Raycaster();
	const pointer = new Vector2();
	const toLocal = new Matrix4();
	/** The plane of the image, in its own space (the mesh is a 1 × 1 plane, scaled). */
	const surface = new Plane(new Vector3(0, 0, 1), 0);
	const hit = new Vector3();
	const spot = new Vector2();

	/**
	 * Point of the image under a viewport point, through the camera and the tilt shown, in uv
	 * (0..1 inside the image; the plane goes on beyond it).
	 * @param {number} clientX
	 * @param {number} clientY
	 * @returns {Vector2 | null}  shared vector, read it at once
	 */
	function uvAt(clientX, clientY) {
		const box = canvas.getBoundingClientRect();
		if (!box.width || !box.height) return null;
		pointer.set(((clientX - box.left) / box.width) * 2 - 1, 1 - ((clientY - box.top) / box.height) * 2);
		camera.updateMatrixWorld();
		mesh.updateMatrixWorld();
		raycaster.setFromCamera(pointer, camera);
		const ray = raycaster.ray.applyMatrix4(toLocal.copy(mesh.matrixWorld).invert());
		if (!ray.intersectPlane(surface, hit)) return null;
		return spot.set(hit.x + 0.5, hit.y + 0.5);
	}

	/**
	 * Aims the front at a point of the image (uv): its radius is the point's distance to the
	 * middle of the left edge (the shader adds the ripple there), eased to reach 0 at the left
	 * edge and 1 at the right edge (dragRadius, `tuning.reveal.edgeZone`).
	 * @param {Vector2} uv
	 */
	function aimFront(uv) {
		const aspect = uniforms.uAspect.value;
		const margin = uniforms.uMargin.value;
		const reach = Math.hypot(aspect, 0.5);
		const distance = Math.hypot(uv.x * aspect, uv.y - 0.5);
		const radius = dragRadius(distance, uv.x, tuning.reveal.edgeZone, -margin, reach + margin);
		target.progress = Math.min(1, Math.max(0, (radius + margin) / (reach + 2 * margin)));
		// The ripple is read inside the image: continuous, and exact where the front shows.
		uniforms.uAnchor.value.set(Math.min(1, Math.max(0, uv.x)), Math.min(1, Math.max(0, uv.y)));
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
		const follow = tuning.reveal.followSpeed;

		current.x = ease(current.x, target.x, tuning.reveal.tiltSpeed, dt);
		current.y = ease(current.y, target.y, tuning.reveal.tiltSpeed, dt);
		current.hover = ease(current.hover, target.hover, HOVER_RATE, dt);
		current.anchored = reduced ? target.anchored : ease(current.anchored, target.anchored, follow, dt);
		// Pressed under the cursor: the side it points at moves away.
		const tilt = tuning.reveal.tilt * DEGREE;
		mesh.rotation.set(current.y * tilt, current.x * tilt, 0);
		onTilt?.(current.x, current.y);
		applyTuning(swap ? 1 : tuning.reveal.pairMorph);

		// Dragged: aim again with this frame's tilt, so the front stays under a still cursor.
		if (held) {
			const uv = uvAt(held.x, held.y);
			if (uv) aimFront(uv);
		}

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
			} else if (glide) {
				// Damped spring towards the rest point, frequency = friction (see `glide`).
				const rate = Math.max(0.5, tuning.reveal.friction);
				const damping = 1 - Math.min(0.95, Math.max(0, tuning.reveal.elasticity));
				const steps = Math.ceil(dt / GLIDE_STEP);
				const h = dt / steps;
				for (let i = 0; i < steps; i++) {
					glide.speed -= (rate * rate * glide.offset + 2 * damping * rate * glide.speed) * h;
					glide.offset += glide.speed * h;
				}
				// Past 0 or 1 the front is out of the image: nothing more to show.
				current.progress = Math.min(1, Math.max(0, glide.rest + glide.offset));
				if (Math.abs(glide.offset) < EPSILON && Math.abs(glide.speed) < GLIDE_STOP) {
					current.progress = glide.rest;
					glide = null;
				}
				onGlide?.(current.progress);
			} else if (grip !== null) {
				// The front moves exactly with the cursor; only the gap left at the grab closes.
				const gap = reduced ? 0 : ease(grip, 0, follow, dt);
				current.progress = Math.min(1, Math.max(0, target.progress + gap));
				grip = current.progress - target.progress;
			} else {
				current.progress = reduced ? target.progress : ease(current.progress, target.progress, follow, dt);
			}
			shown = current.progress;
		}

		const moving =
			swap !== null ||
			tween !== null ||
			glide !== null ||
			current.progress !== target.progress ||
			current.x !== target.x ||
			current.y !== target.y ||
			current.hover !== target.hover ||
			current.anchored !== target.anchored;
		const front = shown > 0.001 && shown < 0.999;
		const rippling = !reduced && front && (active || moving);
		if (rippling) uniforms.uTime.value += dt * tuning.reveal.rippleSpeed;

		uniforms.uProgress.value = shown;
		uniforms.uAnchored.value = swap ? 0 : current.anchored;
		uniforms.uHover.value = current.hover;
		uniforms.uLight.value.set(0.5 + current.x * 0.6, 0.5 - current.y * 0.6);
		uniforms.uPointer.value.set(0.5 + current.x * 0.5, 0.5 - current.y * 0.5);

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
			grip = null;
			held = null;
			glide = null;
			samples = [];
			target.anchored = 0;
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
			grip = null;
			held = null;
			glide = null;
			samples = [];
			target.progress = 0;
			current.progress = 0;
			target.anchored = 0;
			current.anchored = 0;
			uniforms.uAnchored.value = 0;

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

		/**
		 * The cursor drags the front (button down on the image): the front passes under it and
		 * then moves exactly with it, tilt and ripple included. At the grab, the gap between the
		 * front and the cursor closes quickly (followSpeed). A glide is caught where it is.
		 * release() when the button goes up.
		 * @param {number} clientX
		 * @param {number} clientY
		 * @returns {number} the progress aimed at, for the range
		 */
		drag(clientX, clientY) {
			finishSwap();
			tween = null;
			glide = null;
			const uv = uvAt(clientX, clientY);
			if (!uv) return target.progress;
			const grab = held === null || grip === null;
			held = { x: clientX, y: clientY };
			aimFront(uv);
			if (grab) {
				grip = current.progress - target.progress;
				samples = [];
			}
			const now = performance.now();
			samples.push({ progress: target.progress, time: now });
			// The window, and the sample just before it: a slow event rate still gives a speed.
			while (samples.length > 2 && now - samples[1].time > THROW_WINDOW) samples.shift();
			target.anchored = 1;
			wake();
			return target.progress;
		},

		/**
		 * End of the drag. Let go during a quick move, the front is thrown: it glides on at the
		 * cursor's speed and slows down, as a photo on the desk (onGlide reports it). Otherwise
		 * it stays where it was left.
		 * @param {boolean} [thrown]  false: the drag was cancelled, no throw
		 */
		release(thrown = true) {
			held = null;
			const first = samples[0];
			const end = samples.at(-1);
			samples = [];
			const { throw: inertia, friction } = tuning.reveal;
			const now = performance.now();
			if (!thrown || reduced || inertia <= 0 || !first || !end || now - end.time > THROW_STILL) return;
			const span = (end.time - first.time) / 1000;
			if (span < 0.008) return;
			const speed = ((end.progress - first.progress) / span) * inertia;
			if (Math.abs(speed) < THROW_MIN) return;
			// Where the friction alone stops it (exponential slow-down), within 0..1.
			const rest = Math.min(1, Math.max(0, current.progress + speed / Math.max(0.5, friction)));
			glide = { rest, offset: current.progress - rest, speed };
			grip = null;
			target.progress = rest;
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
				// A glide ends where it was going (target.progress), at once.
				if (glide) {
					glide = null;
					onGlide?.(target.progress);
				}
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
