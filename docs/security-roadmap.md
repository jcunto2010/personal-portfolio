---
# Security Roadmap

## CSP: eliminar `unsafe-eval`

**Estado:** Pendiente  
**Prioridad:** Alta

### Por qué está activo
Three.js / React Three Fiber compilan shaders GLSL en tiempo de ejecución usando
`eval()` o `new Function()`, lo que requiere `'unsafe-eval'` en `script-src`.

### Camino para eliminarlo
1. Investigar `glsl-minify` o el plugin `vite-plugin-glsl` para pre-compilar shaders.
2. Evaluar `@react-three/offscreen` para mover el render a un Web Worker.
3. Revisar si Three.js 0.170+ incluye compilación de shaders diferida compatible con CSP estricta.
4. Una vez pre-compilados, eliminar `'unsafe-eval'` de:
   - `index.html` (meta CSP)
   - `netlify.toml`
   - `vercel.json`
5. Validar con Lighthouse que el score de Best Practices no baja.

### Referencias
- https://github.com/mrdoob/three.js/issues/23723
- https://web.dev/csp/
---
