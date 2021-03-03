import React, { useState, useContext } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const ObjFuncPage = () => {
    const { state, page } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;

    const backToFirstFilter = (e) => {
        setPageName('first-filter')
    }

    return (
        <div>
            <p class="h6 d-inline-block back-btn" onClick={backToFirstFilter}>Back</p>
        </div>
    )
}

export default ObjFuncPage;