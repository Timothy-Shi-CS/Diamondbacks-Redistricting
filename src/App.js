import React from 'react'

import Application from './Application'
import { StateProvider } from './contexts/StateContext'

import './App.css'

function App() {
  return (
    <StateProvider>
      <div className="App">
        <Application/>
      </div>
    </StateProvider>
  );
}

export default App;
