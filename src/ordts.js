export function collectString(collection) {
  let result = [];
  for (let atom of collection) {
    if (atom.type === 'insert') {
      result.push(atom.value);
      console.log(atom);
    }
  }
  console.log('nah');
  return result.join('');
}
