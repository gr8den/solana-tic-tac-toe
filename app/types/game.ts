export type Sign = 'X' | 'O';
export type IBoard = (Sign | null)[][];
export type GameStatus = 'active' | 'tie' | 'won';
export type Tile = { x: number, y: number };
