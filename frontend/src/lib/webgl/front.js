/**
 * Dragging the before / after front (GalleryViewer): shared by the WebGL reveal (reveal.js) and
 * the CSS circle shown before it loads, so both reach 0 % and 100 % at the same cursor positions.
 * No Three.js here: the viewer imports it up front.
 */

/**
 * Radius of the front for a drag point. Across the middle of the frame it is the point's own
 * distance to the middle of the left edge: the front passes exactly under the cursor. In the
 * zone along each side, it moves ahead of the cursor so that it reaches its start radius at the
 * left edge and its end radius at the right edge: 0 % and 100 % at the edges of the frame, at any
 * height. Ease-in (cube): the front stays with the cursor as long as it can, and runs through
 * the margin, where nothing shows any more, in the last pixels.
 * @param {number} distance  distance of the point to the middle of the left edge
 * @param {number} u         horizontal position of the point, 0 (left edge) .. 1 (right edge)
 * @param {number} zone      width of each side zone, share of the frame width (≤ 0.5)
 * @param {number} start     radius at progress 0
 * @param {number} end       radius at progress 1
 */
export function dragRadius(distance, u, zone, start, end) {
	const z = Math.min(0.5, Math.max(0.01, zone));
	const toStart = Math.min(1, Math.max(0, (z - u) / z)) ** 3;
	const toEnd = Math.min(1, Math.max(0, (u - (1 - z)) / z)) ** 3;
	return distance + toStart * (start - distance) + toEnd * (end - distance);
}
