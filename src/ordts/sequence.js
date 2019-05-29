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

export function inferDiff(collection, str) {
  let { value, index } = indexedEvaluate(collection);

  let lastSame = 0;
  for (let i=0; i<value.length && i<str.length; i++) {
    if (value[i] == str[i]) {
      lastSame = i;
    } else {
      break;
    }
  }

  if (lastSame === value.length-1 && lastSame === str.length-1) {
    return {
      full: collection.slice(),
      fresh: [],
    }
  }
}
