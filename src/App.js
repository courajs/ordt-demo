import React, { useState } from 'react';
import './App.css';
import base from './data.js';
import { evaluate } from './ordts/sequence.js';

function App() {
  let [collections] = useState([base]);
  return (
    <div className="App">
      {collections.map(c => <StringThing collection={c} key={c.site} />)}
    </div>
  );
}

export default App;


function StringThing({collection}) {
  let [isOpen, setOpen] = useState(true);

  let value = evaluate(collection.atoms);

  return <div>
      <textarea defaultValue={value}></textarea>
      <button onClick={()=>setOpen(!isOpen)}>
        { isOpen ?
            "Hide history"
            :
            "Show history"
        }
      </button>
      { isOpen ?
          <History atoms={collection.atoms} />
          : null
      }
    </div>
}

function History({atoms}) {
  return <ol>
      {atoms.map(a=><li key={a.id.site+a.id.index}><pre>{JSON.stringify(a)}</pre></li>)}
    </ol>
}
