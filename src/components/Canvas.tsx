import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./DraggableShape";
import { State } from "@/types";

const Canvas = ({
  canvasRef,
  handleAddShape,
  state,
  handleMouseUp,
  handleMouseMove,
  handleMouseDown,
}: {
  canvasRef: React.RefObject<HTMLDivElement>;
  handleAddShape: (type: "rectangle" | "circle") => void;
  state: State;
  handleMouseUp: () => void;
  handleMouseMove: (e: any) => void;
  handleMouseDown: (e: React.MouseEvent, id: string) => void;
}) => {
  // State to track if an element is being dragged over the canvas
  const [isOver, setIsOver] = useState(false);
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
    <div
      ref={(node) => {
        canvasRef.current = node as HTMLDivElement;
        drop(node);
      }}
      className={`flex-grow min-h-[400px] md:h-[600px] bg-white border border-gray-300 ${
        isOver ? "border-indigo-300 bg-indigo-50" : ""
      } rounded-lg shadow-inner relative transition-colors duration-200 overflow-hidden`}
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
  );
};

export default Canvas;
