import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Compass, Lock, RotateCcw } from 'lucide-react';
import { LearningIsland } from '../types';

interface LearningMap3DProps {
  islands: LearningIsland[];
  selectedIslandId: string;
  onSelectIsland: (id: string) => void;
  compact?: boolean;
}

const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _mouse = new THREE.Vector2();

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

function buildVoxelIslandGroup(island: LearningIsland, isSelected: boolean): {
  group: THREE.Group;
  beacon: THREE.Mesh;
  hitMesh: THREE.Mesh;
  floatingPart?: THREE.Object3D;
} {
  const group = new THREE.Group();
  const isLocked = island.status === 'locked';
  const isCompleted = island.status === 'completed';

  const baseStoneMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0xd8d1c7 : 0xe9dfd0,
    roughness: 0.85,
    metalness: 0.04,
  });
  const topSoilMat = new THREE.MeshStandardMaterial({
    color: isLocked
      ? 0xc8c1b7
      : island.level === 1
      ? 0x62c2b6
      : island.level === 2
      ? 0xf3a76a
      : island.level === 3
      ? 0xeec16d
      : island.level === 4
      ? 0xb595ee
      : island.level === 5
      ? 0x5ab9b0
      : 0xf97316,
    roughness: 0.72,
    metalness: 0.05,
  });
  const warmCreamMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0xded8cf : 0xfff8ef,
    roughness: 0.6,
    metalness: 0.05,
  });
  const orangeAccentMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0xb5aea4 : 0xf97316,
    roughness: 0.35,
    metalness: 0.12,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0xbab4ab : 0xf59e0b,
    roughness: 0.25,
    metalness: 0.72,
  });
  const purpleMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0xb7b1a9 : 0x9b72e7,
    roughness: 0.28,
    metalness: 0.3,
  });
  const tealMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0xaba59d : 0x48b8ae,
    roughness: 0.32,
    metalness: 0.18,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: isLocked ? 0x9a948c : 0x6b4f3a,
    roughness: 0.88,
    metalness: 0.02,
  });

  // 1. Stepped floating voxel island foundation (3-tier silhouette)
  const tierTop = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.32, 2.7), topSoilMat);
  tierTop.position.y = 0;
  tierTop.castShadow = true;
  tierTop.receiveShadow = true;
  group.add(tierTop);

  const tierMid = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 2.2), baseStoneMat);
  tierMid.position.y = -0.38;
  tierMid.castShadow = true;
  tierMid.receiveShadow = true;
  group.add(tierMid);

  const tierLow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.48, 1.4), baseStoneMat);
  tierLow.position.y = -0.82;
  tierLow.castShadow = true;
  group.add(tierLow);

  const tierTip = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.36, 0.68), baseStoneMat);
  tierTip.position.y = -1.2;
  group.add(tierTip);

  // Subtle selection ring frame flush on top terrace
  const ringMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xf97316 : isCompleted ? 0x48b8ae : 0xdccfc0,
    roughness: 0.35,
    metalness: 0.2,
    emissive: isSelected ? 0xf97316 : 0x000000,
    emissiveIntensity: isSelected ? 0.35 : 0,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.045, 8, 4), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI / 4;
  ring.position.y = 0.18;
  ring.name = 'selectionRing';
  group.add(ring);

  let floatingPart: THREE.Object3D | undefined;

  // 2. Domain-specific composite low-poly voxel structures per island level
  if (island.level === 1) {
    // Level 1: Coding Forest (3 multi-tier voxel pine trees + glowing orange campfire + code stone)
    const treeCoords: [number, number, number][] = [
      [-0.7, 0.16, -0.55],
      [0.68, 0.16, -0.45],
      [-0.55, 0.16, 0.65],
    ];
    treeCoords.forEach(([tx, ty, tz], idx) => {
      const tree = new THREE.Group();
      const scale = 0.85 + idx * 0.12;
      const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, 0.22), darkWoodMat);
      trunk.position.y = 0.275;
      trunk.castShadow = true;
      tree.add(trunk);
      const leaf1 = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 0.78), tealMat);
      leaf1.position.y = 0.66;
      leaf1.castShadow = true;
      tree.add(leaf1);
      const leaf2 = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.36, 0.54), topSoilMat);
      leaf2.position.y = 1.0;
      leaf2.castShadow = true;
      tree.add(leaf2);
      const leaf3 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.28), tealMat);
      leaf3.position.y = 1.28;
      tree.add(leaf3);
      tree.position.set(tx, ty, tz);
      tree.scale.setScalar(scale);
      group.add(tree);
    });
    // Campfire logs & flame crystal
    const fireBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.46), darkWoodMat);
    fireBase.position.set(0.2, 0.22, 0.45);
    group.add(fireBase);
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), orangeAccentMat);
    flame.position.set(0.2, 0.48, 0.45);
    group.add(flame);
    floatingPart = flame;
  } else if (island.level === 2) {
    // Level 2: Web Development Village (2 cream voxel cottages with pitched orange roofs + teal windows)
    const addCottage = (x: number, z: number, s: number, rotY: number) => {
      const house = new THREE.Group();
      const walls = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.78), warmCreamMat);
      walls.position.y = 0.325;
      walls.castShadow = true;
      house.add(walls);
      const roof1 = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.22, 0.92), orangeAccentMat);
      roof1.position.y = 0.72;
      roof1.castShadow = true;
      house.add(roof1);
      const roof2 = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.64), orangeAccentMat);
      roof2.position.y = 0.94;
      house.add(roof2);
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.82), tealMat);
      win.position.set(0.18, 0.36, 0);
      house.add(win);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.82), darkWoodMat);
      door.position.set(-0.22, 0.2, 0);
      house.add(door);
      house.position.set(x, 0.16, z);
      house.scale.setScalar(s);
      house.rotation.y = rotY;
      group.add(house);
    };
    addCottage(-0.42, -0.3, 1.0, 0.2);
    addCottage(0.55, 0.45, 0.78, -0.4);
    const signpost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.12), darkWoodMat);
    signpost.position.set(-0.65, 0.54, 0.62);
    group.add(signpost);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.1), tealMat);
    board.position.set(-0.65, 0.84, 0.62);
    group.add(board);
    floatingPart = board;
  } else if (island.level === 3) {
    // Level 3: Git & GitHub Workshop (workshop timber cabin + branching Git node sculpture)
    const hall = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.72, 0.95), warmCreamMat);
    hall.position.set(-0.42, 0.52, -0.35);
    hall.castShadow = true;
    group.add(hall);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.18, 1.08), goldMat);
    roof.position.set(-0.42, 0.96, -0.35);
    roof.castShadow = true;
    group.add(roof);
    // Branching Git commit totem
    const gitTotem = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.14), darkWoodMat);
    stem.position.y = 0.55;
    gitTotem.add(stem);
    const branchArm = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.12), orangeAccentMat);
    branchArm.position.set(0.24, 0.68, 0);
    gitTotem.add(branchArm);
    const nodeMain = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), orangeAccentMat);
    nodeMain.position.set(0, 1.15, 0);
    gitTotem.add(nodeMain);
    const nodeFeat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), tealMat);
    nodeFeat.position.set(0.48, 0.92, 0);
    gitTotem.add(nodeFeat);
    gitTotem.position.set(0.62, 0.16, 0.42);
    group.add(gitTotem);
    floatingPart = gitTotem;
  } else if (island.level === 4) {
    // Level 4: AI Innovation Mountain (stepped voxel peak + floating lavender neural crystal + orbit ring)
    const mtn1 = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.55, 1.75), baseStoneMat);
    mtn1.position.set(0, 0.43, -0.1);
    mtn1.castShadow = true;
    group.add(mtn1);
    const mtn2 = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.55, 1.18), baseStoneMat);
    mtn2.position.set(0, 0.96, -0.1);
    mtn2.castShadow = true;
    group.add(mtn2);
    const snowCap = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.34, 0.68), warmCreamMat);
    snowCap.position.set(0, 1.38, -0.1);
    group.add(snowCap);

    const crystalGroup = new THREE.Group();
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), purpleMat);
    crystal.castShadow = true;
    crystalGroup.add(crystal);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.045, 8, 24), orangeAccentMat);
    halo.rotation.x = Math.PI / 2.6;
    crystalGroup.add(halo);
    crystalGroup.position.set(0, 2.02, -0.1);
    group.add(crystalGroup);
    floatingPart = crystalGroup;
  } else if (island.level === 5) {
    // Level 5: Project Development City (cluster of 4 voxel skyline towers + skybridge)
    const towers: [number, number, number, number, THREE.Material][] = [
      [-0.55, -0.45, 0.65, 1.45, warmCreamMat],
      [0.45, -0.35, 0.6, 1.85, tealMat],
      [-0.45, 0.55, 0.58, 1.05, orangeAccentMat],
      [0.52, 0.52, 0.55, 1.28, warmCreamMat],
    ];
    towers.forEach(([x, z, w, h, mat]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
      b.position.set(x, 0.16 + h / 2, z);
      b.castShadow = true;
      group.add(b);
    });
    const skyBridge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.24), goldMat);
    skyBridge.position.set(-0.05, 1.25, -0.4);
    group.add(skyBridge);
    const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), goldMat);
    antenna.position.set(0.45, 2.24, -0.35);
    group.add(antenna);
    floatingPart = antenna;
  } else {
    // Level 6: Hackathon Champion Castle (4 corner turrets + central keep + golden crown + pennant)
    const keep = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.15, 1.35), warmCreamMat);
    keep.position.set(0, 0.74, 0);
    keep.castShadow = true;
    group.add(keep);

    const turretCoords: [number, number][] = [
      [-0.72, -0.72],
      [0.72, -0.72],
      [-0.72, 0.72],
      [0.72, 0.72],
    ];
    turretCoords.forEach(([tx, tz]) => {
      const turret = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.5, 0.42), warmCreamMat);
      turret.position.set(tx, 0.91, tz);
      turret.castShadow = true;
      group.add(turret);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.48), orangeAccentMat);
      cap.position.set(tx, 1.72, tz);
      group.add(cap);
    });

    const crownGroup = new THREE.Group();
    const crownBase = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 8, 6), goldMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), orangeAccentMat);
    jewel.position.y = 0.28;
    crownGroup.add(jewel);
    crownGroup.position.set(0, 1.92, 0);
    group.add(crownGroup);
    floatingPart = crownGroup;
  }

  // 3. Floating checkpoint diamond marker above each island
  const beaconMat = new THREE.MeshStandardMaterial({
    color: isCompleted ? 0x48b8ae : isLocked ? 0xbfb7ac : 0xf97316,
    roughness: 0.22,
    metalness: 0.35,
    emissive: isSelected ? 0xf97316 : isCompleted ? 0x2f9e94 : 0x000000,
    emissiveIntensity: isSelected ? 0.5 : isCompleted ? 0.25 : 0,
  });
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), beaconMat);
  beacon.position.set(0, 2.75, 0);
  beacon.castShadow = true;
  group.add(beacon);

  // 4. Invisible simplified proxy cylinder for reliable fast raycasting
  const hitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.75, 3.6, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.position.y = 0.8;
  hitMesh.userData.islandId = island.id;
  hitMesh.layers.set(1);
  group.add(hitMesh);

  group.position.set(island.position[0], island.position[1], island.position[2]);

  return { group, beacon, hitMesh, floatingPart };
}

