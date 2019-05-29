import { evaluate, indexedEvaluate, inferDiff } from './ordts/sequence.js';

function id(index) {
  return {
    site: "0.6593416794305285",
    index: index,
    lamport: index,
    wall: 1558986047518,
  };
}

describe('sequence ORDT evaluation', function() {
  it('evaluates a basic string of atoms', function() {
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
    ];
    expect(evaluate(atoms)).toEqual('hi');
  });


  it('evaluates a string with deletions', function() {
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
      {type: 'delete', id: id(3), value: id(2)},
      {type: 'insert', id: id(4), value: {ch:'o', after: id(2)}},
    ];
    expect(evaluate(atoms)).toEqual('ho');
  });

  it('can provide an index for the id of each character', function() {
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'h', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'i', after: id(1)}},
      {type: 'delete', id: id(3), value: id(2)},
      {type: 'insert', id: id(4), value: {ch:'o', after: id(2)}},
    ];
    expect(indexedEvaluate(atoms)).toEqual({
      value: 'ho',
      index: [id(1), id(4)],
    });
  });
});

describe('string new atom calculation', function() {
  it('detects if no change', function() {
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
    ];
    expect(inferDiff(atoms, 'a')).toEqual({
      full: atoms,
      fresh: [],
    });
  });

  xit('can infer deletion operations', function(){
    let atoms = [
      {type: 'root', id: id(0)},
      {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
      {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}},
      {type: 'insert', id: id(3), value: {ch:'c', after: id(2)}},
    ];
    expect(inferDiff(atoms, 'ac')).toEqual({
      full: [
        {type: 'root', id: id(0)},
        {type: 'insert', id: id(1), value: {ch:'a', after: id(0)}},
        {type: 'insert', id: id(2), value: {ch:'b', after: id(1)}},
        {type: 'delete', id: id(4), value: id(2)},
        {type: 'insert', id: id(3), value: {ch:'c', after: id(2)}},
      ],
      fresh: [
        {type: 'delete', id: id(4), value: id(2)},
      ]
    });
  });
});
