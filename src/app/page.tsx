"use client"
import React, { useReducer, useRef, useEffect } from 'react';
import { Download, Square, Circle, Undo, Redo } from 'lucide-react';

// Types
type Shape = {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
};

type State = {
  shapes: Shape[];
  selectedId: string | null;
  history: Shape[][];
  historyIndex: number;
};

type Action =
  | { type: 'ADD_SHAPE'; payload: Shape }
  | { type: 'UPDATE_SHAPE'; payload: Shape }
  | { type: 'SELECT_SHAPE'; payload: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_DESIGN'; payload: Shape[] };

// Reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_SHAPE': {
      const newShapes = [...state.shapes, action.payload];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        shapes: newShapes,
        history: [...newHistory, newShapes],
        historyIndex: state.historyIndex + 1,
      };
    }
    case 'UPDATE_SHAPE': {
      const newShapes = state.shapes.map(shape =>
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
    case 'SELECT_SHAPE':
      return { ...state, selectedId: action.payload };
    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          shapes: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          shapes: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    case 'LOAD_DESIGN':
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


const DesignEditor = () => {
  const [state, dispatch] = useReducer(reducer, {
    shapes: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const savedDesign = localStorage.getItem('design');
    if (savedDesign) {
      dispatch({ type: 'LOAD_DESIGN', payload: JSON.parse(savedDesign) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('design', JSON.stringify(state.shapes));
  }, [state.shapes]);

  const handleAddShape = (type: 'rectangle' | 'circle') => {
    const newShape: Shape = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    dispatch({ type: 'ADD_SHAPE', payload: newShape });
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      startPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      isDragging.current = true;
      dispatch({ type: 'SELECT_SHAPE', payload: id });
    }
  };




  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex gap-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => handleAddShape('rectangle')}
        >
          <Square className="w-4 h-4 inline mr-2" />
          Add Rectangle
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => handleAddShape('circle')}
        >
          <Circle className="w-4 h-4 inline mr-2" />
          Add Circle
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => dispatch({ type: 'UNDO' })}
        >
          <Undo className="w-4 h-4 inline mr-2" />
          Undo
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => dispatch({ type: 'REDO' })}
        >
          <Redo className="w-4 h-4 inline mr-2" />
          Redo
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <Download className="w-4 h-4 inline mr-2" />
          Download
        </button>
      </div>
      
      <div
        ref={canvasRef}
        className="w-full h-[600px] border-2 border-gray-300 rounded relative bg-white backdrop-blur-lg bg-opacity-50"
      >
        {state.shapes.map(shape => (
          <div
            key={shape.id}
            className={`absolute cursor-move ${
              state.selectedId === shape.id ? 'ring-2 ring-indigo-500' : ''
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, shape.id)}
          >
            {shape.type === 'rectangle' ? (
              <div className="w-full h-full bg-indigo-600" />
            ) : (
              <div className="w-full h-full rounded-full bg-indigo-600" />
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignEditor;