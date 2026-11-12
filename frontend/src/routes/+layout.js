// Fully static site: every route is prerendered.
export const prerender = true;
// `/rectify/test/` → `rectify/test/index.html`: works on any static server (ECAL hosting),
// without rewrite rules.
export const trailingSlash = 'always';
