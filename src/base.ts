module Base {

  export interface Point {
    x: number;
    y: number;
  }

  export interface MoveData {
    row: number;
    steps: number;
  }

  export interface EatenChips {
    red: number;
    blue: number;
  }
}
