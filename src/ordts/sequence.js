export function evaluate(collection) {
  return indexedEvaluate(collection).value;
}

export function indexedEvaluate(collection) {
  let result = [];
  for (let atom of collection) {
    if (atom.type === 'insert') {
      result.push(atom);
    } else if (atom.type === 'delete') {
      result.pop();
    }
  }

  return {
    value: result.map(a=>a.value.ch).join(''),
    index: result.map(a=>a.id),
  }
}
