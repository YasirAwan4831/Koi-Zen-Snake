import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

const directions = [
  { name: "up", label: "↑", className: "control-up" },
  { name: "left", label: "←", className: "control-left" },
  { name: "down", label: "↓", className: "control-down" },
  { name: "right", label: "→", className: "control-right" },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    createGameScene(engine, canvas).then((nextHandle) => {
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />
      <div className="grain" aria-hidden="true" />
      <header className="hud hud-top">
        <div className="brand-mark" aria-hidden="true"><span className="brand-dot" /><span className="brand-dot brand-dot-small" /></div>
        <div className="brand-copy"><span className="eyebrow">Pond no. 01</span><h1>Koi Zen</h1></div>
        <div className="hud-divider" />
        <div className="metric"><span className="metric-label">Score</span><strong id="score-value">0000</strong></div>
        <div className="metric"><span className="metric-label">High score</span><strong id="high-score-value">0000</strong></div>
        <div className="metric metric-length"><span className="metric-label">Length</span><strong id="length-value">4 scales</strong></div>
      </header>
      <button id="restart-button" className="restart-button" type="button"><span className="restart-icon">↻</span> Restart</button>
      <section className="status-card" aria-live="polite">
        <span className="status-kicker">Koi meditation</span>
        <span id="game-state">Flow with the current</span>
        <span id="game-hint">Arrow keys / WASD to steer</span>
      </section>
      <div className="controls" aria-label="Touch controls">
        {directions.map((direction) => <button key={direction.name} className={`control-button ${direction.className}`} data-direction={direction.name} type="button" aria-label={`Move ${direction.name}`}>{direction.label}</button>)}
      </div>
      <footer className="footer-note"><span className="footer-line" /> <span>keep your mind moving</span></footer>
    </main>
  );
}
