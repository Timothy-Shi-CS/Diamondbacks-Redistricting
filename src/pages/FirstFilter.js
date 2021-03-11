import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const FirstFilter = () => {
    const { state, page, districts } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;

    const [popUpText, setPopUpText] = useState("");
    const [popUpCoords, setPopUpCoords] = useState(null);
    const [selectedDist, setSelectedDist] = useState(null);
    const [popEqualValue, setPopEqualValue] = useState('75')
    const [majMinValue, setMajMinValue] = useState('2');
    const [compactValue, setCompactValue] = useState('0.51');
    let [checks, setChecks] = useState([false, false, false, false, false, false, false, false]);
    const [showPopup, setShowPopup] = useState(false);
    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    // const polygonData = {
    //     'type': stateFeature.feature.type,
    //     'geometry': {
    //         'type': stateFeature.feature.geometry.type,
    //         'coordinates': stateFeature.feature.geometry.coordinates
    //     }
    // };

    // const polygonLayer = {
    //     'id': 'state-layer',
    //     'type': 'fill',
    //     'source': 'state',
    //     'layout': {},
    //     'paint': {
    //         'fill-color': 'rgba(132, 245, 134, 0.5)',
    //         'fill-outline-color': 'rgba(0, 0, 0, 0.5)'
    //     }
    // };

    const MODAL_STYLES = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        backgroundColor: "rgba(255,255,255,1.0)",
        zIndex: 1000
    }

    const OVERLAY_STYLES = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000
    }

    const enactedDistricts = require('../data/districts114.json');

    useEffect(() => {
        if (stateFeature.feature !== null) {
            setChecks([...stateFeature.incumbents]);
        }
        console.log(stateDistricts)
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
    }, [])

    const openIncumbentPopup = (e) => {
        e.preventDefault();
        setShowPopup(true);
    }

    const saveEverything = (e) => {
        e.preventDefault();
        setStateFeature({
            feature: stateFeature.feature,
            jobs: stateFeature.jobs,
            job: stateFeature.job,
            stateCenter: stateFeature.stateCenter,
            incumbents: [...checks]
        })

        setPageName('obj-func-page');
    }

    const backToStateSelection = (e) => {
        console.log('back to state selection');
        resetChecks();
        setStateDistricts(null);
        setPageName('state-selection');
    }

    const userChecked = (e) => {
        let index = parseInt(e.target.id.split('t')[1])
        let tempChecks = [...checks];
        tempChecks[index - 1] = !tempChecks[index - 1]
        setChecks([...tempChecks]);
    }

    const resetChecks = (e) => {
        let reset = [false, false, false, false, false, false, false, false];
        setChecks([...reset]);
    }

    const popEqual = (e) => {
        e.preventDefault();
        setPopEqualValue(e.target.value)
    }

    const majMin = (e) => {
        e.preventDefault();
        setMajMinValue(e.target.value);
    }

    const compact = (e) => {
        e.preventDefault();
        setCompactValue(e.target.value);
    }

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

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                <div id="left-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Back</p>
                    <div align="center" style={{ paddingTop: "1.5rem" }}>
                        <p class="h2">Constraints</p>
                        <p class="h6"><em>Job {stateFeature.job + 1}: {numberWithCommas(stateFeature.jobs[stateFeature.job])} redistrictings</em></p>
                        <hr></hr>
                    </div>
                    <div className="d-flex flex-column justify-content-between py-4" style={{ height: "80%", width: "100%" }}>
                        <div>
                            <p class="h4">Incumbent Protection:</p>
                            <a class="link-primary" onClick={openIncumbentPopup}>Click to choose incumbents</a>
                        </div>

                        <div>
                            <div class="d-flex flex-row justify-content-between">
                                <p class="h4">Population Equality:</p>
                                {/* <p class="h4 px-2 border border-primary">{popEqualValue}</p> */}
                                <input type="number" value={popEqualValue} disabled="disabled" style={{width:'60px'}}/>
                            </div>

                            
                            <input type="range" class="form-range" min="0" max="100" step="1" id="pop_eq_range" onInput={popEqual} value={popEqualValue} />
                            <div class="d-flex flex-row justify-content-between">
                                <p>0</p>
                                <p>100</p>
                            </div>
                        </div>

                        {/* <div>
                            <p class="h5">Incumbent Protection</p>
                            <input type="range" class="form-range" id="incum_prot_range" />
                        </div> */}

                        <div>
                            <div class="d-flex flex-row justify-content-between">
                                <p class="h4">Majority-Minority Districts:</p>
                                <input type="number" value={majMinValue} disabled="disabled" style={{width:'60px'}}/>
                            </div>
                            <input type="range" class="form-range" min="0" max="4" step="1" id="maj_min_range" onInput={majMin} value={majMinValue} />
                            <div class="d-flex flex-row justify-content-between">
                                <p>0</p>
                                <p>4</p>
                            </div>
                        </div>

                        <div>
                            <div class="d-flex flex-row justify-content-between">
                                <p class="h4">Compactness:</p>
                                <input type="number" value={compactValue} disabled="disabled" style={{width:'60px'}}/>
                            </div>
                            <input type="range" class="form-range" min="0" max="1" step="0.01" id="compact_range" onInput={compact} value={compactValue} />
                            <div class="d-flex flex-row justify-content-between">
                                <p>0</p>
                                <p>1</p>
                            </div>
                        </div>

                        <div>
                            <button type="button" className="btn btn-lg col-12 btn-primary" onClick={saveEverything}>Proceed</button>
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
                {/* <Source
                    id="state"
                    type="geojson"
                    data={polygonData}
                >
                    <Layer
                        {...polygonLayer}
                    />
                </Source> */}
            </ReactMapGL>


            {showPopup ? (
                <div className="incumbentPopup">
                    <div style={OVERLAY_STYLES} />
                    <div className="card" style={MODAL_STYLES}>
                        {/* {children} */}
                        <div class="card-body">
                            <h5 class="card-title">Choose your incumbents</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Edits are automatically saved</h6>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent1" checked={checks[0]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent1">
                                    Jimmy Lin (R)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent2" checked={checks[1]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent2">
                                    Timothy Shi (D)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent3" checked={checks[2]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent3">
                                    Gary Jiang (R)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent4" checked={checks[3]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent4">
                                    Jason Chen (D)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent5" checked={checks[4]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent5">
                                    Limmy Jin (R)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent6" checked={checks[5]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent6">
                                    Simothy Thi (D)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent7" checked={checks[6]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent7">
                                    Jary Giang (R)
                                    </label>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="incumbent8" checked={checks[7]} onChange={userChecked} />
                                <label class="form-check-label" htmlFor="incumbent8">
                                    Cason Jhen (D)
                                    </label>
                            </div>

                            <div className="d-flex flex-row justify-content-around">
                                <button className="btn btn-success" onClick={resetChecks}>Reset</button>
                                <button className="btn btn-danger" onClick={() => setShowPopup(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : ""}
            <p style={{ position: 'absolute', top: '95%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1' }}><strong><em>Figure shows the most recent district boundaries</em></strong></p>

        </div>
    )
}

export default FirstFilter;