// DraggableList.js
import React, { useState } from 'react';
import DraggableItem from './DraggItem';

const DraggableList = ({ items }) => {
  const [listItems, setListItems] = useState(items);

  const handleDrag = (id, newIndex) => {
    const updatedList = [...listItems];
    const draggedItem = updatedList.find((item) => item.id === id);
    const remainingItems = updatedList.filter((item) => item.id !== id);

    updatedList.splice(newIndex, 0, draggedItem);

    setListItems([...updatedList, ...remainingItems]);
  };

  return (
    <div>
      {listItems.map((item, index) => (
        <DraggableItem
          key={item.id}
          id={item.id}
          text={item.text}
          index={index}
          onDrag={handleDrag}
        />
      ))}
    </div>
  );
};

export default DraggableList;
