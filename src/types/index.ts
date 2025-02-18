// Types
export type Shape = {
  id: string;
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type State = {
  shapes: Shape[];
  selectedId: string | null;
  history: Shape[][];
  historyIndex: number;
};

export type Action =
  | { type: "ADD_SHAPE"; payload: Shape }
  | { type: "UPDATE_SHAPE"; payload: Shape }
  | { type: "SELECT_SHAPE"; payload: string | null }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOAD_DESIGN"; payload: Shape[] };
