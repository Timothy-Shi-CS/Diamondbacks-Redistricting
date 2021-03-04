import React, { useState, createContext } from 'react';

export const StateContext = createContext();

export const StateProvider = (props) => {
    const [stateFeature, setStateFeature] = useState({
        feature: null,
        jobs: null,
        job: null,
        stateCenter: null,
        incumbents:[]
    });

    const [page, setPage] = useState("state-selection");

    const [polygon, setPolygon] = useState({
        polygonData: null,
        polygonLayer: null
    })

    const [districts,setDistrics]=useState(null);

    return (
        <StateContext.Provider value={{ state: [stateFeature, setStateFeature], page: [page, setPage], polygon: [polygon, setPolygon], districts:[districts,setDistrics]}}>
            {props.children}
        </StateContext.Provider>
    )
}