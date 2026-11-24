import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createRoundedBoxShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createCodeScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Dark warm charcoal screen with soft amber-orange center glow matching reference
  const bg = ctx.createRadialGradient(256, 155, 18, 256, 160, 260);
  bg.addColorStop(0, '#5A3A24');
  bg.addColorStop(0.45, '#35271F');
  bg.addColorStop(1, '#231D1A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 320);

  // Subtle top specular diagonal reflection
  const sheen = ctx.createLinearGradient(0, 0, 320, 220);
  sheen.addColorStop(0, 'rgba(255,244,230,0.14)');
  sheen.addColorStop(0.5, 'rgba(255,244,230,0.03)');
  sheen.addColorStop(1, 'rgba(255,244,230,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 512, 320);

  // Soft orange glow halo behind </>
  const halo = ctx.createRadialGradient(256, 160, 6, 256, 160, 120);
  halo.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
  halo.addColorStop(0.6, 'rgba(249, 115, 22, 0.12)');
  halo.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 512, 320);

  // Crisp glowing </> strokes
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(249, 115, 22, 0.85)';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = '#FF9B42';
  ctx.lineWidth = 17;

  // Left chevron <
  ctx.beginPath();
  ctx.moveTo(212, 118);
  ctx.lineTo(162, 160);
  ctx.lineTo(212, 202);
  ctx.stroke();

  // Right chevron >
  ctx.beginPath();
  ctx.moveTo(300, 118);
  ctx.lineTo(350, 160);
  ctx.lineTo(300, 202);
  ctx.stroke();

  // Center slash /
  ctx.beginPath();
  ctx.moveTo(274, 108);
  ctx.lineTo(238, 212);
  ctx.stroke();

  // Bright warm core highlight on </>
  ctx.shadowBlur = 4;
  ctx.strokeStyle = '#FFE4BE';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(212, 118);
  ctx.lineTo(162, 160);
  ctx.lineTo(212, 202);
  ctx.moveTo(300, 118);
  ctx.lineTo(350, 160);
  ctx.lineTo(300, 202);
  ctx.moveTo(274, 108);
  ctx.lineTo(238, 212);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSoftShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(130, 88, 42, 0.36)');
  grad.addColorStop(0.55, 'rgba(130, 88, 42, 0.14)');
  grad.addColorStop(1, 'rgba(130, 88, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const HeroLaptop3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 60);
    camera.position.set(0.1, 1.35, 6.2);
    camera.lookAt(0, 0.08, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio environment reflection for glass, satin aluminum & gold trophy
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    // Warm sunlit studio 3-point lighting rig
    const hemi = new THREE.HemisphereLight(0xfffaf2, 0xf2dec5, 1.25);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.0);
    keyLight.position.set(4.5, 6.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffcf99, 0.9);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    rootGroup.position.set(0.08, -0.18, 0);
    scene.add(rootGroup);

    // --- 1. ROUND WARM-CREAM STEPPED PEDESTAL ---
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf7e3c5,
      roughness: 0.58,
      metalness: 0.05,
    });
    const pedestalTopMat = new THREE.MeshStandardMaterial({
      color: 0xfef4e4,
      roughness: 0.42,
      metalness: 0.06,
    });

    const pedestalGroup = new THREE.Group();
    const pedBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.56, 1.62, 0.48, 48),
      pedestalMat
    );
    pedBase.position.y = -0.62;
    pedBase.receiveShadow = true;
    pedBase.castShadow = true;
    pedestalGroup.add(pedBase);

    const pedTopCap = new THREE.Mesh(
      new THREE.CylinderGeometry(1.52, 1.56, 0.08, 48),
      pedestalTopMat
    );
    pedTopCap.position.y = -0.35;
    pedTopCap.receiveShadow = true;
    pedestalGroup.add(pedTopCap);

    // Soft contact shadow directly under laptop on pedestal top
    const shadowTex = createSoftShadowTexture();
    const laptopShadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.35, 1.55),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      })
    );
    laptopShadowPlane.rotation.x = -Math.PI / 2;
    laptopShadowPlane.position.set(0.02, -0.305, 0.12);
    pedestalGroup.add(laptopShadowPlane);

    rootGroup.add(pedestalGroup);

    // --- 2. COMPOSITE 3D SLEEK LAPTOP (Multi-part bevelled aluminum + cream clay + glowing </> screen) ---
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.05, -0.26, 0.08);
    laptopGroup.rotation.y = -0.18;

    const bodyCreamMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbf5ec,
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    });
    const silverTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd9cfc4,
      roughness: 0.26,
      metalness: 0.65,
    });
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0xe6dac9,
      roughness: 0.55,
      metalness: 0.08,
    });
    const darkBezelMat = new THREE.MeshStandardMaterial({
      color: 0x26211e,
      roughness: 0.24,
      metalness: 0.22,
    });

    // Extruded rounded base chassis
    const baseShape = createRoundedBoxShape(1.96, 1.32, 0.12);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelThickness: 0.028,
      bevelSize: 0.025,
      bevelSegments: 4,
    });
    baseGeo.rotateX(Math.PI / 2);
    const laptopBase = new THREE.Mesh(baseGeo, bodyCreamMat);
    laptopBase.position.y = 0.08;
    laptopBase.castShadow = true;
    laptopBase.receiveShadow = true;
    laptopGroup.add(laptopBase);

    // Subtle front thumb notch
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.06), silverTrimMat);
    notch.position.set(0, 0.07, 0.66);
    laptopGroup.add(notch);

    // Recessed keyboard well + instanced keycaps
    const keyWell = new THREE.Mesh(
      new THREE.BoxGeometry(1.58, 0.015, 0.62),
      new THREE.MeshStandardMaterial({ color: 0xdfd3c3, roughness: 0.65 })
    );
    keyWell.position.set(0, 0.11, -0.14);
    laptopGroup.add(keyWell);

    const keyGeo = new THREE.BoxGeometry(0.11, 0.022, 0.095);
    const rows = 4;
    const cols = 11;
    const keysMesh = new THREE.InstancedMesh(keyGeo, keyMat, rows * cols);
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(-0.68 + c * 0.136, 0.122, -0.34 + r * 0.13);
        dummy.updateMatrix();
        keysMesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    keysMesh.computeBoundingSphere();
    laptopGroup.add(keysMesh);

    // Trackpad
    const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.012, 0.32), silverTrimMat);
    trackpad.position.set(0, 0.112, 0.37);
    laptopGroup.add(trackpad);

    // Hinged Display Lid Group
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.11, -0.62);
    lidPivot.rotation.x = -0.24; // Crisp open laptop angle facing viewer

    const lidShape = createRoundedBoxShape(1.94, 1.32, 0.1);
    const lidGeo = new THREE.ExtrudeGeometry(lidShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 4,
    });
    const lidShell = new THREE.Mesh(lidGeo, silverTrimMat);
    lidShell.position.set(0, 0.68, -0.055);
    lidShell.castShadow = true;
    lidPivot.add(lidShell);

    const bezelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.25, 0.018), darkBezelMat);
    bezelMesh.position.set(0, 0.68, 0.015);
    lidPivot.add(bezelMesh);

    // Glowing </> Screen Display
    const screenTex = createCodeScreenTexture();
    screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0xff8c38,
      emissiveMap: screenTex,
      emissiveIntensity: 0.62,
      roughness: 0.18,
      metalness: 0.08,
    });
    const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.76, 1.13), screenMat);
    screenPlane.position.set(0, 0.68, 0.027);
    lidPivot.add(screenPlane);

    // Subtle hinge cylinder
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 1.48, 16), darkBezelMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.02, -0.01);
    lidPivot.add(hinge);

    laptopGroup.add(lidPivot);
    rootGroup.add(laptopGroup);

    // --- 3. FLOATING FROSTED-GLASS TROPHY TILE (Top-Left, exact match to screenshot) ---
    const glassTileMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff5e8,
      roughness: 0.16,
      metalness: 0.04,
      transmission: isSoftwareGl ? 0 : 0.42,
      transparent: true,
      opacity: isSoftwareGl ? 0.86 : 0.94,
      thickness: 0.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });

    const goldTrophyMat = new THREE.MeshStandardMaterial({
      color: 0xf6a924,
      roughness: 0.22,
      metalness: 0.72,
      emissive: 0xd97706,
      emissiveIntensity: 0.12,
    });

    const trophyTile = new THREE.Group();
    trophyTile.position.set(-1.72, 0.86, 0.24);
    trophyTile.rotation.set(0.06, 0.26, 0.12);

    const tileShape = createRoundedBoxShape(1.12, 1.12, 0.24);
    const tileGeo = new THREE.ExtrudeGeometry(tileShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.045,
      bevelSegments: 5,
    });
    const trophyBack = new THREE.Mesh(tileGeo, glassTileMat);
    trophyBack.position.z = -0.07;
    trophyBack.castShadow = true;
    trophyTile.add(trophyBack);

    // Multi-part sculpted 3D Golden Trophy inside tile
    const trophyObj = new THREE.Group();
    trophyObj.position.set(0, -0.04, 0.13);
    const cupProfile = [
      new THREE.Vector2(0.0, -0.18),
      new THREE.Vector2(0.18, -0.18),
      new THREE.Vector2(0.14, -0.12),
      new THREE.Vector2(0.06, -0.08),
      new THREE.Vector2(0.055, 0.04),
      new THREE.Vector2(0.24, 0.14),
      new THREE.Vector2(0.27, 0.34),
      new THREE.Vector2(0.22, 0.34),
      new THREE.Vector2(0.18, 0.14),
      new THREE.Vector2(0.0, 0.08),
    ];
    const cupMesh = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 24), goldTrophyMat);
    cupMesh.position.y = -0.06;
    cupMesh.castShadow = true;
    trophyObj.add(cupMesh);

    const handleGeo = new THREE.TorusGeometry(0.11, 0.032, 10, 20, Math.PI * 1.15);
    const leftHandle = new THREE.Mesh(handleGeo, goldTrophyMat);
    leftHandle.position.set(-0.24, 0.16, 0);
    leftHandle.rotation.z = Math.PI * 0.55;
    trophyObj.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldTrophyMat);
    rightHandle.position.set(0.24, 0.16, 0);
    rightHandle.rotation.z = -Math.PI * 0.55;
    rightHandle.rotation.y = Math.PI;
    trophyObj.add(rightHandle);

    trophyTile.add(trophyObj);
    rootGroup.add(trophyTile);

    // --- 4. FLOATING FROSTED-GLASS TEAM ICON TILE (Right side, exact match to screenshot) ---
    const teamTile = new THREE.Group();
    teamTile.position.set(1.76, 0.16, 0.45);
    teamTile.rotation.set(-0.04, -0.32, -0.08);

    const teamTileShape = createRoundedBoxShape(1.0, 1.0, 0.22);
    const teamTileGeo = new THREE.ExtrudeGeometry(teamTileShape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 5,
    });
    const teamBack = new THREE.Mesh(teamTileGeo, glassTileMat);
    teamBack.position.z = -0.065;
    teamBack.castShadow = true;
    teamTile.add(teamBack);

    const purpleFrontMat = new THREE.MeshStandardMaterial({
      color: 0x9b72e7,
      roughness: 0.34,
      metalness: 0.1,
    });
    const purpleBackMat = new THREE.MeshStandardMaterial({
      color: 0xae88f2,
      roughness: 0.38,
      metalness: 0.08,
    });

    // Two sculpted 3D clay team silhouettes
    const person1 = new THREE.Group();
    const head1 = new THREE.Mesh(new THREE.SphereGeometry(0.125, 20, 20), purpleFrontMat);
    head1.position.set(-0.08, 0.14, 0.15);
    const body1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      purpleFrontMat
    );
    body1.scale.set(1.05, 0.95, 0.6);
    body1.position.set(-0.08, -0.22, 0.15);
    person1.add(head1, body1);

    const person2 = new THREE.Group();
    const head2 = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 20), purpleBackMat);
    head2.position.set(0.16, 0.11, 0.12);
    const body2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.175, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      purpleBackMat
    );
    body2.scale.set(1.0, 0.9, 0.55);
    body2.position.set(0.16, -0.22, 0.12);
    person2.add(head2, body2);

    teamTile.add(person1, person2);
    rootGroup.add(teamTile);

    // --- 5. SUBTLE GLOWING ARCHITECTURAL BACKGROUND ARCHES (Right Backdrop) ---
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xfff3e2,
      roughness: 0.45,
      metalness: 0.05,
      transparent: true,
      opacity: 0.65,
    });
    const archOuter = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.055, 12, 48, Math.PI),
      archMat
    );
    archOuter.position.set(0.55, -0.82, -1.25);
    rootGroup.add(archOuter);

    const archInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.04, 12, 40, Math.PI),
      archMat
    );
    archInner.position.set(0.55, -0.82, -1.05);
    rootGroup.add(archInner);

    // Pointer parallax listener on parent hero section
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    const handlePointerLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      if (!prefersReduced) {
        // Gentle levitation for floating 3D elements
        laptopGroup.position.y = -0.25 + Math.sin(elapsed * 1.4) * 0.035;
        trophyTile.position.y = 0.86 + Math.sin(elapsed * 1.65 + 0.8) * 0.065;
        trophyTile.rotation.z = 0.12 + Math.sin(elapsed * 1.1) * 0.035;
        teamTile.position.y = 0.16 + Math.sin(elapsed * 1.5 + 2.1) * 0.055;
        teamTile.rotation.z = -0.08 + Math.cos(elapsed * 1.2) * 0.03;

        // Smooth interactive 3D parallax tilt following cursor
        const targetRotY = pointerRef.current.x * 0.16;
        const targetRotX = pointerRef.current.y * 0.07;
        rootGroup.rotation.y = THREE.MathUtils.damp(rootGroup.rotation.y, targetRotY, 4.5, delta);
        rootGroup.rotation.x = THREE.MathUtils.damp(rootGroup.rotation.x, targetRotX, 4.5, delta);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      envTarget.dispose();
      screenTex.dispose();
      shadowTex.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[215px] sm:h-[235px] lg:h-[245px] relative select-none"
      aria-label="Interactive 3D laptop with glowing code symbol, floating golden trophy tile, and purple team icon tile"
    />
  );
};
