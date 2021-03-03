import React, { useContext } from 'react'

import StateSelection from './pages/StateSelection'
import FirstFilter from './pages/FirstFilter'
import ObjFuncPage from './pages/ObjFuncPage'

import { StateContext } from './contexts/StateContext'

function Application() {
    const { state, page } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page

    let renderPage;

    if (pageName === 'state-selection') {
        renderPage = <StateSelection />
    } else if (pageName === 'first-filter') {
        renderPage = <FirstFilter />
    } else if (pageName === 'obj-func-page') {
        renderPage = <ObjFuncPage />
    }

    return (
        <div className="Application">
            {renderPage}
        </div>
    )
}

export default Application