import React, { useContext } from 'react'

import StateSelection from './pages/StateSelection'
import Constraints from './pages/Constraints'
import Weights from './pages/Weights'
import Analysis from './pages/Analysis'

import { StateContext } from './contexts/StateContext'

function Application() {
    const { state, page } = useContext(StateContext);
    const [pageName, setPageName] = page

    let renderPage;

    if (pageName === 'state-selection') {
        renderPage = <StateSelection />
    } else if (pageName === 'constraints') {
        renderPage = <Constraints />
    } else if (pageName === 'weights') {
        renderPage = <Weights />
    } else if (pageName === 'analysis') {
        renderPage = <Analysis />
    }

    return (
        <div className="Application">
            {renderPage}
        </div>
    )
}

export default Application