import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { KoiGame, DIRECTIONS, type Cell, type Direction } from "./koiGame";

export type GameHandle = { scene: Scene; dispose: () => void };

type Ripple = { mesh: Mesh; age: number; active: boolean };

const KOI_URL = "/manus-storage/koi-fish-cutout_5e00a860.png";
const CELL_SIZE = 1;
const WATER_Y = 0;
const CELL_W = 18;
const CELL_H = 14;

function mat(scene: Scene, name: string, diffuse: string, alpha = 1) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(diffuse);
  material.specularColor = new Color3(0.05, 0.1, 0.08);
  material.alpha = alpha;
  material.backFaceCulling = false;
  return material;
}

function cellToWorld(cell: Cell) {
  return new Vector3((cell.x - CELL_W / 2 + 0.5) * CELL_SIZE, WATER_Y + 0.12, (cell.z - CELL_H / 2 + 0.5) * CELL_SIZE);
}

function addBox(scene: Scene, name: string, position: Vector3, scale: Vector3, material: StandardMaterial) {
  const box = MeshBuilder.CreateBox(name, { width: scale.x, height: scale.y, depth: scale.z }, scene);
  box.position = position;
  box.material = material;
  return box;
}

function addGarden(scene: Scene) {
  const sand = mat(scene, "raked sand", "#d8c7a2");
  const water = mat(scene, "jade water", "#0c6e66");
  const waterShimmer = mat(scene, "water shimmer", "#6dc8ae", 0.16);
  const wood = mat(scene, "cedar frame", "#3b2418");
  const woodHighlight = mat(scene, "cedar highlight", "#725039");
  const stone = mat(scene, "river stone", "#68695c");
  const leaf = mat(scene, "maple leaf", "#c9543f");
  const pad = mat(scene, "lily pad", "#3d8b5f");
  const blossom = mat(scene, "lotus blossom", "#f2a1a0");

  addBox(scene, "sand garden", new Vector3(0, -0.24, 0), new Vector3(22, 0.2, 18), sand);
  addBox(scene, "pond", new Vector3(0, WATER_Y, 0), new Vector3(CELL_W + 0.2, 0.18, CELL_H + 0.2), water);
  addBox(scene, "frame north", new Vector3(0, 0.2, -8), new Vector3(22, 0.55, 0.55), wood);
  addBox(scene, "frame south", new Vector3(0, 0.2, 8), new Vector3(22, 0.55, 0.55), wood);
  addBox(scene, "frame west", new Vector3(-10, 0.2, 0), new Vector3(0.55, 0.55, 15.5), wood);
  addBox(scene, "frame east", new Vector3(10, 0.2, 0), new Vector3(0.55, 0.55, 15.5), wood);

  const grid = mat(scene, "etched grid", "#9ae0bf", 0.16);
  for (let x = 0; x <= CELL_W; x += 1) {
    addBox(scene, `grid-x-${x}`, new Vector3(x - CELL_W / 2, 0.105, 0), new Vector3(0.018, 0.012, CELL_H), grid);
  }
  for (let z = 0; z <= CELL_H; z += 1) {
    addBox(scene, `grid-z-${z}`, new Vector3(0, 0.11, z - CELL_H / 2), new Vector3(CELL_W, 0.012, 0.018), grid);
  }
  for (let i = 0; i < 18; i += 1) {
    const x = -8.8 + ((i * 7) % 17) + (i % 3) * 0.2;
    const z = -7.2 + ((i * 5) % 14) * 0.9;
    const shimmer = MeshBuilder.CreateDisc(`shimmer-${i}`, { radius: 0.6 + (i % 3) * 0.25, tessellation: 32 }, scene);
    shimmer.rotation.x = Math.PI / 2;
    shimmer.position = new Vector3(x, 0.125, z);
    shimmer.material = waterShimmer;
  }

  const stones = [
    [-9.1, -6.8, 0.75], [-9.25, 6.7, 0.9], [9.2, 6.4, 0.7], [8.9, -6.4, 0.62],
    [-9.4, -4.7, 0.45], [9.45, 4.8, 0.5], [-8.8, 5.2, 0.42], [8.8, -4.4, 0.4],
  ];
  stones.forEach(([x, z, radius], i) => {
    const rock = MeshBuilder.CreateSphere(`rock-${i}`, { diameter: radius * 2, segments: 12 }, scene);
    rock.position = new Vector3(x, 0.05, z);
    rock.scaling.y = 0.65;
    rock.material = stone;
  });

  const bamboo = mat(scene, "bamboo", "#6d8c55");
  [-9.65, 9.65].forEach((x, side) => {
    for (let i = 0; i < 3; i += 1) {
      const stalk = MeshBuilder.CreateCylinder(`bamboo-${side}-${i}`, { height: 4.8 + i * 0.5, diameter: 0.16, tessellation: 12 }, scene);
      stalk.position = new Vector3(x + (side === -9.65 ? i * 0.32 : -i * 0.32), 1.8, -4 + i * 3.6);
      stalk.material = bamboo;
      for (let ring = 0; ring < 4; ring += 1) {
        const node = MeshBuilder.CreateTorus(`bamboo-node-${side}-${i}-${ring}`, { diameter: 0.19, thickness: 0.035, tessellation: 10 }, scene);
        node.position = new Vector3(stalk.position.x, 0.55 + ring * 1.05, stalk.position.z);
        node.rotation.x = Math.PI / 2;
        node.material = bamboo;
      }
    }
  });

  const pads = [
    [-7.4, -5.6, 0.8], [-6.1, -5.2, 0.55], [7.2, 5.3, 0.9], [6.1, 5.8, 0.6],
    [7.6, 4.4, 0.45], [-7.4, 5.7, 0.48],
  ];
  pads.forEach(([x, z, radius], i) => {
    const lily = MeshBuilder.CreateDisc(`lily-${i}`, { radius, tessellation: 24 }, scene);
    lily.rotation.x = Math.PI / 2;
    lily.position = new Vector3(x, 0.18, z);
    lily.material = pad;
    const notch = MeshBuilder.CreateBox(`lily-notch-${i}`, { width: radius * 0.72, height: 0.02, depth: radius * 0.25 }, scene);
    notch.position = new Vector3(x + radius * 0.3, 0.195, z);
    notch.material = water;
  });

  [[-6.3, -6.1], [6.8, 5.85]].forEach(([x, z], i) => {
    const center = new Vector3(x, 0.2, z);
    for (let petal = 0; petal < 6; petal += 1) {
      const flower = MeshBuilder.CreateSphere(`blossom-${i}-${petal}`, { diameter: 0.35, segments: 12 }, scene);
      flower.position = center.add(new Vector3(Math.cos((petal / 6) * Math.PI * 2) * 0.28, 0.04, Math.sin((petal / 6) * Math.PI * 2) * 0.28));
      flower.scaling = new Vector3(1, 0.2, 1.45);
      flower.material = blossom;
    }
  });

  for (let i = 0; i < 10; i += 1) {
    const maple = MeshBuilder.CreateDisc(`maple-${i}`, { radius: 0.12 + (i % 3) * 0.04, tessellation: 5 }, scene);
    maple.rotation.x = Math.PI / 2;
    maple.position = new Vector3(-9 + (i * 2.3) % 18, 0.16, -7.4 + (i * 3.1) % 14);
    maple.material = leaf;
  }

  const accent = mat(scene, "wood accent", "#b18458", 0.72);
  addBox(scene, "frame inner north", new Vector3(0, 0.5, -7.67), new Vector3(18.5, 0.04, 0.06), accent);
  addBox(scene, "frame inner south", new Vector3(0, 0.5, 7.67), new Vector3(18.5, 0.04, 0.06), accent);
}

