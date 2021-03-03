import React, { useState, createContext } from 'react';

export const StateContext = createContext();

export const StateProvider = (props) => {
    const [stateFeature, setStateFeature] = useState({
        feature:null,
        jobs:null,
        job:null,
        stateCenter:null,
    });

    const [page,setPage]=useState("state-selection");

    const [polygon,setPolygon]=useState({
        polygonData:null,
        polygonLayer:null
    })

    return (
        <StateContext.Provider value={{state:[stateFeature, setStateFeature], page:[page,setPage], polygon:[polygon, setPolygon]}}>
            {props.children}
        </StateContext.Provider>
    )
}