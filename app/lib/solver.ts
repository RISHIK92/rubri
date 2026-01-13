import Cube from "cubejs";

let solverInitialized = false;
export const initSolver = () => {
  if (!solverInitialized) {
    Cube.initSolver();
    solverInitialized = true;
  }
};

export const createCubeFromMoves = (moves: string[]) => {
  const cube = new Cube();
  moves.forEach((move) => {
    cube.move(move);
  });
  return cube;
};

export const getSolution = (moveHistory: string[]): string[] => {
  initSolver();

  const cube = createCubeFromMoves(moveHistory);
  const solution = cube.solve();

  if (!solution) return [];

  return solution
    .trim()
    .split(" ")
    .filter((m) => m.length > 0);
};

export const toNotation = (
  axis: "x" | "y" | "z",
  limit: number,
  dir: 1 | -1
): string => {
  let face = "";
  let adjustedDir = dir;

  if (axis === "y" && limit === 1) {
    face = "U";
    adjustedDir = (dir * -1) as 1 | -1;
  } else if (axis === "y" && limit === -1) {
    face = "D";
  } else if (axis === "x" && limit === 1) {
    face = "R";
    adjustedDir = (dir * -1) as 1 | -1;
  } else if (axis === "x" && limit === -1) {
    face = "L";
  } else if (axis === "z" && limit === 1) {
    face = "F";
    adjustedDir = (dir * -1) as 1 | -1;
  } else if (axis === "z" && limit === -1) {
    face = "B";
  } else {
    return "";
  }

  if (adjustedDir === -1) {
    return face + "'";
  }
  return face;
};

export const fromNotation = (
  notation: string
): { axis: "x" | "y" | "z"; limit: number; dir: 1 | -1 } | null => {
  const face = notation[0];
  const isPrime = notation.includes("'");

  let axis: "x" | "y" | "z" = "y";
  let limit = 0;
  let dir: 1 | -1 = isPrime ? -1 : 1;

  switch (face) {
    case "U":
      axis = "y";
      limit = 1;
      dir = (dir * -1) as 1 | -1;
      break;
    case "D":
      axis = "y";
      limit = -1;
      break;
    case "R":
      axis = "x";
      limit = 1;
      dir = (dir * -1) as 1 | -1;
      break;
    case "L":
      axis = "x";
      limit = -1;
      break;
    case "F":
      axis = "z";
      limit = 1;
      dir = (dir * -1) as 1 | -1;
      break;
    case "B":
      axis = "z";
      limit = -1;
      break;
    default:
      return null;
  }

  return { axis, limit, dir };
};

export type SolverMove = { axis: "x" | "y" | "z"; limit: number; dir: 1 | -1 };
