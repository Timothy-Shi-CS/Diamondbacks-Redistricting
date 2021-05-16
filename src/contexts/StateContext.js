import React, { useState, createContext } from 'react';

export const StateContext = createContext();

export const StateProvider = (props) => {
    const [stateFeature, setStateFeature] = useState({
        feature: null,
        jobs: null,
        job: null,
        stateCenter: null,
        remainingJobs: null
    });

    const [page, setPage] = useState("state-selection"); //start at state selection

    const [polygon, setPolygon] = useState({
        polygonData: null,
        polygonLayer: null
    })

    const [districts, setDistrics] = useState(null);
    const [objValueParams, setObjValueParams] = useState({
        populationEquality: 0.62,
        splitCounties: 0.21,
        devAvgDistGeo: 0.79,
        devAvgDistPop: 0.5,
        devEnDistGeo: 0.44,
        devEnDistPop: 0.97,
        compactness: {
            type: 0,
            value: 0.5
        },
        efficiencyGap: 0.75
    })

    const [constraints, setConstraints] = useState({
        populationConstraint: {
            value: 0.147,
            type: 1
        },
        compactnessConstraint: {
            value: 0.23,
            type: 2
        },
        majorityMinorityConstraint: {
            value: 1,
            type: 2
        },
        threshold: 0.57,
        incumbents: [],
        incumbentsChecked: []
    })

    const [districtings, setDistrictings] = useState(null)

    return (
        <StateContext.Provider value={{
            state: [stateFeature, setStateFeature],
            page: [page, setPage],
            polygon: [polygon, setPolygon],
            districts: [districts, setDistrics],
            objective: [objValueParams, setObjValueParams],
            constraintsData: [constraints, setConstraints],
            districtings: [districtings, setDistrictings]
        }}>
            {props.children}
        </StateContext.Provider>
    )
}