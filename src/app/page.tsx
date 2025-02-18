"use client";
import React, { useReducer, useRef, useEffect, useState } from "react";
import { Download, Undo, Redo, Trash2 } from "lucide-react";
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

  // State to track if an element is being dragged over the canvas
  const [isOver, setIsOver] = useState(false);

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

  // Ensure shapes stay within canvas bounds
  const constrainToBounds = (shape: Shape) => {
    if (!canvasRef.current) return shape;

    const canvas = canvasRef.current;
    const bounds = {
      x: Math.max(0, Math.min(shape.x, canvas.clientWidth - shape.width)),
      y: Math.max(0, Math.min(shape.y, canvas.clientHeight - shape.height)),
      width: shape.width,
      height: shape.height,
    };

    return { ...shape, ...bounds };
  };

  // Handle deleting the selected shape
  const handleDeleteShape = () => {
    if (state.selectedId) {
      dispatch({ type: "DELETE_SHAPE", payload: state.selectedId });
    }
  };

  const handleMouseMove = (e: any) => {
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
        // Constrain the shape to canvas bounds
        const constrainedShape = constrainToBounds(updatedShape);
        dispatch({ type: "UPDATE_SHAPE", payload: constrainedShape });
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
        const updatedShape = {
          ...initialShape,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
        // Constrain resized shape to canvas bounds
        const constrainedShape = constrainToBounds(updatedShape);
        dispatch({ type: "UPDATE_SHAPE", payload: constrainedShape });
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
  const [{ isOver: dragIsOver }, drop] = useDrop(() => ({
    accept: ItemTypes.SHAPE,
    drop: (item, monitor) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (clientOffset) {
        const x = clientOffset.x - rect.left - 50; // Center the shape
        const y = clientOffset.y - rect.top - 50; // Center the shape
        handleAddShape(item.type, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Update isOver state when drag is over the canvas
  useEffect(() => {
    setIsOver(dragIsOver);
  }, [dragIsOver]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 grid grid-cols-12 gap-6 bg-gray-50 rounded-lg shadow-sm">
      {/* Left sidebar with tools */}
      <div className="col-span-3 bg-white rounded-lg shadow-sm p-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Tools</h2>

        {/* Shapes section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Shapes</h3>
          <div className="grid grid-cols-2 gap-3">
            <DraggableShape type="rectangle" handleAddShape={handleAddShape} />
            <DraggableShape type="circle" handleAddShape={handleAddShape} />
          </div>
        </div>

        {/* Actions section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Actions</h3>
          <div className="space-y-2">
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors"
              onClick={() => dispatch({ type: "UNDO" })}
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </button>
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors"
              onClick={() => dispatch({ type: "REDO" })}
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </button>
            <button
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md border transition-colors ${
                !state.selectedId
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              }`}
              onClick={handleDeleteShape}
              disabled={!state.selectedId}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Export section */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            onClick={() => downloadAsPNG({ canvasRef, state })}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Design
          </button>
        </div>
      </div>

      {/* Main canvas area */}
      <div className="col-span-9 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold text-gray-800">Design Canvas</h1>
          {state.selectedId && (
            <div className="text-sm text-gray-500">
              Shape selected:{" "}
              {state.shapes.find((s) => s.id === state.selectedId)?.type}
            </div>
          )}
        </div>

        <div
          ref={(node) => {
            canvasRef.current = node as HTMLDivElement;
            drop(node);
          }}
          className={`flex-grow h-[600px] bg-white border border-gray-300 ${
            isOver ? "border-indigo-300 bg-indigo-50" : ""
          } rounded-lg shadow-inner relative transition-colors duration-200`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Canvas grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Shapes */}
          {state.shapes.map((shape) => (
            <div
              key={shape.id}
              className={`absolute cursor-move ${
                state.selectedId === shape.id
                  ? "ring-2 ring-indigo-500 shadow-lg"
                  : "hover:ring-2 hover:ring-indigo-200"
              } transition-shadow duration-200`}
              style={{
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height,
              }}
              onMouseDown={(e) => handleMouseDown(e, shape.id)}
            >
              {shape.type === "rectangle" ? (
                <div className="w-full h-full bg-indigo-500 bg-opacity-80 rounded-sm shadow-md" />
              ) : (
                <div className="w-full h-full rounded-full bg-indigo-500 bg-opacity-80 shadow-md" />
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
                    onMouseDown={(e) =>
                      handleResizeStart(e, shape.id, "bottom")
                    }
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

          {state.shapes.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="mb-2">
                  Drag shapes from the sidebar to start designing
                </p>
                <p className="text-sm">or click a shape type to add it</p>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
          <div>{state.shapes.length} shape(s)</div>
          <div>
            {state.selectedId
              ? "Click and drag to move • Resize using handles"
              : "Click on a shape to select it"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
