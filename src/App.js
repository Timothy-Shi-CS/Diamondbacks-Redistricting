import React from 'react'

import StateSelection from './pages/StateSelection'

import { StateProvider } from './contexts/StateContext'

function App() {
  return (
    <StateProvider>
      <div className="App">
        <StateSelection />
      </div>
    </StateProvider>
  );
}

export default App;
