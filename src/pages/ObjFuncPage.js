import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const ObjFuncPage = () => {
    const { state, page } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateCoords, setStateCoords] = useState(null);
    const [distColors, setDistColors] = useState(null);

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const backToFirstFilter = (e) => {
        setPageName('first-filter')
    }
    const backToStateSelection = (e) => {
        setPageName('state-selection')
    }

    const enactedDistricts = require('../data/districts114.json');

    useEffect(() => {
        let coordHolder = {
            type: "FeatureCollection",
            features: []
        }

        let colors = [];
        const features = enactedDistricts.features;
        for (var i = 0; i < features.length; i++) {
            if (features[i].properties.STATENAME === stateFeature.feature.properties.name) {
                coordHolder.features.push({
                    type: features[i].type,
                    geometry: {
                        type: features[i].geometry.type,
                        coordinates: features[i].geometry.coordinates
                    }
                });

                let red = Math.floor(Math.random() * 255);
                let blue = Math.floor(Math.random() * 255);
                let green = Math.floor(Math.random() * 255);

                colors.push(`rgba(${red},${blue},${green},0.5)`);
            }
        }
        setStateCoords(coordHolder);
        setDistColors(colors);
    }, [])

    let render = "";

    if (stateCoords) {
        render = stateCoords.features.map((f, index) => {
            const f_data = {
                type: f.type,
                geometry: {
                    type: f.geometry.type,
                    coordinates: f.geometry.coordinates
                }
            };

            const f_layer = {
                'id': `district_${index + 1}_layer`,
                'type': 'fill',
                'source': `district_${index + 1}`,
                'layout': {},
                'paint': {
                    'fill-color': distColors[index],
                    'fill-outline-color': 'rgba(255,255,255,1.0)'
                }
            };

            return (
                <Source
                    id={`district_${index + 1}`}
                    type='geojson'
                    data={f_data}
                >
                    <Layer {...f_layer} />
                </Source>
            )
        })
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-2" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    <p class="h6 d-inline-block back-btn" onClick={backToFirstFilter}>Back</p>
                    <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                </div>
            </div>


            <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={setViewport}
                mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
            >
                {render}
            </ReactMapGL>


        </div>

    )
}

export default ObjFuncPage;