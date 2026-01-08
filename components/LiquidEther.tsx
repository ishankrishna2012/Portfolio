import React, { useRef, useEffect } from 'react';

interface Props {
  isDark: boolean;
}

const LiquidEther: React.FC<Props> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_dark;

      // Simplex Noise helpers
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          // Maintain aspect ratio
          st.x *= u_resolution.x / u_resolution.y;

          float t = u_time * 0.15;
          
          // Domain Warping
          vec2 q = vec2(0.);
          q.x = snoise(st + vec2(0.0, t));
          q.y = snoise(st + vec2(1.0, t));

          vec2 r = vec2(0.);
          r.x = snoise(st + 1.0*q + vec2(1.7, 9.2) + 0.15*t);
          r.y = snoise(st + 1.0*q + vec2(8.3, 2.8) + 0.126*t);

          float f = snoise(st + r);

          vec3 color = vec3(0.0);
          
          if (u_dark > 0.5) {
               // Deep Liquid Ether (Dark Mode)
               // Base: Very dark blue/black
               vec3 c1 = vec3(0.02, 0.02, 0.05); 
               // Mid: Deep Indigo/Blue
               vec3 c2 = vec3(0.05, 0.1, 0.25);
               // Highlight: Vibrant Purple/Cyan mix
               vec3 c3 = vec3(0.15, 0.05, 0.35);
               
               color = mix(c1, c2, clamp(f*f*3.0, 0.0, 1.0));
               color = mix(color, c3, clamp(length(q), 0.0, 1.0));
               
               // Add subtle ethereal glow based on distortion
               color += vec3(0.0, 0.05, 0.2) * smoothstep(0.0, 0.6, r.x);
          } else {
               // Light Ether (Light Mode)
               // Base: Whiteish/Gray
               vec3 c1 = vec3(0.96, 0.96, 0.98); 
               // Mid: Soft Blue
               vec3 c2 = vec3(0.88, 0.92, 0.98); 
               // Highlight: Subtle Lavender
               vec3 c3 = vec3(0.90, 0.88, 0.95); 
               
               color = mix(c1, c2, clamp(f*f*2.0, 0.0, 1.0));
               color = mix(color, c3, clamp(length(q), 0.0, 1.0));
          }

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Full screen triangle
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      3, -1,
      -1, 3,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTimeLocation = gl.getUniformLocation(program, "u_time");
    const uResolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const uDarkLocation = gl.getUniformLocation(program, "u_dark");

    const render = () => {
      if (!gl) return;
      
      const width = canvas.width;
      const height = canvas.height;
      gl.viewport(0, 0, width, height);

      const time = (Date.now() - startTimeRef.current) * 0.0005; // Slower time for more "ether" feel

      gl.uniform1f(uTimeLocation, time);
      gl.uniform2f(uResolutionLocation, width, height);
      gl.uniform1f(uDarkLocation, isDark ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    };
    
    // Handle resize
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init size

    render();

    return () => {
        window.removeEventListener('resize', handleResize);
        // Clean up GL if needed (usually handled by browser on component unmount)
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-50 w-full h-full transition-opacity duration-1000" />;
};

export default LiquidEther;