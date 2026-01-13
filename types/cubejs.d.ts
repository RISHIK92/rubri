declare module "cubejs" {
  class Cube {
    constructor(cubeState?: string);
    static initSolver(): void;
    move(notation: string): Cube;
    solve(): string;
    asString(): string;
    static fromString(cubeString: string): Cube;
    static random(): Cube;
  }
  export = Cube;
}
