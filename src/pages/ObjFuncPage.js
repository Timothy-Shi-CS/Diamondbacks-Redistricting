import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const ObjFuncPage = () => {
    const { state, page, districts } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [distColors, setDistColors] = useState(null);

    const [selectedDist, setSelectedDist] = useState(null);
    const [distNums, setDistNums] = useState(null);

    const [popUpText, setPopUpText] = useState("");
    const [popUpCoords, setPopUpCoords] = useState(null);

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const backToFirstFilter = (e) => {
        setStateDistricts(null);
        setPageName('first-filter')
    }
    const backToStateSelection = (e) => {
        setStateDistricts(null);
        setPageName('state-selection')
    }

    const enactedDistricts = require('../data/districts114.json');

    useEffect(() => {
        if (stateDistricts === null) {
            let coordHolder = {
                type: "FeatureCollection",
                features: [],
                distNums: [],
                distColors: []
            }
            let districts = [];
            let colors = [];
            const features = enactedDistricts.features;
            for (var i = 0; i < features.length; i++) {
                if (features[i].properties.STATENAME === stateFeature.feature.properties.name) {
                    coordHolder.features.push({
                        type: features[i].type,
                        geometry: {
                            type: features[i].geometry.type,
                            coordinates: features[i].geometry.coordinates
                        },
                        properties: features[i].properties
                    });

                    let red = Math.floor(Math.random() * 255);
                    let blue = Math.floor(Math.random() * 255);
                    let green = Math.floor(Math.random() * 255);

                    colors.push(`rgba(${red},${blue},${green},0.5)`);
                    districts.push(features[i].properties.DISTRICT);
                }
            }
            coordHolder.distNums = [...districts];
            coordHolder.distColors = [...colors];
            setStateDistricts(coordHolder);
        }
    }, []);

    const userClickedDistrict = (e) => {
        e.preventDefault();

        if (e.features[0].source !== 'composite') {
            const dist_num = parseInt(e.features[0].source.split('_')[1]);

            setPopUpCoords([...e.lngLat]);
            setPopUpText(`District ${dist_num}`);
            setSelectedDist(stateDistricts.features[dist_num - 1]);

            // console.log(e.lngLat);
            // console.log(stateCoords.features[dist_num - 1]);
            // console.log(dist_num);
        } else {
            setSelectedDist(null);
        }

    }

    const saveEverything = (e) => {
        e.preventDefault();
        setPageName('final-filters')
    }

    let render = "";

    if (stateDistricts) {
        render = stateDistricts.features.map((f, index) => {
            const f_data = {
                type: f.type,
                geometry: {
                    type: f.geometry.type,
                    coordinates: f.geometry.coordinates
                }
            };

            const f_layer = {
                'id': `district_${stateDistricts.distNums[index]}_layer`,
                'type': 'fill',
                'source': `district_${stateDistricts.distNums[index]}`,
                'layout': {},
                'paint': {
                    'fill-color': stateDistricts.distColors[index],
                    'fill-outline-color': 'rgba(255,255,255,1.0)'
                }
            };

            return (
                <Source
                    id={`district_${stateDistricts.distNums[index]}`}
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
                    <div className="d-flex flex-row justify-content-between">
                        <p class="h6 d-inline-block back-btn" onClick={backToFirstFilter}>Back</p>
                        <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                    </div>

                    <div align="center" style={{ paddingTop: "0.5rem" }}>
                        <p class="h3">Objective Function Weights</p>
                        <p class="text-muted"><em>Figure on the right shows the most recent district boundaries</em></p>
                        <hr></hr>
                    </div>
                    <div className="d-flex flex-column justify-content-between py-4" style={{ height: "77%", width: "100%" }}>
                        <div>
                            <p class="h5">Population equality</p>
                            <input type="range" class="form-range" id="pop_eq_range" />
                        </div>

                        <div>
                            <p class="h5">Split counties</p>
                            <input type="range" class="form-range" id="split_county_range" />
                        </div>

                        <div>
                            <p class="h6">Deviation from average districting</p>
                            <input type="range" class="form-range" id="dev_avg_dist_range" />
                        </div>

                        <div>
                            <p class="h6">Deviation from enacted districting</p>
                            <input type="range" class="form-range" id="dev_avg_en_dist_range" />
                        </div>

                        <div>
                            <p class="h5">Geographic compactness</p>
                            <input type="range" class="form-range" id="geo_compact_range" />
                        </div>

                        <div>
                            <p class="h5">Graph compactness</p>
                            <input type="range" class="form-range" id="graph_compact_range" />
                        </div>

                        <div>
                            <p class="h5">Population fatness</p>
                            <input type="range" class="form-range" id="pop_fat_range" />
                        </div>

                        <div>
                            <button type="button" className="btn btn-lg col-12 btn-primary" onClick={saveEverything}>Apply</button>
                        </div>
                    </div>

                </div>
            </div>


            <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={setViewport}
                mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
                onClick={userClickedDistrict}
            >
                {render}

                {popUpCoords && selectedDist ? (
                    <Popup
                        latitude={popUpCoords[1]}
                        longitude={popUpCoords[0]}
                        onClose={() => { setSelectedDist(null) }}
                    >
                        <div class="px-2">
                            <h5>{popUpText}</h5>
                        </div>
                    </Popup>
                ) : ""}
            </ReactMapGL>



        </div>

    )
}

export default ObjFuncPage;