import React, { useState } from 'react';
import './App.css';
import base, {fork} from './data.js';
// import { Sequence } from './ordts/sequence.js';

function App() {
  let [versions] = useState([base]);
  return (
    <div className="App">
      {versions.map(seq => <Text sequence={seq} key={seq.id} />)}
    </div>
  );
}

export default App;

function Text({sequence}) {
  let [isOpen, setOpen] = useState(true);
  let [value, setValue] = useState(sequence.evaluate());

  let update = (e) => {
    sequence.become(e.target.value);
    setValue(sequence.evaluate());
  }

  return <div>
      <textarea
        defaultValue={value}
        onInput={update}
      ></textarea>
      <button onClick={()=>setOpen(!isOpen)}>
        { isOpen ?
            "Hide history"
            :
            "Show history"
        }
      </button>
      { isOpen ?
          <History atoms={sequence.atoms} />
          : null
      }
    </div>
}

function atomKey(atom) {
  return atom.id.site + atom.id.index;
}

function History({atoms}) {
  return <div className="atom-list">{atoms.map(a=><Atom atom={a} key={atomKey(a)} />)}</div>
}

// const colors = ['#058e03', '#005cc5', '#c5005b', '#c5c505'];
// https://coolors.co/f6f7eb-e94f37-393e41-3f88c5-44bba4
const colors = 'f6f7eb-e94f37-393e41-3f88c5-44bba4'.split('-').reverse();

function idMsg(id) {
  if (id.lamport === 0) {
    return '∅';
  } else {
    return `S${id.site}@T${id.lamport}`;
  }
}

function atomMsg(atom) {
  switch(atom.type) {
    case 'root':
      return '∅';
    case 'delete':
      return 'Delete';
    case 'insert':
      return `Insert '${atom.value.ch}'`;
    default:
      throw new Error('unrecognized atom type');
  }
}
function atomParentMsg(atom) {
  switch(atom.type) {
    case 'root':
      return '';
    case 'delete':
      return idMsg(atom.value);
    case 'insert':
      return idMsg(atom.value.after);
    default:
      throw new Error('unrecognized atom type');
  }
}
function c(atom) {
  console.log('#'+colors[colors.length - atom.id.site-1]);
  return '#'+colors[atom.id.site];
}

function Atom({atom}) {
  return <div className="card">
          <div className="card-header" style={{backgroundColor:c(atom)}}>{idMsg(atom.id)}</div>
          <div className="card-main">
            <div className="description">{atomMsg(atom)}</div>
            <div className="parent">{atomParentMsg(atom)}</div>
          </div>
        </div>
}
