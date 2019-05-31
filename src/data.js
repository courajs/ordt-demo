import { Sequence } from './ordts/sequence.js';

let s = new Sequence("0", [
  {type: 'root',
    id: {
      site: "0",
      index: 0,
      lamport: 0,
      wall: new Date().valueOf()
    },
  }
]);

s.become('hey');

export default s;

let LAST_ID = 0;

export function fork(seq) {
  return new Sequence((++LAST_ID).toString(), seq.atoms);
}