function createFood(scene: Scene) {
  const gold = mat(scene, "lotus gold", "#ffd36d");
  const glow = mat(scene, "lotus glow", "#ffe8a5", 0.62);
  const root = new Mesh("lotus food", scene);
  const center = MeshBuilder.CreateSphere("lotus center", { diameter: 0.3, segments: 16 }, scene);
  center.parent = root;
  center.material = gold;
  for (let i = 0; i < 5; i += 1) {
    const petal = MeshBuilder.CreateSphere(`lotus petal-${i}`, { diameter: 0.55, segments: 12 }, scene);
    petal.parent = root;
    petal.position = new Vector3(Math.cos((i / 5) * Math.PI * 2) * 0.28, 0, Math.sin((i / 5) * Math.PI * 2) * 0.28);
    petal.scaling = new Vector3(0.7, 0.12, 1.25);
    petal.material = gold;
  }
  const halo = MeshBuilder.CreateTorus("lotus halo", { diameter: 1.12, thickness: 0.03, tessellation: 32 }, scene);
  halo.parent = root;
  halo.rotation.x = Math.PI / 2;
  halo.material = glow;
  return root;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.045, 0.075, 0.07, 1);
  const camera = new ArcRotateCamera("overhead camera", -Math.PI / 2, 0.1, 22, Vector3.Zero(), scene);
  camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
  camera.lowerRadiusLimit = 22;
  camera.upperRadiusLimit = 22;
  camera.orthoTop = 9.15;
  camera.orthoBottom = -9.15;
  camera.orthoLeft = -12.2;
  camera.orthoRight = 12.2;
  camera.inputs.clear();
  camera.attachControl(canvas, false);
  const light = new HemisphericLight("soft garden light", new Vector3(0, 1, 0), scene);
  light.intensity = 1.15;
  light.diffuse = new Color3(0.9, 1, 0.92);
  light.groundColor = new Color3(0.04, 0.15, 0.13);

  addGarden(scene);

  const game = new KoiGame(CELL_W, CELL_H, new URLSearchParams(window.location.search).has("demo"));
  const bodyMaterial = mat(scene, "ivory koi body", "#f5ead4");
  const orangeMaterial = mat(scene, "koi vermilion", "#df5b2b");
  const inkMaterial = mat(scene, "koi ink", "#2e2723");
  const headMaterial = new StandardMaterial("generated koi head", scene);
  const headTexture = new Texture(KOI_URL, scene, true, false);
  headTexture.hasAlpha = true;
  headMaterial.diffuseTexture = headTexture;
  headMaterial.useAlphaFromDiffuseTexture = true;
  headMaterial.emissiveColor = new Color3(0.12, 0.04, 0.015);
  headMaterial.backFaceCulling = false;

  const head = MeshBuilder.CreatePlane("koi head", { width: 0.98, height: 1.42 }, scene);
  head.rotation.x = Math.PI / 2;
  head.position.y = 0.42;
  head.material = headMaterial;
  const fallbackHead = MeshBuilder.CreateSphere("procedural koi head", { diameter: 0.9, segments: 16 }, scene);
  fallbackHead.scaling = new Vector3(0.72, 0.22, 0.94);
  fallbackHead.position.y = 0.42;
  fallbackHead.material = orangeMaterial;
  const fallbackFace = MeshBuilder.CreateSphere("procedural koi face", { diameter: 0.55, segments: 16 }, scene);
  fallbackFace.scaling = new Vector3(0.7, 0.12, 0.6);
  fallbackFace.position.y = 0.54;
  fallbackFace.material = bodyMaterial;
  const fallbackEye = MeshBuilder.CreateSphere("koi eye left", { diameter: 0.09, segments: 10 }, scene);
  const fallbackEyeOther = fallbackEye.clone("koi eye right");
  fallbackEye.material = inkMaterial;
  if (fallbackEyeOther) fallbackEyeOther.material = inkMaterial;
  const segmentMeshes: Mesh[] = [];
  const stripeMeshes: Mesh[] = [];
  for (let i = 0; i < 40; i += 1) {
    const segment = MeshBuilder.CreateSphere(`koi body ${i}`, { diameter: 0.78, segments: 14 }, scene);
    segment.scaling = new Vector3(0.8 - Math.min(i, 14) * 0.012, 0.22, 0.92 - Math.min(i, 14) * 0.01);
    segment.material = bodyMaterial;
    segmentMeshes.push(segment);
    const stripe = MeshBuilder.CreateSphere(`koi pattern ${i}`, { diameter: 0.52, segments: 12 }, scene);
    stripe.scaling = new Vector3(0.85, 0.08, 0.38);
    stripe.material = i % 3 === 1 ? inkMaterial : orangeMaterial;
    stripeMeshes.push(stripe);
  }

  const food = createFood(scene);
  const rippleMaterial = mat(scene, "ripple", "#b3f2dc", 0.5);
  const ripples: Ripple[] = [];
  for (let i = 0; i < 14; i += 1) {
    const mesh = MeshBuilder.CreateTorus(`ripple-${i}`, { diameter: 1.05, thickness: 0.025, tessellation: 32 }, scene);
    mesh.rotation.x = Math.PI / 2;
    mesh.material = rippleMaterial;
    mesh.isVisible = false;
    ripples.push({ mesh, age: 0, active: false });
  }
  let rippleCursor = 0;

  const scoreEl = document.getElementById("score-value");
  const highScoreEl = document.getElementById("high-score-value");
  const lengthEl = document.getElementById("length-value");
  const stateEl = document.getElementById("game-state");
  const hintEl = document.getElementById("game-hint");
  const updateHud = () => {
    if (scoreEl) scoreEl.textContent = String(game.score).padStart(4, "0");
    if (highScoreEl) highScoreEl.textContent = String(game.highScore).padStart(4, "0");
    if (lengthEl) lengthEl.textContent = `${game.segments.length} scales`;
    if (stateEl) {
      stateEl.textContent = game.status === "over" ? "The pond grows still" : "Flow with the current";
      stateEl.classList.toggle("is-over", game.status === "over");
    }
    if (hintEl) hintEl.textContent = game.status === "over" ? "Press restart to return to the garden" : "Arrow keys / WASD to steer";
  };

  const setDirection = (name: Direction["name"]) => game.queueDirection(name);
  const onKey = (event: KeyboardEvent) => {
    const map: Record<string, Direction["name"] | undefined> = {
      ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
      ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
    };
    const direction = map[event.key];
    if (direction) {
      event.preventDefault();
      setDirection(direction);
    }
    if (event.key === " " && game.status === "over") game.restart();
  };
  window.addEventListener("keydown", onKey, { passive: false });
  document.querySelectorAll<HTMLElement>("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => setDirection(button.dataset.direction as Direction["name"]));
  });
  document.getElementById("restart-button")?.addEventListener("click", () => game.restart());

  const demoTurns: Record<number, Direction["name"]> = { 0: "right", 6: "down", 9: "left", 13: "down", 19: "right", 25: "up", 29: "right", 36: "down", 40: "left", 44: "up" };
  let tickAccumulator = 0;
  let introTime = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    introTime += delta;
    tickAccumulator += delta;
    if (game.demo && demoTurns[game.ticks] && game.status === "playing") setDirection(demoTurns[game.ticks]);
    if (tickAccumulator >= 0.17) {
      tickAccumulator = 0;
      const result = game.step();
      if (result.moved) {
        const ripple = ripples[rippleCursor % ripples.length];
        rippleCursor += 1;
        ripple.mesh.position = cellToWorld(result.previousHead);
        ripple.mesh.position.y = 0.19;
        ripple.mesh.scaling = new Vector3(0.35, 0.35, 0.35);
        ripple.age = 0;
        ripple.active = true;
        ripple.mesh.isVisible = true;
      }
      if (result.ate) {
        const pulse = food.scaling.x;
        food.scaling = new Vector3(pulse * 1.25, pulse * 1.25, pulse * 1.25);
      }
      updateHud();
    }

    game.segments.forEach((segmentCell, index) => {
      const mesh = index === 0 ? head : segmentMeshes[index - 1];
      if (!mesh) return;
      const pos = cellToWorld(segmentCell);
      mesh.position.x = pos.x;
      mesh.position.z = pos.z;
      mesh.position.y = index === 0 ? 0.42 : 0.36;
      if (index === 0) {
        const heading = Math.atan2(game.direction.x, -game.direction.z);
        mesh.rotation.y = heading;
        fallbackHead.position.x = pos.x;
        fallbackHead.position.z = pos.z;
        fallbackFace.position.x = pos.x + game.direction.x * 0.13;
        fallbackFace.position.z = pos.z + game.direction.z * 0.13;
        fallbackEye.position.x = pos.x - game.direction.z * 0.17 + game.direction.x * 0.18;
        fallbackEye.position.z = pos.z + game.direction.x * 0.17 + game.direction.z * 0.18;
        fallbackEye.position.y = 0.58;
        if (fallbackEyeOther) {
          fallbackEyeOther.position.x = pos.x + game.direction.z * 0.17 + game.direction.x * 0.18;
          fallbackEyeOther.position.z = pos.z - game.direction.x * 0.17 + game.direction.z * 0.18;
          fallbackEyeOther.position.y = 0.58;
        }
        fallbackHead.rotation.y = heading;
        fallbackFace.rotation.y = heading;
      }
      if (index > 0) {
        const stripe = stripeMeshes[index - 1];
        stripe.position.x = pos.x;
        stripe.position.z = pos.z;
        stripe.position.y = 0.55;
        stripe.rotation.y = (index % 2) * 0.18;
        stripe.isVisible = true;
      }
    });
    for (let i = game.segments.length - 1; i < stripeMeshes.length; i += 1) {
      stripeMeshes[i].isVisible = false;
      segmentMeshes[i].isVisible = false;
    }
    segmentMeshes.slice(0, Math.max(0, game.segments.length - 1)).forEach((mesh) => { mesh.isVisible = true; });
    food.position = cellToWorld(game.food);
    food.position.y = 0.46 + Math.sin(introTime * 2.4) * 0.05;
    const desiredScale = 1 + Math.sin(introTime * 3.2) * 0.06;
    food.scaling = Vector3.Lerp(food.scaling, new Vector3(desiredScale, desiredScale, desiredScale), 0.08);
    ripples.forEach((ripple) => {
      if (!ripple.active) return;
      ripple.age += delta;
      const t = Math.min(ripple.age / 0.9, 1);
      ripple.mesh.scaling = new Vector3(0.35 + t * 1.2, 0.35 + t * 1.2, 0.35 + t * 1.2);
      (ripple.mesh.material as StandardMaterial).alpha = 0.42 * (1 - t);
      if (t >= 1) {
        ripple.active = false;
        ripple.mesh.isVisible = false;
      }
    });
    if (game.status === "over") {
      head.scaling = Vector3.Lerp(head.scaling, new Vector3(0.92, 0.92, 0.92), 0.08);
      fallbackHead.scaling = Vector3.Lerp(fallbackHead.scaling, new Vector3(0.64, 0.2, 0.83), 0.08);
    } else {
      head.scaling = Vector3.Lerp(head.scaling, new Vector3(1, 1, 1), 0.08);
      fallbackHead.scaling = Vector3.Lerp(fallbackHead.scaling, new Vector3(0.72, 0.22, 0.94), 0.08);
    }
  });
  updateHud();

  return {
    scene,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(observer);
      window.removeEventListener("keydown", onKey);
      scene.dispose();
    },
  };
}
