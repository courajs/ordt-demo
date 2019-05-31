export function idEq(a, b) {
  return a.site === b.site && a.index === b.index;
}

export class Sequence {
  constructor(id, atoms) {
    this.id = id;
    this.atoms = atoms;
    this._determineIndexAndLamport();
  }

  _determineIndexAndLamport() {
    let index = 0;
    let lamport = 0;
    for (let a of this.atoms) {
      if (a.id.lamport > lamport) {
        lamport = a.id.lamport;
      }
      if (a.id.site === this.id && a.id.index > index) {
        index = a.id.index;
      }
    }
    this.currentIndex = index;
    this.currentLamport = lamport;
  }

  nextId() {
    return {
      site: this.id,
      index: ++this.currentIndex,
      lamport: ++this.currentLamport,
      wall: new Date().valueOf(),
    };
  }

  evaluate() {
    return this.indexedEvaluate().value;
  }

  indexedEvaluate() {
    let result = [];
    for (let atom of this.atoms) {
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

  insertAtom(atom) {
    if (atom.id.site !== this.id) {
      throw new Error('atom merge is not yet implemented for remote atoms');
    }

    if (atom.type === 'delete') {
      let i = this.atoms.findIndex(a => idEq(a.id, atom.value));
      if (i === -1) { return false; }
      this.atoms.splice(i+1, 0, atom);
      return true;
    } else if (atom.type === 'insert') {
      let i = this.atoms.findIndex(a => idEq(a.id, atom.value.after));
      if (i === -1) { return false; }
      while (this.atoms[i+1] && this.atoms[i+1].type === 'delete') { 
        i++;
      }
      this.atoms.splice(i+1, 0, atom);
      return true;
    }
  }

  // Because of the way DOM input events work, we don't get granular information
  // about exactly how an input/textarea is being changed. Instead, we have to
  // figure it out based on the old and new values.
  //
  // This assumes that any edits have to be on a contiguous range - simultaneous
  // edits on separate parts of the string shouldn't be possible in html inputs.
  //
  // Determine a diffRange - which range of characters should be removed,
  // and where should the new ones be placed.
  //
  // range starts at the front edge of `start` character, ends at front edge of
  // `end` character. So start=0,end=0, will insert at start of string.
  // start=len-1,end=len-1 will insert at end of string.
  // start=2,end=4, chars='hey' will delete 2nd & 3rd characters, and insert the
  // 3-long string 'hey' in that slot.
  //
  // start=3, end=5, chars='xyz'
  // 'ab cd ef'
  // 'ab xyz ef'
  //
  // start=0, end=0, chars='hello '
  // 'world'
  // 'hello world'
  //
  // start=5, end=5, chars=' world'
  // 'hello'
  // 'hello world'
  become(str) {
    let { value, index } = this.indexedEvaluate();

    let start = 0;
    while (start < value.length && start < str.length && value[start] === str[start]) {
      start++;
    }

    let back = 0;
    while (
      value.length - back > start &&
      str.length - back > start &&
      value[value.length-1 - back] === str[str.length-1 - back]
    ) {
      back++;
    }

    let fresh = [];

    for (let i = start; i < value.length - back; i++) {
      let atom = {
        type: 'delete',
        id: this.nextId(),
        value: index[i],
      }
      fresh.push(atom);
      this.insertAtom(atom);
    }

    let prevId = index[start-1] || this.atoms[0].id;
    for (let i = start; i < str.length - back; i++) {
      let id = this.nextId();
      let atom = {
        type: 'insert',
        id: id,
        value: {
          after: prevId,
          ch: str[i],
        },
      };
      prevId = id;
      fresh.push(atom);
      this.insertAtom(atom);
    }

    return fresh;
  }
}
