import React, { useRef, useEffect, useMemo } from 'react';

const GrainOverlay = ({
  intensity = 0.1,
  speed = 1,
  blendMode = 'multiply',
  className = '',
  style = {},
  children,
  variant = 'film', // 'film', 'paper', 'canvas', 'digital', 'vintage'
  animated = true,
  zIndex = 1000,
  grainSize = 1.0,
  contrast = 1.2,
  brightness = 0.0,
  colorTint = [1.0, 1.0, 1.0],
  ...props
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Vertex shader - positions the grain overlay
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Fragment shader - generates the grain effect
  const fragmentShaderSource = useMemo(() => `
    precision highp float;
    
    uniform float u_time;
    uniform float u_intensity;
    uniform float u_grainSize;
    uniform float u_contrast;
    uniform float u_brightness;
    uniform vec3 u_colorTint;
    uniform vec2 u_resolution;
    uniform int u_variant;
    
    varying vec2 v_texCoord;
    
    // High-quality noise functions
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 0.0;
      
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    // Film grain simulation
    float filmGrain(vec2 uv, float time) {
      vec2 grain_uv = uv * u_grainSize * 800.0;
      grain_uv += vec2(sin(time * 0.1) * 10.0, cos(time * 0.13) * 8.0);
      
      float grain = random(grain_uv + time * 0.01);
      grain = mix(grain, fbm(grain_uv * 0.1), 0.3);
      
      // Add film scratches
      float scratch = smoothstep(0.99, 1.0, random(vec2(uv.y + time * 0.001, 0.0)));
      grain += scratch * 0.3;
      
      // Add dust particles
      vec2 dust_uv = uv * 50.0 + time * 0.02;
      float dust = smoothstep(0.98, 1.0, random(dust_uv)) * 0.2;
      grain += dust;
      
      return grain;
    }
    
    // Paper texture simulation
    float paperGrain(vec2 uv, float time) {
      vec2 paper_uv = uv * u_grainSize * 400.0;
      
      float fiber1 = fbm(paper_uv + time * 0.005);
      float fiber2 = fbm(paper_uv * 1.3 + vec2(100.0) + time * 0.003);
      float fiber3 = fbm(paper_uv * 0.7 + vec2(200.0) + time * 0.007);
      
      float paper = (fiber1 + fiber2 * 0.7 + fiber3 * 0.5) / 2.2;
      
      // Add paper texture variations
      float texture = noise(uv * 200.0 * u_grainSize) * 0.1;
      paper += texture;
      
      return paper;
    }
    
    // Canvas texture simulation
    float canvasGrain(vec2 uv, float time) {
      vec2 canvas_uv = uv * u_grainSize * 300.0;
      
      // Weave pattern
      float warp = sin(canvas_uv.x * 20.0) * 0.02;
      float weft = sin(canvas_uv.y * 20.0) * 0.02;
      float weave = warp + weft;
      
      // Canvas fiber texture
      float fiber = fbm(canvas_uv + time * 0.002);
      float bump = noise(canvas_uv * 2.0) * 0.1;
      
      return (fiber + weave + bump) * 0.8;
    }
    
    // Digital noise simulation
    float digitalGrain(vec2 uv, float time) {
      vec2 digital_uv = uv * u_grainSize * 1000.0;
      digital_uv += time * 0.1;
      
      // RGB channel noise
      float r_noise = random(digital_uv + vec2(0.0, 0.0));
      float g_noise = random(digital_uv + vec2(1.0, 0.0));
      float b_noise = random(digital_uv + vec2(0.0, 1.0));
      
      float digital = (r_noise + g_noise + b_noise) / 3.0;
      
      // Add scanline effect
      float scanline = sin(uv.y * u_resolution.y * 2.0) * 0.02;
      digital += scanline;
      
      return digital;
    }
    
    // Vintage film grain with color shifts
    float vintageGrain(vec2 uv, float time) {
      vec2 vintage_uv = uv * u_grainSize * 600.0;
      vintage_uv += vec2(sin(time * 0.05) * 5.0, cos(time * 0.07) * 3.0);
      
      float grain = random(vintage_uv + time * 0.008);
      grain = mix(grain, fbm(vintage_uv * 0.2), 0.4);
      
      // Add vignette effect
      float vignette = distance(uv, vec2(0.5)) * 1.4;
      vignette = 1.0 - smoothstep(0.3, 1.2, vignette);
      grain *= vignette;
      
      // Add color separation
      float separation = sin(uv.x * 100.0 + time * 0.1) * 0.01;
      grain += separation;
      
      return grain;
    }
    
    void main() {
      vec2 uv = v_texCoord;
      float time = u_time;
      float grain = 0.0;
      
      // Select grain type based on variant
      if (u_variant == 0) {
        grain = filmGrain(uv, time);
      } else if (u_variant == 1) {
        grain = paperGrain(uv, time);
      } else if (u_variant == 2) {
        grain = canvasGrain(uv, time);
      } else if (u_variant == 3) {
        grain = digitalGrain(uv, time);
      } else if (u_variant == 4) {
        grain = vintageGrain(uv, time);
      }
      
      // Apply contrast and brightness
      grain = (grain - 0.5) * u_contrast + 0.5 + u_brightness;
      grain = clamp(grain, 0.0, 1.0);
      
      // Apply color tinting
      vec3 grainColor = vec3(grain) * u_colorTint;
      
      // Output with intensity control
      gl_FragColor = vec4(grainColor, u_intensity);
    }
  `, []);

  const variantMap = {
    film: 0,
    paper: 1,
    canvas: 2,
    digital: 3,
    vintage: 4
  };

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: false 
    });
    
    if (!gl) {
      console.warn('WebGL not supported, falling back to canvas');
      return;
    }

    glRef.current = gl;

    // Create shader
    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    // Create program
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vertexShaderSource, fragmentShaderSource]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      if (glRef.current) {
        glRef.current.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Render loop
  useEffect(() => {
    const render = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;
      
      if (!gl || !program || !canvas) return;

      const currentTime = animated ? (Date.now() - startTimeRef.current) / 1000 * speed : 0;

      gl.useProgram(program);
      
      // Set uniforms
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
      const grainSizeLocation = gl.getUniformLocation(program, 'u_grainSize');
      const contrastLocation = gl.getUniformLocation(program, 'u_contrast');
      const brightnessLocation = gl.getUniformLocation(program, 'u_brightness');
      const colorTintLocation = gl.getUniformLocation(program, 'u_colorTint');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const variantLocation = gl.getUniformLocation(program, 'u_variant');

      gl.uniform1f(timeLocation, currentTime);
      gl.uniform1f(intensityLocation, intensity);
      gl.uniform1f(grainSizeLocation, grainSize);
      gl.uniform1f(contrastLocation, contrast);
      gl.uniform1f(brightnessLocation, brightness);
      gl.uniform3fv(colorTintLocation, colorTint);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1i(variantLocation, variantMap[variant] || 0);

      // Clear and draw
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (animated) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, speed, grainSize, contrast, brightness, colorTint, variant, animated]);

  const canvasStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex,
    mixBlendMode: blendMode,
    ...style,
  };

  return (
    <div className={`grain-overlay ${className}`} {...props}>
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        className="grain-canvas"
      />
      {children}
    </div>
  );
};

export default GrainOverlay;