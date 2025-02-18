const ResizeHandle = ({ position, onMouseDown }: { 
    position: string; 
    onMouseDown: (e: React.MouseEvent, position: string) => void;
  }) => (
    <div
      className="absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-pointer"
      style={{
        top: position.includes('top') ? '-6px' : position.includes('bottom') ? 'calc(100% - 6px)' : 'calc(50% - 6px)',
        left: position.includes('left') ? '-6px' : position.includes('right') ? 'calc(100% - 6px)' : 'calc(50% - 6px)',
      }}
      onMouseDown={(e) => onMouseDown(e, position)}
    />
  );

export default ResizeHandle;