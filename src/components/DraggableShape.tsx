import { Circle, Square } from "lucide-react";
import { useDrag } from "react-dnd";
import { FaRegCircle } from "react-icons/fa";
import { RiRectangleLine } from "react-icons/ri";

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
  handleAddShape: (
    type: "rectangle" | "circle",
    x?: number,
    y?: number
  ) => void;
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
        <RiRectangleLine
          className="w-24 h-24 block mr-2 cursor-move"
          onClick={() => handleAddShape("rectangle")}
        />
      ) : (
        <FaRegCircle
          className="w-20 h-24 block mr-2"
          onClick={() => handleAddShape("circle")}
        />
      )}
    </div>
  );
};

export default DraggableShape;
