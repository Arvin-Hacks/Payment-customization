// export {useDrag,useDrop} from 'react-dnd'
// export {} from 
export { DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';


export const checkFieldsValidityy = (array1, array2) => {


    const hasNullRename = array1.some(item => item.rename === null || item.rename === '');

    const hasNoDuplicates = array2.every(
        (item, index, arr) => arr.findIndex((el) => el.index === item.index) === index
    );
    return !hasNullRename && hasNoDuplicates;
}