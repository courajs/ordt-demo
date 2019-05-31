import { Sequence } from './ordts/sequence.js';

let s = new Sequence("0.6593416794305285", [
  {type: 'root',
    id: {
      site: "0.6593416794305285",
      index: 0,
      lamport: 0,
      wall: new Date().valueOf()
    },
  }
]);

s.become('hey');

export default s;
