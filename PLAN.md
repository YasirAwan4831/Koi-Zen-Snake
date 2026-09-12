# Game Plan: Koi Zen Snake

## Risk Tasks

### 1. Grid movement and self-collision
- **Why isolated:** Snake movement is discrete but rendered in a continuous scene; direction reversals and tail removal can create off-by-one collision bugs.
- **Approach:** Keep gameplay coordinates as integer `{x, z}` cells in a small `KoiGame` class. Queue at most one direction change per tick, reject direct reversals, test wall and body collision against the next head cell before moving, and only remove the tail when food is not consumed.
- **Verify:** Keyboard arrows/WASD and touch buttons change direction cleanly; the koi cannot reverse into itself; wall and self impacts reliably enter the game-over state; food increments score and length.

### 2. Procedural ripple trail animation
- **Why isolated:** The water-ripple requirement needs many transient meshes without making the update loop noisy or leaking resources.
- **Approach:** Reuse a small pool of torus meshes. Spawn a ring at the previous head cell on movement, then animate scale and alpha over a short lifetime, returning finished rings to the pool.
- **Verify:** Every movement leaves a soft expanding ripple, ripples fade without popping, and no visible mesh buildup occurs after a long run.

## Main Build

- **Assets needed:** one generated top-down koi cutout (`/manus-storage/koi-fish-cutout_5e00a860.png`) for the head, plus procedural pond water, etched grid, cedar frame, sand, rocks, bamboo, lotus pads, blossom accents, and HUD.
- **Verify:**
  - Movement direction matches player input and remains locked to the grid.
  - Koi head and segmented body visibly follow the path, with body length increasing after each lotus pickup.
  - Score and high score are readable; pause/restart/game-over states are clear.
  - Board is framed as an overhead Japanese zen garden with jade water and gentle ripples.
  - Touch controls work on narrow layouts and keyboard controls work on desktop.
  - No visual glitches, clipping, missing textures, or placeholder assets.
  - No browser console errors during capture.
  - The `?demo` query produces deterministic movement and visible gameplay for screenshot verification.
  - Art direction matches the generated reference: jade pond, warm wood, orange koi, restrained cream UI.

## Presentation Proof

The WebDev preview is verified with screenshots from the running preview, including `/` and `/?demo`, at desktop and mobile-sized viewports.
