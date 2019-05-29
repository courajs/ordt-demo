export function evaluate(collection) {
  let result = [];
  for (let atom of collection) {
    if (atom.type === 'insert') {
      result.push(atom.value.ch);
    } else if (atom.type === 'delete') {
      result.pop();
    }
  }
  return result.join('');
}
