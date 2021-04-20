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

    const [page, setPage] = useState("state-selection"); //start at state selection

    const [polygon, setPolygon] = useState({
        polygonData: null,
        polygonLayer: null
    })

    const [districts,setDistrics]=useState(null);
    const [objValueParams, setObjValueParams]=useState({
        populationEquality:'0.62',
        splitCounties:'0.21',
        devAvgDist:'0.79',
        devAvgEnDistGeo:'0.44',
        devAvgEnDistPop:'0.97',
        geographicCompact:'0.10',
        graphCompact:'0.50',
        populationFatness:'0.83',
        chosenCompactness:'',
        compactnessVal:'0.5'
    })

    const[populationConstraint,setPopulationConstraint]=useState({
        value:null,
        type:null
    })

    const[compactnessConstraint,setCompactnessConstraint]=useState({
        value:null,
        type:null
    })

    const [majorityMinorityConstraint,setMajorityMinorityConstraint]=useState(null)

    return (
        <StateContext.Provider value={{ 
            state: [stateFeature, setStateFeature], 
            page: [page, setPage], 
            polygon: [polygon, setPolygon], 
            districts:[districts,setDistrics], 
            objective:[objValueParams,setObjValueParams], 
            population:[populationConstraint,setPopulationConstraint], 
            compactness:[compactnessConstraint,setCompactnessConstraint],
            majorityMinority:[majorityMinorityConstraint,setMajorityMinorityConstraint]
            }}>
            {props.children}
        </StateContext.Provider>
    )
}