export function evaluate(collection) {
  let result = [];
  for (let atom of collection) {
    if (atom.type === 'insert') {
      result.push(atom.value);
    }
  }
  return result.join('');
}
