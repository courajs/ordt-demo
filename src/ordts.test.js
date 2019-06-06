import { Sequence } from './ordts/sequence.js';

const site = "5";
const site2 = "6";
const site3 = "7";
const siteother = "q";
function id(index, s = site) {
  return {
    site: s,
    index: index,
    lamport: index,
  };
}

describe('sequence ORDT evaluation', function() {
  it('evaluates a basic string of atoms', function() {
    let s = new Sequence(site, [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
    ]);
    expect(s.evaluate()).toEqual('hi');
  });

  it('evaluates a string with deletions', function() {
    let s = new Sequence(site, [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
      {type: 'delete', id: id(3), value: id(2)},
      {type: 'insert', id: id(4), value: {ch:'o', after: id(2)}},
    ]);
    expect(s.evaluate()).toEqual('ho');
  });

  it('evaluates concurrent deletes properly', function() {
    let s1 = new Sequence(site, [{type:'root', id: id(0)}]);
    s1.become('abc');
    let s2 = new Sequence(site2, s1.atoms);
    s1.become('aonec');
    s2.become('atwoc');

    s1.mergeAtoms(s2.atoms);

    expect(s1.evaluate()).toEqual('aonetwoc');
  });

  it('can provide an index for the id of each character', function() {
    let s = new Sequence(site, [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
      {type: 'delete', id: id(3), value: id(2)},
      {type: 'insert', id: id(4), value: {ch:'o', after: id(2)}},
    ]);
    expect(s.indexedEvaluate()).toMatchObject({
      value: 'ho',
      index: [id(1), id(4)],
    });
  });

  it("can provide the index in the final string of a given atom", function() {
    let s = new Sequence(site, [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
    ]);
    expect(s.indexBefore(id(1))).toEqual(0);
    expect(s.indexAfter(id(1))).toEqual(1);
    expect(s.indexBefore(id(2))).toEqual(1);
    expect(s.indexAfter(id(2))).toEqual(2);

    s = new Sequence(site);
    // root = id(0), t = id(1), s = id(4), last e = id(9)
    // indexBefore(s) = 3
    // indexAfter(s) = 4
    s.become('this here');

    // s = id(4)
    // indexBefore(s) = 3
    // indexAfter(s) = 3
    s.become('thi here');
    expect(s.indexBefore(id(4))).toEqual(3);
    expect(s.indexAfter(id(4))).toEqual(3);
  });
});

describe('mutation operations', function() {
  it('makes no edit if the string is the same', function() {
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}},
      {type: 'delete', id: id(4), value: id(2)},
      {type: 'insert', id: id(3), value: {ch:'c', after: id(2)}},
    ];
    let s = new Sequence(site, atoms);
    expect(s.become('ac')).toMatchObject([]);
    expect(s.atoms).toMatchObject(atoms);
  });

  it('can replace ranges of characters', function() {
    // 'abc' -> 'axyc'
    // delete the 'b', and insert an 'xy' after the 'a'.
    let atoms = [
        {type: 'root', id: id(0)},
        {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
        {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}},
        {type: 'insert', id: id(3), value: {ch:'c', after: id(2)}},
    ];
    let s = new Sequence(site, atoms);
    expect(s.become('axyc')).toMatchObject([
        {type: 'delete', id: id(4), value: id(2)},
        {type: 'insert', id: id(5), value: {ch:'x', after: id(1)}},
        {type: 'insert', id: id(6), value: {ch:'y', after: id(5)}},
    ]);
    expect(s.atoms).toMatchObject([
        {type: 'root', id: id(0)},
        {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
        {type: 'insert', id: id(5), value: {ch:'x', after: id(1)}},
        {type: 'insert', id: id(6), value: {ch:'y', after: id(5)}},
        {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}},
        {type: 'delete', id: id(4), value: id(2)},
        {type: 'insert', id: id(3), value: {ch:'c', after: id(2)}},
    ]);
  });

  it('handles insertions and deletions in all positions', function() {
    let cases = [
      ['world', 'hello world', 6], // insert at beginning
      ['hello world', 'world', 6], // delete at beginning
      ['hello', 'hello world', 6], // insert at end
      ['hello world', 'hello', 6], // delete at end
      ['abcdef', 'abxyzef', 5],    // replace a range with a longer range
      ['abcdef', 'abxef', 3],      // replace a range with a shorter range
    ];

    for (let [start, target, diff] of cases) {
      let s = new Sequence(site, [{type: 'root', id: id(0)}]);
      s.become(start);
      expect(s.evaluate()).toEqual(start);
      expect(s.become(target).length).toEqual(diff);
      expect(s.evaluate()).toEqual(target);
    }
  });

  it('sorts an atom\'s children by descending lamport, then by ascending site id', function(){
    let root = {type: 'root', id: id(0)};

    // sorts correctly when inserting a newer branch later
    let s = new Sequence(site, [root]);
    s.insertAtom({type:'insert', id: id(1), value: {ch:'a', after:id(0)}});
    s.insertAtom({type:'insert', id: id(2, siteother), value: {ch:'b', after:id(0)}});
    expect(s.evaluate()).toEqual('ba');

    // sorts correctly when inserting an older branch later
    s = new Sequence(site, [root]);
    s.insertAtom({type:'insert', id: id(2), value: {ch:'a', after: id(0)}});
    s.insertAtom({type:'insert', id: id(1, siteother), value: {ch:'b', after: id(0)}});
    expect(s.evaluate()).toEqual('ab');
  });

  it('always sorts sibling deletes before inserts', function() {
    let s1 = new Sequence(site,[{type:'root',id:id(0)}]);
    s1.become('ab');
    let s2 = new Sequence(site2,s1.atoms);

    // delete with lamport 3
    s1.become('a');

    // an insert after the deleted character, with a higher lamport than the deletion
    s2.become('abc');
    s2.become('abxc');

    s1.mergeAtoms(s2.atoms);

    expect(s1.evaluate()).toEqual('axc');
    expect(s1.atoms).toMatchObject([
      {type:'root',id:id(0)},
      {type:'insert',id:id(1),value:{ch:'a', after:id(0)}},
      {type:'insert',id:id(2),value:{ch:'b', after:id(1)}},
      {type:'delete',id:id(3),value:id(2)},
      {
        type:'insert',
        id:{site:site2, lamport:4, index:2},
        value:{ch:'x', after:id(2)},
      },
      {
        type:'insert',
        id: {site:site2, lamport:3, index:1},
        value:{ch:'c', after:id(2)}},
    ]);
  });

  // The example from http://archagon.net/blog/2018/03/24/data-laced-with-history/#causal-trees
  it('merges a complex concurrent edit', function() {
    let s1 = new Sequence(site, [{type:'root',id:id(0)}]);
    s1.become('cmd');
    let s2 = new Sequence(site2, s1.atoms);
    let s3 = new Sequence(site3, s1.atoms);
    s1.become('ctrl');
    s2.become('cmd-fuck');
    s2.become('cmd');
    s2.become('cmd-alt');
    s3.become('cmd-del');
    s1.mergeAtoms(s2.atoms);
    s1.mergeAtoms(s3.atoms);
    expect(s1.evaluate()).toEqual('ctrl-alt-del');
  });
});
