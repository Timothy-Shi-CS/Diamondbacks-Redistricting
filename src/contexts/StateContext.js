import React, { useState, createContext } from 'react';

export const StateContext = createContext();

export const StateProvider = (props) => {
    const [stateFeature, setStateFeature] = useState({
        feature:null,
        jobs:null,
        job:null,
        stateCenter:null,
        page:"state-selection"
    });

    return (
        <StateContext.Provider value={[stateFeature, setStateFeature]}>
            {props.children}
        </StateContext.Provider>
    )
}