"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { Shuffle, Undo2, RotateCcw, Play, Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { initSolver } from "@/app/lib/solver";
import Scene, { SceneHandle } from "@/app/components/Scene";

type MoveType = {
  axis: "x" | "y" | "z";
  limit: number;
  dir: 1 | -1;
  label: string;
};

const MOVES: MoveType[] = [
  { axis: "y", limit: 1, dir: 1, label: "U" },
  { axis: "y", limit: 1, dir: -1, label: "U'" },
  { axis: "y", limit: -1, dir: 1, label: "D" },
  { axis: "y", limit: -1, dir: -1, label: "D'" },
  { axis: "x", limit: 1, dir: 1, label: "R" },
  { axis: "x", limit: 1, dir: -1, label: "R'" },
  { axis: "x", limit: -1, dir: 1, label: "L" },
  { axis: "x", limit: -1, dir: -1, label: "L'" },
  { axis: "z", limit: 1, dir: 1, label: "F" },
  { axis: "z", limit: 1, dir: -1, label: "F'" },
  { axis: "z", limit: -1, dir: 1, label: "B" },
  { axis: "z", limit: -1, dir: -1, label: "B'" },
];

export default function Home() {
  const [isShuffled, setIsShuffled] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solverReady, setSolverReady] = useState(false);
  const sceneRef = useRef<SceneHandle>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      initSolver();
      setSolverReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleShuffle = async () => {
    if (sceneRef.current) {
      await sceneRef.current.shuffle();
      setIsShuffled(true);
      setCanUndo(false);
    }
  };

  const handleMove = async (move: MoveType) => {
    if (sceneRef.current) {
      await sceneRef.current.rotateLayer(move.axis, move.limit, move.dir);
      setCanUndo(sceneRef.current.canUndo());
    }
  };

  const handleUndo = async () => {
    if (sceneRef.current && canUndo) {
      await sceneRef.current.undo();
      setCanUndo(false);
    }
  };

  const handleSolve = async () => {
    if (sceneRef.current && !isSolving) {
      setIsSolving(true);
      await sceneRef.current.solve();
      setIsSolving(false);
      setCanUndo(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black selection:bg-white/20">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-white/50">
              Loading 3D Engine...
            </div>
          }
        >
          <Scene ref={sceneRef} />
        </Suspense>
      </div>

      <div className="absolute z-20 top-0 left-0 w-full h-full pointer-events-none flex flex-col md:flex-row justify-between p-4 md:p-8">
        <div className="flex flex-col justify-between h-full">
          <header className="flex justify-between items-start">
            <div className="glass-panel p-4 rounded-2xl pointer-events-auto">
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Rubik's Cube
              </h1>
              <p className="text-[10px] md:text-xs text-white/50 tracking-wider uppercase font-medium mt-1">
                {isSolving
                  ? "Watch the magic..."
                  : isShuffled
                  ? "Solve it yourself or use AI!"
                  : "Click Shuffle to start"}
              </p>
            </div>

            <button
              onClick={handleUndo}
              disabled={!canUndo || isSolving}
              className={cn(
                "glass-panel p-3 rounded-full transition-all pointer-events-auto md:hidden",
                canUndo && !isSolving
                  ? "hover:bg-white/10 text-white"
                  : "opacity-30 cursor-not-allowed text-white/30"
              )}
              title="Undo (1 chance)"
            >
              <Undo2 className="w-5 h-5" />
            </button>
          </header>

          <div className="flex flex-col items-center gap-3 pointer-events-auto mb-4">
            <div className="glass-panel p-2 rounded-3xl flex items-center gap-2">
              <button
                className="group flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                onClick={handleShuffle}
                disabled={isSolving}
              >
                <Shuffle className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[8px] md:text-[10px] uppercase font-bold mt-1 text-white/60">
                  Shuffle
                </span>
              </button>

              <div className="w-px h-8 bg-white/10 mx-1" />

              <button
                className={cn(
                  "group flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all active:scale-95",
                  isShuffled && solverReady && !isSolving
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                )}
                onClick={handleSolve}
                disabled={!isShuffled || !solverReady || isSolving}
              >
                {isSolving ? (
                  <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                ) : (
                  <Play className="w-6 h-6 md:w-8 md:h-8" />
                )}
                <span className="text-[8px] md:text-[10px] uppercase font-bold mt-1">
                  {isSolving ? "Solving" : "AI Solve"}
                </span>
              </button>

              <div className="w-px h-8 bg-white/10 mx-1" />

              <button
                className="group flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:-rotate-90 transition-transform duration-500" />
                <span className="text-[8px] md:text-[10px] uppercase font-bold mt-1 text-white/60">
                  Reset
                </span>
              </button>
            </div>

            {isShuffled && !isSolving && (
              <div className="glass-panel p-3 rounded-2xl md:hidden">
                <div className="grid grid-cols-6 gap-1">
                  {MOVES.map((move) => (
                    <button
                      key={move.label}
                      onClick={() => handleMove(move)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 
                                 flex items-center justify-center text-white font-bold text-sm
                                 transition-all active:scale-90 hover:border-white/30"
                    >
                      {move.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isShuffled && !isSolving && (
          <div className="hidden md:flex flex-col items-end justify-center gap-4 pointer-events-auto">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-white/60">
                  Moves
                </span>
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    canUndo
                      ? "hover:bg-white/10 text-white"
                      : "opacity-30 cursor-not-allowed text-white/30"
                  )}
                  title="Undo (1 chance)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOVES.map((move) => (
                  <button
                    key={move.label}
                    onClick={() => handleMove(move)}
                    className="w-14 h-12 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 
                               flex items-center justify-center text-white font-bold text-base
                               transition-all active:scale-90 hover:border-white/30"
                  >
                    {move.label}
                  </button>
                ))}
              </div>
              <p className="text-center text-[9px] text-white/40 mt-3">
                ' = Counter-clockwise
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
