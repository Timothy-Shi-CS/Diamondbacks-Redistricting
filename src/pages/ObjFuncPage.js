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

    const [popEqRangeVal, setPopEqRangeVal] = useState('67');
    const [splitCountyRangeVal, setSplitCountyRangeVal] = useState('32');
    const [devAvgDistRangeVal, setDevAvgDistRangeVal] = useState('79');
    const [devAvgEnDistGeoRangeVal, setDevAvgEnDistGeoRangeVal] = useState('48');
    const [devAvgEnDistPopRangeVal, setDevAvgEnDistPopRangeVal] = useState('21');
    const [geoCompactRangeVal, setGeoCompactRangeVal] = useState('89');
    const [graphCompactRangeVal, setGraphCompactRangeVal] = useState('3');
    const [popFatRangeVal, setPopFatRangeVal] = useState('99');

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const backToFirstFilter = (e) => {
        //setStateDistricts(null);
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

    const popEqRange = (e) => {
        e.preventDefault();
        setPopEqRangeVal(e.target.value);
    }

    const splitCountyRange = (e) => {
        e.preventDefault();
        setSplitCountyRangeVal(e.target.value);
    }

    const devAvgDistRange = (e) => {
        e.preventDefault();
        setDevAvgDistRangeVal(e.target.value);
    }

    const devAvgEnDistGeoRange = (e) => {
        e.preventDefault();
        setDevAvgEnDistGeoRangeVal(e.target.value);
    }

    const devAvgEnDistPopRange = (e) => {
        e.preventDefault();
        setDevAvgEnDistPopRangeVal(e.target.value);
    }

    const geoCompactRange = (e) => {
        e.preventDefault();
        setGeoCompactRangeVal(e.target.value);
    }

    const graphCompactRange = (e) => {
        e.preventDefault();
        setGraphCompactRangeVal(e.target.value);
    }

    const popFatRange = (e) => {
        e.preventDefault();
        setPopFatRangeVal(e.target.value);
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-3" style={{ backgroundColor: "#fff", zIndex: "3" }}>
                    <div className="d-flex flex-row justify-content-between">
                        <p class="h6 d-inline-block back-btn" onClick={backToFirstFilter}>Back</p>
                        <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                    </div>

                    <div align="center" style={{ paddingTop: "1rem" }}>
                        <p class="h3">Objective Function Weights</p>
                        {/* <p class="text-muted"><em>Figure on the right shows the most recent district boundaries</em></p> */}
                        <hr></hr>
                    </div>
                    <div className="d-flex flex-column justify-content-between" style={{ height: "80%", width: "100%" }}>
                        <div>

                            <p class="h4">General</p>
                            <div class="px-3">
                                <div >
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Population equality:</p>
                                        <p class="h6 px-2 border border-primary">{popEqRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="pop_eq_range" onInput={popEqRange} value={popEqRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Split counties:</p>
                                        <p class="h6 px-2 border border-primary">{splitCountyRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="split_county_range" onInput={splitCountyRange} value={splitCountyRangeVal} />
                                </div>
                            </div>

                        </div>
                        <hr></hr>


                        <div>

                            <p class="h4">Deviation</p>
                            <div class="px-3">
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Deviation from average districting:</p>
                                        <p class="h6 px-2 border border-primary">{devAvgDistRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="dev_avg_dist_range" onInput={devAvgDistRange} value={devAvgDistRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Deviation from enacted districting (geometric):</p>
                                        <p class="h6 px-2 border border-primary">{devAvgEnDistGeoRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="dev_avg_en_dist_geo_range" onInput={devAvgEnDistGeoRange} value={devAvgEnDistGeoRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Deviation from enacted districting (population):</p>
                                        <p class="h6 px-2 border border-primary">{devAvgEnDistPopRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="dev_avg_en_dist_pop_range" onInput={devAvgEnDistPopRange} value={devAvgEnDistPopRangeVal} />
                                </div>

                            </div>
                        </div>
                        <hr></hr>

                        <div>
                            <p class="h4">Compactness</p>
                            <div class="px-3">
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Geographic compactness:</p>
                                        <p class="h6 px-2 border border-primary">{geoCompactRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="geo_compact_range" onInput={geoCompactRange} value={geoCompactRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Graph compactness:</p>
                                        <p class="h6 px-2 border border-primary">{graphCompactRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="graph_compact_range" onInput={graphCompactRange} value={graphCompactRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Population fatness:</p>
                                        <p class="h6 px-2 border border-primary">{popFatRangeVal}</p>
                                    </div>
                                    <input type="range" class="form-range" min="0" max="100" step="1" id="pop_fat_range" onInput={popFatRange} value={popFatRangeVal} />
                                </div>
                            </div>
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
                        <div class="px-2" style={{ zIndex: '2' }}>
                            <h5>{popUpText}</h5>
                        </div>
                    </Popup>
                ) : ""}
            </ReactMapGL>

            <p style={{ position: 'absolute', top: '95%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1' }}><strong><em>Figure shows the most recent district boundaries</em></strong></p>



        </div>

    )
}

export default ObjFuncPage;