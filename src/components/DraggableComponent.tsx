import { useDrag } from "react-dnd";

function DraggableComponent(props) {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type,
    item: { id },
  }));
  return collected.isDragging ? (
    <div ref={dragPreview} />
  ) : (
    <div ref={drag} {...collected}>
      ...
    </div>
  );
}

export default DraggableComponent;
