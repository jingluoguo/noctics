import { useEffect, useRef } from 'react';

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mediaCoarse = window.matchMedia('(pointer: coarse)');
    if (mediaReduce.matches || mediaCoarse.matches) return;

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_pos;
      attribute float a_seed;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec2 u_res;
      varying float v_alpha;

      void main() {
        float t = u_time * 0.00035;
        float driftX = sin(t * (0.5 + a_seed * 0.7) + a_seed * 6.2831) * 0.08;
        float driftY = cos(t * (0.65 + a_seed * 0.6) + a_seed * 4.7123) * 0.08;
        vec2 p = a_pos + vec2(driftX, driftY);

        vec2 m = (u_mouse / u_res) * 2.0 - 1.0;
        float d = distance(p, m);
        float force = smoothstep(0.5, 0.0, d) * 0.04;
        p += normalize(p - m + 0.0001) * force;

        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = 1.4 + 2.8 * (1.0 - d);
        v_alpha = 0.22 + (1.0 - d) * 0.6;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying float v_alpha;

      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float r = dot(c, c);
        float falloff = smoothstep(0.25, 0.0, r);
        gl_FragColor = vec4(0.58, 0.86, 1.0, v_alpha * falloff);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const count = 180;
    const positions = new Float32Array(count * 2);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positions[i * 2] = Math.random() * 2 - 1;
      positions[i * 2 + 1] = Math.random() * 2 - 1;
      seeds[i] = Math.random();
    }

    const posBuffer = gl.createBuffer();
    const seedBuffer = gl.createBuffer();
    if (!posBuffer || !seedBuffer) return;

    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    const aSeed = gl.getAttribLocation(program, 'a_seed');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uRes = gl.getUniformLocation(program, 'u_res');

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aSeed);
    gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };

    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = window.innerHeight - event.clientY;
    };

    window.addEventListener('mousemove', onMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const render = (time: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uRes, window.innerWidth, window.innerHeight);
      gl.drawArrays(gl.POINTS, 0, count);

      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(seedBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas className="hero-particles" ref={canvasRef} aria-hidden="true" />;
}
