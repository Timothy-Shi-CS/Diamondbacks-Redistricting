import React, { useState, useContext } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const FirstFilter = () => {
    const { state, page } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page
    
    return (
        <div>
            <p>Chosen state: {`${stateFeature.feature.properties.name}`}</p>
            <p>Job number: {`${stateFeature.job + 1}`}</p>
            <p>State center: {`${stateFeature.stateCenter}`}</p>
        </div>
    )
}

export default FirstFilter;