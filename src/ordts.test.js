import { Sequence } from './ordts/sequence.js';

const site = "0.6593416794305285";
function id(index) {
  return {
    site,
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
});

describe('mutation operations', function() {
  it('detects if no change', function() {
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


  it('can append to end', function() {
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
    ];
    let s = new Sequence(site, atoms);
    expect(s.become('ab')).toMatchObject([
        {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}}
    ]);
    expect(s.atoms).toMatchObject([
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}},
    ]);
  });

  it('can replace longer within', function() {
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

  it('acceptance test', function() {
    let cases = [
      ['world', 'hello world', 6],
      ['hello world', 'world', 6],
      ['hello', 'hello world', 6],
      ['hello world', 'hello', 6],
      ['abcdef', 'abxyzef', 5],
      ['abcdef', 'abxef', 3],
    ];

    for (let [start, target, diff] of cases) {
      let s = new Sequence(site, [{type: 'root', id: id(0)}]);
      s.become(start);
      expect(s.evaluate()).toEqual(start);
      expect(s.become(target).length).toEqual(diff);
      expect(s.evaluate()).toEqual(target);
    }
  });
});
