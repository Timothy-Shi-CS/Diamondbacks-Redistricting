import React, { useState, createContext } from 'react';

export const StateContext = createContext();

export const StateProvider = (props) => {
    const [stateFeature, setStateFeature] = useState({
        feature:null,
        jobs:null,
        job:null
    });

    return (
        <StateContext.Provider value={[stateFeature, setStateFeature]}>
            {props.children}
        </StateContext.Provider>
    )
}