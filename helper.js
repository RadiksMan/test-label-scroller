export function divideArray(dataArray, size) {
  let array = [...dataArray];
  let i = 0;
  let newArray = [];
  let percent = generatePercent(dataArray.length, size);
  console.log('dataArray.length', dataArray.length);
  console.log('percent', percent);
  while (i < size) {
    const needItems = Math.ceil(array.length * percent);
    const reducedItems = array.slice(0, needItems);
    newArray.push(reducedItems);
    array.splice(0, needItems);
    i++;
  }
  newArray[newArray.length - 1].unshift(...array);
  return newArray.filter(arrayItem => arrayItem.length > 0);
}

function generatePercent(length, size) {
  return size / length + 0.35;
}
