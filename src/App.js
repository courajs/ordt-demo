import React, { useState } from 'react';
import './App.css';
import base, {fork} from './data.js';
import { Sequence, idEq } from './ordts/sequence.js';

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
  let [{value,index}, setValue] = useState(sequence.indexedEvaluate());

  let update = (e) => {
    sequence.become(e.target.value);
    setValue(sequence.indexedEvaluate());
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
          <History atoms={sequence.atoms} index={index}/>
          : null
      }
    </div>
}

function atomKey(atom) {
  return atom.id.site + atom.id.index;
}

function History({atoms, index}) {
  console.log(index);
  return <div className="atom-list">{
    atoms.map(a=> <Atom atom={a} included={index.find(id=>idEq(id,a.id))} key={atomKey(a)} />)
  }</div>
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

function atomMsg(atom, included=false) {
  switch(atom.type) {
    case 'root':
      return '∅';
    case 'delete':
      return 'Delete';
    case 'insert':
      if (included) {
        return <>Insert '<strong style={{fontSize:'1.4em'}}>{atom.value.ch}</strong>'</>
      } else {
        return `Insert '${atom.value.ch}'`;
      }
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
  return '#'+colors[atom.id.site];
}

function Atom({atom, included}) {
  let names = ['card'];
  if (included) {
    names.push('included');
  }
  return <div className={names.join(' ')}>
          <div className="card-header" style={{backgroundColor:c(atom)}}>{idMsg(atom.id)}</div>
          <div className="card-main">
            <div className="description">{atomMsg(atom, included)}</div>
            <div className="parent">{atomParentMsg(atom)}</div>
          </div>
        </div>
}
