# Assets

**Art direction:** A premium overhead zen-garden game with clear spatial hierarchy: dark cedar border and pale raked-sand surround frame a jade-green square pond. The playfield uses a subtle etched grid, lily pads, blossoms, bamboo, stones, and drifting maple leaves. The player is a long orange-red and ivory koi, with translucent fins on the head and warm body segments. Food is a luminous golden lotus petal. The interface uses cream paper, ink navy, muted gold, and vermilion accents with restrained rounded glass surfaces.

## Generated assets

| Asset | Purpose | Source / prompt notes |
|---|---|---|
| `koi-zen-reference.png` | Visual target only; defines composition, palette, mood, density, and top-down camera. | Generated 2026-09-12 with a 16:9 in-game screenshot prompt. Local original: `/home/ubuntu/webdev-static-assets/koi-zen-reference.png`. |
| `koi-fish-cutout.png` | Runtime head asset for the koi; transparent top-down orange/ivory cutout. | Generated 2026-09-12 with a transparent-background top-down koi prompt. Uploaded storage path: `/manus-storage/koi-fish-cutout_5e00a860.png`. |

## Procedural assets

Pond water, grid lines, wood frame, sand, rocks, bamboo stalks, lily pads, lotus blossom accents, golden lotus food, and ripple rings are all built from Babylon meshes/materials in `client/src/game/scene.ts` to keep the deployed bundle small and responsive.
