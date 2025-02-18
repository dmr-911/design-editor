"use client";
import React, { useReducer, useRef, useEffect } from "react";
import { Download, Square, Circle, Undo, Redo } from "lucide-react";
import { reducerFn } from "@/utils/reducerFn";
import { Shape } from "@/types";
import { useDrop } from "react-dnd";
import ResizeHandle from "@/components/ResizeHandle";
import { downloadAsPNG } from "@/utils/downloadAsPNG";
import DraggableShape, { ItemTypes } from "@/components/DraggableShape";

const DesignEditor = () => {
  const [state, dispatch] = useReducer(reducerFn, {
    shapes: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const resizeHandle = useRef<string | null>(null);
  const initialShapeRef = useRef<Shape | null>(null);

  useEffect(() => {
    const savedDesign = localStorage.getItem("design");
    if (savedDesign) {
      dispatch({ type: "LOAD_DESIGN", payload: JSON.parse(savedDesign) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("design", JSON.stringify(state.shapes));
  }, [state.shapes]);

  const handleAddShape = (type: "rectangle" | "circle") => {
    const newShape: Shape = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    dispatch({ type: "ADD_SHAPE", payload: newShape });
  };

  // resizing handlers
  const handleResizeStart = (
    e: React.MouseEvent,
    id: string,
    handle: string
  ) => {
    e.stopPropagation();
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      startPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      isResizing.current = true;
      resizeHandle.current = handle;
      dispatch({ type: "SELECT_SHAPE", payload: id });
      initialShapeRef.current = state.shapes.find((s) => s.id === id) || null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - startPos.current.x;
    const deltaY = currentY - startPos.current.y;

    if (isDragging.current && state.selectedId) {
      const shape = state.shapes.find((s) => s.id === state.selectedId);
      if (shape) {
        const updatedShape = {
          ...shape,
          x: shape.x + deltaX,
          y: shape.y + deltaY,
        };
        dispatch({ type: "UPDATE_SHAPE", payload: updatedShape });
      }
      startPos.current = { x: currentX, y: currentY };
    }

    if (isResizing.current && state.selectedId && initialShapeRef.current) {
      const initialShape = initialShapeRef.current;
      const handle = resizeHandle.current;
      let newX = initialShape.x;
      let newY = initialShape.y;
      let newWidth = initialShape.width;
      let newHeight = initialShape.height;

      if (handle?.includes("left")) {
        newX = initialShape.x + deltaX;
        newWidth = initialShape.width - deltaX;
      }
      if (handle?.includes("right")) {
        newWidth = initialShape.width + deltaX;
      }
      if (handle?.includes("top")) {
        newY = initialShape.y + deltaY;
        newHeight = initialShape.height - deltaY;
      }
      if (handle?.includes("bottom")) {
        newHeight = initialShape.height + deltaY;
      }

      // Ensure minimum size
      const minSize = 20;
      if (newWidth >= minSize && newHeight >= minSize) {
        dispatch({
          type: "UPDATE_SHAPE",
          payload: {
            ...initialShape,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          },
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      startPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      isDragging.current = true;
      dispatch({ type: "SELECT_SHAPE", payload: id });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
    resizeHandle.current = null;
    initialShapeRef.current = null;
  };

  // drop area
  // Canvas drop area
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.SHAPE,
    drop: (item: { type: "rectangle" | "circle" }, monitor) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (clientOffset) {
        const x = clientOffset.x - rect.left - 50; // Center the shape
        const y = clientOffset.y - rect.top - 50; // Center the shape
        handleAddShape(item.type, x, y);
      }
    },
  }));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 grid grid-cols-8 gap-2">
      <div className="mb-4 flex flex-col gap-4 col-span-2">
        <DraggableShape type="rectangle" handleAddShape={handleAddShape} />
        <DraggableShape type="circle" handleAddShape={handleAddShape} />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => dispatch({ type: "UNDO" })}
        >
          <Undo className="w-4 h-4 inline mr-2" />
          Undo
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => dispatch({ type: "REDO" })}
        >
          <Redo className="w-4 h-4 inline mr-2" />
          Redo
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => downloadAsPNG({ canvasRef, state })}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Download
        </button>
      </div>

      <div
        // ref={canvasRef}
        ref={(node) => {
          canvasRef.current = node as HTMLDivElement;
          drop(node);
        }}
        className="col-span-6 h-[600px] border-2 border-gray-300 rounded relative bg-white backdrop-blur-lg bg-opacity-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {state.shapes.map((shape) => (
          <div
            key={shape.id}
            className={`absolute cursor-move ${
              state.selectedId === shape.id ? "ring-2 ring-indigo-500" : ""
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, shape.id)}
          >
            {shape.type === "rectangle" ? (
              <div className="w-full h-full bg-indigo-600" />
            ) : (
              <div className="w-full h-full rounded-full bg-indigo-600" />
            )}

            {state.selectedId === shape.id && (
              <>
                <ResizeHandle
                  position="top-left"
                  onMouseDown={(e) =>
                    handleResizeStart(e, shape.id, "top-left")
                  }
                />
                <ResizeHandle
                  position="top"
                  onMouseDown={(e) => handleResizeStart(e, shape.id, "top")}
                />
                <ResizeHandle
                  position="top-right"
                  onMouseDown={(e) =>
                    handleResizeStart(e, shape.id, "top-right")
                  }
                />
                <ResizeHandle
                  position="right"
                  onMouseDown={(e) => handleResizeStart(e, shape.id, "right")}
                />
                <ResizeHandle
                  position="bottom-right"
                  onMouseDown={(e) =>
                    handleResizeStart(e, shape.id, "bottom-right")
                  }
                />
                <ResizeHandle
                  position="bottom"
                  onMouseDown={(e) => handleResizeStart(e, shape.id, "bottom")}
                />
                <ResizeHandle
                  position="bottom-left"
                  onMouseDown={(e) =>
                    handleResizeStart(e, shape.id, "bottom-left")
                  }
                />
                <ResizeHandle
                  position="left"
                  onMouseDown={(e) => handleResizeStart(e, shape.id, "left")}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignEditor;
