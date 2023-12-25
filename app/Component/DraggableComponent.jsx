import React from 'react';
import { DragDropContext, Draggable, Droppable } from '../utils/utils.server'
// import 'bootstrap/dist/css/bootstrap.min.css';


const DraggableList = () => {

  const items = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
];
  const onDragEnd = (result) => {
    // Handle the drag-and-drop logic here
  };

  return (
    <div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable>
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      {item.title}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
        <h1>ajhgjs</h1>
      </DragDropContext>
    </div>
  );
};

export default DraggableList;
