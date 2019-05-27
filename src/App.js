import React, { useState } from 'react';
import './App.css';
import base from './data.js';
import { collectString } from './ordts.js';

function App() {
  let [collections, setCollections] = useState([base]);
  return (
    <div className="App">
      {collections.map(c => <StringThing collection={c} />)}
    </div>
  );
}

export default App;


function StringThing({collection}) {
  let [isOpen, setOpen] = useState(false);

  let value = collectString(collection.atoms);

  return <div>
      <textarea>{value}</textarea>
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
      {atoms.map(a=><li><pre>{JSON.stringify(a)}</pre></li>)}
    </ol>
}
