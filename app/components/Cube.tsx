import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import * as THREE from "three";

interface CubieProps {
  initialPos: [number, number, number];
  name: string;
}

const COLORS = {
  U: "#ffffff",
  D: "#ffd500",
  F: "#009e60",
  B: "#0051ba",
  L: "#ff5800",
  R: "#c41e3a",
  CORE: "#0a0a0a",
};

export interface CubeHandle {
  rotateLayer: (
    axis: "x" | "y" | "z",
    limit: number,
    dir: 1 | -1,
    duration?: number
  ) => Promise<void>;
  reset: () => void;
}

const Cube = forwardRef<CubeHandle, {}>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const cubiesRef = useRef<(THREE.Mesh | null)[]>([]);

  const [cubiesData] = useState<CubieProps[]>(() => {
    const c: CubieProps[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          c.push({ initialPos: [x, y, z], name: `${x}-${y}-${z}` });
        }
      }
    }
    return c;
  });

  const isAnimating = useRef(false);

  const materials = useMemo(() => {
    return {
      U: new THREE.MeshStandardMaterial({
        color: COLORS.U,
        roughness: 0.1,
        metalness: 0.1,
      }),
      D: new THREE.MeshStandardMaterial({
        color: COLORS.D,
        roughness: 0.1,
        metalness: 0.1,
      }),
      F: new THREE.MeshStandardMaterial({
        color: COLORS.F,
        roughness: 0.1,
        metalness: 0.1,
      }),
      B: new THREE.MeshStandardMaterial({
        color: COLORS.B,
        roughness: 0.1,
        metalness: 0.1,
      }),
      L: new THREE.MeshStandardMaterial({
        color: COLORS.L,
        roughness: 0.1,
        metalness: 0.1,
      }),
      R: new THREE.MeshStandardMaterial({
        color: COLORS.R,
        roughness: 0.1,
        metalness: 0.1,
      }),
      CORE: new THREE.MeshStandardMaterial({
        color: COLORS.CORE,
        roughness: 0.1,
        metalness: 0.1,
      }),
    };
  }, []);

  const geometry = useMemo(() => new THREE.BoxGeometry(0.92, 0.92, 0.92), []);

  const getCubieMaterials = (x: number, y: number, z: number) => {
    return [
      x === 1 ? materials.R : materials.CORE,
      x === -1 ? materials.L : materials.CORE,
      y === 1 ? materials.U : materials.CORE,
      y === -1 ? materials.D : materials.CORE,
      z === 1 ? materials.F : materials.CORE,
      z === -1 ? materials.B : materials.CORE,
    ];
  };

  useImperativeHandle(ref, () => ({
    rotateLayer: async (
      axis: "x" | "y" | "z",
      limit: number,
      dir: 1 | -1,
      duration = 300
    ) => {
      if (isAnimating.current || !groupRef.current || !pivotRef.current) return;
      isAnimating.current = true;

      const activeCubies: THREE.Mesh[] = [];

      cubiesRef.current.forEach((mesh) => {
        if (!mesh) return;
        const locPos = mesh.position;

        let val = 0;
        if (axis === "x") val = locPos.x;
        if (axis === "y") val = locPos.y;
        if (axis === "z") val = locPos.z;

        if (Math.abs(Math.round(val) - limit) < 0.1) {
          activeCubies.push(mesh);
        }
      });

      pivotRef.current.rotation.set(0, 0, 0);
      activeCubies.forEach((mesh) => {
        pivotRef.current?.attach(mesh);
      });

      const start = performance.now();
      const startRot = 0;
      const targetRot = (Math.PI / 2) * dir;

      return new Promise<void>((resolve) => {
        const animate = (time: number) => {
          const elapsed = time - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - (1 - progress) * (1 - progress);

          if (pivotRef.current) {
            pivotRef.current.rotation[axis] = startRot + targetRot * ease;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            if (pivotRef.current) pivotRef.current.rotation[axis] = targetRot;
            pivotRef.current?.updateMatrixWorld();

            activeCubies.forEach((mesh) => {
              groupRef.current?.attach(mesh);
              mesh.position.x = Math.round(mesh.position.x);
              mesh.position.y = Math.round(mesh.position.y);
              mesh.position.z = Math.round(mesh.position.z);
              mesh.updateMatrix();
            });

            if (pivotRef.current) pivotRef.current.rotation.set(0, 0, 0);
            isAnimating.current = false;
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
    },
    reset: () => {
      window.location.reload();
    },
  }));

  return (
    <>
      <group ref={groupRef}>
        {cubiesData.map((cubie, i) => (
          <mesh
            key={cubie.name}
            ref={(el) => {
              cubiesRef.current[i] = el;
            }}
            position={cubie.initialPos}
            material={getCubieMaterials(...cubie.initialPos)}
            geometry={geometry}
          />
        ))}
      </group>
      <group ref={pivotRef} />
    </>
  );
});

Cube.displayName = "Cube";
export default Cube;
