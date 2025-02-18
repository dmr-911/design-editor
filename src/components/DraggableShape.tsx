import { Circle, Square } from "lucide-react";
import { useDrag } from "react-dnd";

// Define drag item types
export const ItemTypes = {
  SHAPE: "shape",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
};

const DraggableShape = ({
  type,
  handleAddShape,
}: {
  type: "rectangle" | "circle";
  handleAddShape: (type: "rectangle" | "circle") => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SHAPE,
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-move ${isDragging ? "opacity-50" : "opacity-100"}`}
      style={{ width: "96px", height: "96px" }}
    >
      {type === "rectangle" ? (
        <Square
          className="w-24 h-24 block mr-2 cursor-move"
          onClick={() => handleAddShape("rectangle")}
        />
      ) : (
        <Circle
          className="w-24 h-24 block mr-2"
          onClick={() => handleAddShape("circle")}
        />
      )}
    </div>
  );
};

export default DraggableShape;
