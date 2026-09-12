# Structure: Koi Zen Snake

## Runtime shape

- `client/src/components/GameCanvas.tsx` owns the Babylon `Engine`, canvas lifecycle, resize listener, and cleanup boundary.
- `client/src/game/scene.ts` creates the orthographic overhead scene, materials, pond decoration, koi meshes, ripple pool, semantic input, and `GameHandle`.
- `client/src/game/koiGame.ts` is framework-agnostic gameplay state: integer grid movement, food placement, score, high score, collision, restart, and deterministic demo autopilot.
- `client/src/App.tsx` renders the single game route and the DOM HUD/control overlay.
- `client/src/index.css` defines the zen garden visual system, HUD surfaces, type, grain, responsive layout, and touch controls.

## Scene ownership

The scene owns all Babylon meshes and disposes them through `Scene.dispose()`. The game state owns no React or Babylon references. `scene.ts` maps each state tick to segment transforms and spawns reusable ripple rings at the former head cell.

## Input contract

Keyboard arrows and WASD map to semantic directions. Four touch buttons dispatch the same direction actions. `?demo` runs a deterministic turn sequence so the game can be visually verified without manual input.

## Asset contract

The generated koi cutout is loaded from `/manus-storage/koi-fish-cutout_5e00a860.png`; other environment assets are intentional procedural meshes and materials for fast, crisp browser rendering.
