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
    const [objValueParams, setObjValueParams]=useState({
        populationEquality:'62',
        splitCounties:'21',
        devAvgDist:'79',
        devAvgEnDistGeo:'44',
        devAvgEnDistPop:'97',
        geographicCompact:'10',
        graphCompact:'50',
        populationFatness:'83'
    })

    return (
        <StateContext.Provider value={{ state: [stateFeature, setStateFeature], page: [page, setPage], polygon: [polygon, setPolygon], districts:[districts,setDistrics], objective:[objValueParams,setObjValueParams]}}>
            {props.children}
        </StateContext.Provider>
    )
}