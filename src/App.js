import React, { useState } from 'react';
import './App.css';
import base from './data.js';
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

function History({atoms}) {
  return <ol>
      {atoms.map(a=><li key={a.id.site+a.id.index}><pre>{JSON.stringify(a)}</pre></li>)}
    </ol>
}
