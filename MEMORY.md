# Memory

- WebDev static project runs from `/home/ubuntu/koi-zen-snake` on port 3000.
- Babylon dependency is `@babylonjs/core@9.26.0`.
- Generated koi cutout is available at `/manus-storage/koi-fish-cutout_5e00a860.png`.
- Babylon uses an orthographic camera above the x/z plane; gameplay coordinates stay integer grid cells.
- Keep the scene self-contained and dispose all transient observers/meshes through the returned `GameHandle` and Babylon scene disposal.
