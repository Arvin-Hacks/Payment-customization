// DraggableItem.js
import React from 'react';
import Draggable from 'react-draggable';

const DraggableItem = ({ id, text, index, onDrag }) => {
  const handleDrag = (e, ui) => {
    const newIndex = Math.round(ui.y / (ui.height / 2));
    onDrag(id, newIndex);
  };

  return (
    <Draggable onDrag={handleDrag} bounds="parent">
      <div style={{ padding: '8px', border: '1px solid #ccc', margin: '4px', cursor: 'grab' }}>
        {text}
      </div>
    </Draggable>
  );
};

export default DraggableItem;
