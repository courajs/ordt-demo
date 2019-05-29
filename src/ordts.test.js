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
    {type: 'insert', value: 'h', id: id(1)},
    {type: 'insert', value: 'i', id: id(2)},
  ];
  expect(evaluate(atoms)).toEqual('hi');
});
