import React from 'react'

import Application from './Application'
import { StateProvider } from './contexts/StateContext'

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
