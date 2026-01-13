"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useRef, useImperativeHandle, forwardRef, useState } from "react";
import Cube, { CubeHandle } from "./Cube";
import { toNotation, getSolution, fromNotation } from "@/app/lib/solver";

export interface SceneHandle {
  shuffle: () => Promise<void>;
  rotateLayer: (
    axis: "x" | "y" | "z",
    limit: number,
    dir: 1 | -1
  ) => Promise<void>;
  undo: () => Promise<boolean>;
  canUndo: () => boolean;
  solve: () => Promise<void>;
  hasMoves: () => boolean;
}

const Scene = forwardRef<SceneHandle, {}>((props, ref) => {
  const cubeRef = useRef<CubeHandle>(null);
  const isProcessing = useRef(false);
  const moveHistoryRef = useRef<string[]>([]);
  const lastMoveRef = useRef<{
    axis: "x" | "y" | "z";
    limit: number;
    dir: 1 | -1;
  } | null>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);

  useImperativeHandle(ref, () => ({
    shuffle: async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      moveHistoryRef.current = [];
      lastMoveRef.current = null;
      setUndoAvailable(false);

      for (let i = 0; i < 6; i++) {
        const axes: ("x" | "y" | "z")[] = ["x", "y", "z"];
        const axis = axes[Math.floor(Math.random() * 3)];
        const limits: (1 | -1)[] = [-1, 1];
        const limit = limits[Math.floor(Math.random() * 2)];
        const dirs: (1 | -1)[] = [1, -1];
        const dir = dirs[Math.floor(Math.random() * 2)];

        await cubeRef.current?.rotateLayer(axis, limit, dir, 100);

        const notation = toNotation(axis, limit, dir);
        if (notation) {
          moveHistoryRef.current.push(notation);
        }
      }
      isProcessing.current = false;
    },
    rotateLayer: async (axis: "x" | "y" | "z", limit: number, dir: 1 | -1) => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      await cubeRef.current?.rotateLayer(axis, limit, dir, 200);

      const notation = toNotation(axis, limit, dir);
      if (notation) {
        moveHistoryRef.current.push(notation);
      }

      lastMoveRef.current = { axis, limit, dir };
      setUndoAvailable(true);

      isProcessing.current = false;
    },
    undo: async () => {
      if (isProcessing.current || !lastMoveRef.current) return false;
      isProcessing.current = true;

      const move = lastMoveRef.current;
      await cubeRef.current?.rotateLayer(
        move.axis,
        move.limit,
        (move.dir * -1) as 1 | -1,
        200
      );

      const notation = toNotation(
        move.axis,
        move.limit,
        (move.dir * -1) as 1 | -1
      );
      if (notation) {
        moveHistoryRef.current.push(notation);
      }

      lastMoveRef.current = null;
      setUndoAvailable(false);

      isProcessing.current = false;
      return true;
    },
    canUndo: () => undoAvailable,
    solve: async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        const solution = getSolution(moveHistoryRef.current);

        for (const notation of solution) {
          const move = fromNotation(notation);
          if (move) {
            await cubeRef.current?.rotateLayer(
              move.axis,
              move.limit,
              move.dir,
              150
            );
          }

          if (notation.includes("2")) {
            const move = fromNotation(notation);
            if (move) {
              await cubeRef.current?.rotateLayer(
                move.axis,
                move.limit,
                move.dir,
                150
              );
            }
          }
        }

        moveHistoryRef.current = [];
        setUndoAvailable(false);
      } catch (e) {
        console.error("Solver error:", e);
      }

      isProcessing.current = false;
    },
    hasMoves: () => moveHistoryRef.current.length > 0,
  }));

  return (
    <div className="absolute inset-0 w-full h-full bg-transparent">
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <Environment preset="city" />

        <group position={[0, 0, 0]}>
          <Cube ref={cubeRef} />
        </group>

        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4.5}
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
});

Scene.displayName = "Scene";
export default Scene;
