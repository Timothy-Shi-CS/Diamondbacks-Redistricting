import React, { useContext } from 'react'
import StateSelection from './pages/StateSelection'
import { StateContext } from './contexts/StateContext'

function Application() {
    const [stateFeature, setStateFeature] = useContext(StateContext);
    let page;
    if(stateFeature.page==='state-selection'){
        page=<StateSelection/>
    }else{
        page=<div>
            {`${stateFeature.stateCenter} and ${stateFeature.feature.properties.name} and ${stateFeature.job+1}`}
        </div>
    }
    return (
        <div className="Application">
            
            {page}
        </div>
    )
}

export default Application