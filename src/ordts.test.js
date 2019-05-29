import { evaluate, indexedEvaluate } from './ordts/sequence.js';

function id(index) {
  return {
    site: "0.6593416794305285",
    index: index,
    lamport: index,
    wall: 1558986047518,
  };
}

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
