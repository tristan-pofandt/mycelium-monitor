// Stands in for "three/webgpu" (see vite.config.js): three-render-objects imports WebGPURenderer for an option the map never uses,
// and the real module would add about 170 kB gzipped to the map's chunk.
export class WebGPURenderer {}
