import { Action, State } from "@/types";

// Reducer
export const reducerFn = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_SHAPE": {
      const newShapes = [...state.shapes, action.payload];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        shapes: newShapes,
        history: [...newHistory, newShapes],
        historyIndex: state.historyIndex + 1,
      };
    }
    case "UPDATE_SHAPE": {
      const newShapes = state.shapes.map((shape) =>
        shape.id === action.payload.id ? action.payload : shape
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        shapes: newShapes,
        history: [...newHistory, newShapes],
        historyIndex: state.historyIndex + 1,
      };
    }
    case "SELECT_SHAPE":
      return { ...state, selectedId: action.payload };
    case "UNDO":
      if (state.historyIndex > 0) {
        return {
          ...state,
          shapes: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          shapes: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
      case "DELETE_SHAPE": {
        const newShapes = state.shapes.filter(shape => shape.id !== action.payload);
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return {
          ...state,
          shapes: newShapes,
          selectedId: null, // Clear selection after deletion
          history: [...newHistory, newShapes],
          historyIndex: state.historyIndex + 1,
        };
      }
    case "LOAD_DESIGN":
      return {
        ...state,
        shapes: action.payload,
        history: [action.payload],
        historyIndex: 0,
      };
    default:
      return state;
  }
};