export const LearningMap3D: React.FC<LearningMap3DProps> = ({
  islands,
  selectedIslandId,
  onSelectIsland,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dockOpen, setDockOpen] = useState(true);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const selectedIdRef = useRef(selectedIslandId);
  const onSelectRef = useRef(onSelectIsland);
  const islandsRef = useRef(islands);
  const cameraGoalRef = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; active: boolean }>({
    pos: new THREE.Vector3(0, 11.5, 19.5),
    target: new THREE.Vector3(0, 1.1, 0),
    active: false,
  });

  selectedIdRef.current = selectedIslandId;
  onSelectRef.current = onSelectIsland;
  islandsRef.current = islands;

  // Trigger smooth camera focus whenever selectedIslandId changes
  useEffect(() => {
    const targetIsland = islands.find((i) => i.id === selectedIslandId);
    if (!targetIsland) return;
    const [ix, iy, iz] = targetIsland.position;
    cameraGoalRef.current = {
      pos: new THREE.Vector3(ix * 0.82 + 2.4, iy + 6.4, iz + 9.2),
      target: new THREE.Vector3(ix, iy + 0.9, iz),
      active: true,
    };
  }, [selectedIslandId, islands]);

  const resetOverview = () => {
    cameraGoalRef.current = {
      pos: new THREE.Vector3(0.4, 10.5, 18.8),
      target: new THREE.Vector3(0.2, 1.1, 0),
      active: true,
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F5EFE5');
    scene.fog = new THREE.Fog('#F5EFE5', 24, 58);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 100);
    camera.position.set(0.4, 10.5, 18.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio environment map on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Balanced warm sun key + cool/warm hemisphere fill + rim light
    const hemi = new THREE.HemisphereLight(0xfffaf2, 0xd8c8b4, 1.15);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.85);
    keyLight.position.set(11, 18, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd9e8ff, 0.55);
    rimLight.position.set(-14, 9, -10);
    scene.add(rimLight);

    // Soft distant warm cloud voxel puffs for horizon depth
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7,
      roughness: 0.9,
      metalness: 0.0,
    });
    const cloudGroup = new THREE.Group();
    const cloudPositions: [number, number, number, number][] = [
      [-13, 5.2, -7.5, 1.2],
      [-3, 6.4, -9.2, 1.45],
      [7.5, 6.8, -8.4, 1.3],
      [14, 4.6, -4.5, 1.0],
    ];
    cloudPositions.forEach(([cx, cy, cz, sc]) => {
      const puff = new THREE.Group();
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 1.1), cloudMat);
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.48, 0.9), cloudMat);
      c2.position.set(0.3, 0.35, 0);
      puff.add(c1, c2);
      puff.position.set(cx, cy, cz);
      puff.scale.setScalar(sc);
      cloudGroup.add(puff);
    });
    scene.add(cloudGroup);

    // Build all 6 voxel islands
    const islandEntries: {
      id: string;
      name: string;
      baseY: number;
      group: THREE.Group;
      beacon: THREE.Mesh;
      floatingPart?: THREE.Object3D;
    }[] = [];
    const hitMeshes: THREE.Mesh[] = [];

    islandsRef.current.forEach((island) => {
      const built = buildVoxelIslandGroup(island, island.id === selectedIdRef.current);
      scene.add(built.group);
      hitMeshes.push(built.hitMesh);
      islandEntries.push({
        id: island.id,
        name: `Level ${island.level}: ${island.name}`,
        baseY: island.position[1],
        group: built.group,
        beacon: built.beacon,
        floatingPart: built.floatingPart,
      });
    });

    // Stepping-stone voxel bridges connecting consecutive islands
    const bridgeGroup = new THREE.Group();
    for (let i = 0; i < islandsRef.current.length - 1; i++) {
      const a = islandsRef.current[i];
      const b = islandsRef.current[i + 1];
      const unlockedPath = a.status !== 'locked' && b.status !== 'locked';
      const stepMat = new THREE.MeshStandardMaterial({
        color: unlockedPath ? 0xf97316 : 0xd9cfc1,
        roughness: 0.45,
        metalness: 0.1,
      });
      const steps = 4;
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1);
        const sx = THREE.MathUtils.lerp(a.position[0], b.position[0], t);
        const sy =
          THREE.MathUtils.lerp(a.position[1], b.position[1], t) + Math.sin(t * Math.PI) * 0.35;
        const sz = THREE.MathUtils.lerp(a.position[2], b.position[2], t);
        const stone = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.46), stepMat);
        stone.position.set(sx, sy - 0.08, sz);
        stone.castShadow = !isSoftwareGl;
        bridgeGroup.add(stone);
      }
    }
    scene.add(bridgeGroup);

    // Subtle ground haze shadow receiver plane far below archipelago
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(54, 34),
      new THREE.ShadowMaterial({ opacity: 0.08 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.4;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 7;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = Math.PI / 6;
    controls.target.set(0.2, 1.1, 0);
    controls.update();

    const cancelAutoCam = () => {
      cameraGoalRef.current.active = false;
    };
    controls.addEventListener('start', cancelAutoCam);

    // Raycaster on layer 1 (proxy hit boxes only)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let lastHoverTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updateMouseCoords = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Dragging orbit, not clicking
      updateMouseCoords(e);
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.islandId as string;
        if (hitId) {
          onSelectRef.current(hitId);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 60) return;
      lastHoverTime = now;
      updateMouseCoords(e);
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.islandId as string;
        const entry = islandEntries.find((ie) => ie.id === hitId);
        renderer.domElement.style.cursor = 'pointer';
        setHoveredName(entry ? entry.name : null);
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoveredName(null);
      }
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Resize observer
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

      // Gentle island bobbing & rotating beacons
      islandEntries.forEach((entry, idx) => {
        const isSel = entry.id === selectedIdRef.current;
        if (!prefersReduced) {
          entry.group.position.y = entry.baseY + Math.sin(elapsed * 1.15 + idx * 0.9) * 0.09;
          entry.beacon.rotation.y = elapsed * (isSel ? 2.1 : 1.0);
          entry.beacon.position.y = 2.65 + Math.sin(elapsed * 2.4 + idx) * 0.14;
          if (entry.floatingPart && idx >= 3) {
            entry.floatingPart.rotation.y = elapsed * 0.55;
          }
        }
        const ringObj = entry.group.getObjectByName('selectionRing') as THREE.Mesh | undefined;
        if (ringObj && ringObj.material instanceof THREE.MeshStandardMaterial) {
          ringObj.material.emissiveIntensity = isSel ? 0.55 : 0;
        }
      });

      if (!prefersReduced) {
        cloudGroup.position.x = Math.sin(elapsed * 0.15) * 0.9;
      }

      // Smooth exponential camera fly-to
      if (cameraGoalRef.current.active) {
        _targetCamPos.copy(cameraGoalRef.current.pos);
        _targetLookAt.copy(cameraGoalRef.current.target);
        const lambda = 4.6;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, lambda, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, lambda, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, lambda, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, lambda, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, lambda, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, lambda, delta);

        if (
          camera.position.distanceTo(_targetCamPos) < 0.08 &&
          controls.target.distanceTo(_targetLookAt) < 0.08
        ) {
          cameraGoalRef.current.active = false;
        }
      }

      controls.update();
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
      controls.removeEventListener('start', cancelAutoCam);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      envTarget.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [islands.map((i) => i.status).join(',')]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[22px] border border-[#E8DED2] bg-[#F5EFE5] ${
        compact ? 'h-[310px]' : 'h-[430px] md:h-[490px]'
      }`}
    >
      {/* Dedicated WebGL Mount */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Minimal Top-Left World Label (solid surface, zero backdrop-blur over WebGL) */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 flex items-center gap-2.5 bg-[#FFFCF8] border border-[#E8DED2] rounded-xl px-3.5 py-2 shadow-sm">
        <Compass size={16} className="text-[#F97316]" />
        <div className="leading-tight">
          <p className="text-xs font-semibold text-[#191919]">ARGON 3D Learning Archipelago</p>
          <p className="text-[11px] text-[#77716B]">
            {hoveredName ? hoveredName : 'Click any voxel island or drag to orbit'}
          </p>
        </div>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero viewport side occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[95%] flex flex-col items-center z-10">
        <button
          type="button"
          onClick={() => setDockOpen((v) => !v)}
          className="mb-1.5 px-3 py-1 rounded-full bg-[#FFFCF8] border border-[#E8DED2] text-[11px] font-medium text-[#5F5851] hover:text-[#191919] flex items-center gap-1 shadow-sm transition-colors whitespace-nowrap"
        >
          {dockOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          {dockOpen ? 'Hide Map Controls' : 'Show Map Controls'}
        </button>

        {dockOpen && (
          <div className="bg-[#FFFCF8] border border-[#E8DED2] rounded-2xl p-1.5 shadow-md flex items-center gap-1 overflow-x-auto max-w-full">
            {islands.map((island) => {
              const isSelected = island.id === selectedIslandId;
              const isLocked = island.status === 'locked';
              return (
                <button
                  key={island.id}
                  type="button"
                  onClick={() => onSelectIsland(island.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#F97316] text-white shadow-sm'
                      : 'text-[#5F5851] hover:bg-[#F3ECE1] hover:text-[#191919]'
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-85">L{island.level}</span>
                  <span>{island.name.split(' ')[0]}</span>
                  {isLocked && <Lock size={11} className="opacity-70" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={resetOverview}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#77716B] hover:bg-[#F3ECE1] hover:text-[#191919] flex items-center gap-1 whitespace-nowrap shrink-0 border-l border-[#E8DED2] ml-0.5 pl-2.5"
              title="Reset full archipelago camera view"
            >
              <RotateCcw size={12} />
              <span>Overview</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
