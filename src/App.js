import './App.css';
import React, { useState } from 'react';

function App() {
  const [logged, setLooged] = useState(false)
  const [name, setName] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        {
          logged ? 
            <>
              <h1 className="title">
                Mensagens de {name}
              </h1>
            </> : 
            <>
              <h1 className="title">
                Usuário não está logado
              </h1>
              <button className='button'>
                Logar
              </button>
            </>
        }
      </header>
    </div>
  );
}

export default App;
