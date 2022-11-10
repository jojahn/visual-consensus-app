export function sortMessageBySentDate(a, b) {
  const aTime = new Date(a.sent).getTime();
  const bTime = new Date(b.sent).getTime();
  if (aTime < bTime) {
    return -1;
  } else if (aTime > bTime) {
    return 1;
  } else {    
    return sortMessageById(a, b);
  }
}

export function sortMessageById(a, b) {
  if (a.id > b.id) {
    return -1;
  } else if (a.id < b.id) {
    return 1;
  } else {
    return 0;
  }
}

export function getLengthByText(text, fontSize, fontFamily = "courier new") {
  switch (fontFamily) {
  case "courier new":
    return;
  default:
    throw `getLengthByText: Font family '${fontFamily}' not supported`;
  }
}

// TODO: Also group by Sender or Reciever
export function groupBySentDateAndProperties(threshold, equals:((a: any, b: any) => any)) {
  return (prev: any[][] | any[], cur: any) => {
    const matches = (i) => equals(cur, i)
      && Math.abs(new Date(i.sent).getTime() - new Date(cur.sent).getTime()) < threshold;
    const matchGroupIdx = (array) =>
      array.findIndex(i => matches(i));
    
    const checkGroupsAndItems = () =>
      prev.findIndex((i) => Array.isArray(i) ? matchGroupIdx(i) !== -1 : matches(i));

    // group already exists
    const idx = checkGroupsAndItems();
    if (idx !== -1 && prev[idx] && Array.isArray(prev[idx])) {
      prev[idx].push(cur);
    } else if (idx !== -1 && idx) {
      // create new group
      prev[idx] = [prev[idx], cur];
    } else {
      // just normally insert item
      prev.push(cur);
    }
    return prev;
  }
}