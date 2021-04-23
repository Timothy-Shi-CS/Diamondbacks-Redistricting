import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const Weights = () => {
    const { state, page, districts, objective } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [objValueParams, setObjValueParams] = objective;

    const [popUpText, setPopUpText] = useState("");
    const [popUpCoords, setPopUpCoords] = useState(null);
    const [checks, setChecks] = useState([false, false, false]);

    const [viewport, setViewport] = useState({ // set the map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const resetWeights = {
        populationEquality: 0.62,
        splitCounties: 0.21,
        devAvgDist: 0.79,
        devEnDistGeo: 0.44,
        devEnDistPop: 0.97,
        compactness: {
            type: 0,
            value: 0.5
        },
        efficiencyGap: 0.75
    }

    const backToConstraints = (e) => {
        setObjValueParams(resetWeights);  //reset the values of the weights of each measure
        setPageName('constraints') //go back to previous page
    }
    const backToStateSelection = (e) => {
        setObjValueParams(resetWeights); //reset the values of the weights of each measure
        setStateDistricts(null); //reset the districts of the enacted districting
        setPageName('state-selection') //go back to state selection
    }

    const enactedDistricts = require('../data/districts114.json'); //load in the enacted districtings of each state

    useEffect(() => {
        if (stateDistricts === null) { //if the districts weren't loaded in before, do so now
            let coordHolder = { //create a map to hold the districts data
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

        let index = objValueParams.compactness.type; //get the type

        let tempChecks = [false, false, false]
        for (let i = 0; i < checks.length; i++) { //set the type to true in the array
            if (i === index) {
                tempChecks[i] = true;
            }
            else {
                tempChecks[i] = false;
            }
        }
        setChecks([...tempChecks]) //set the array in the local state to change the ui
        //document.getElementById('slider_range').disabled = false
    }, []);

    const userClickedDistrict = (e) => {
        e.preventDefault();

        if (e.features[0].source !== 'composite') {
            const dist_num = parseInt(e.features[0].source.split('_')[1]);

            setPopUpCoords([...e.lngLat]);
            setPopUpText(`District ${dist_num}`);
        } else {
            setPopUpCoords(null);
        }

    }

    const saveEverything = (e) => {
        e.preventDefault();
        setPageName('final-filters'); //move on to the final page
    }

    let render = "";

    if (stateDistricts) { //if the state's districts have been loaded in
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
                    key={index}
                >
                    <Layer {...f_layer} />
                </Source>
            )
        })
    }

    const popEqRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                populationEquality: e.target.value
            }
        })
    }

    const splitCountyRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                splitCounties: e.target.value
            }
        })
    }

    const devAvgDistRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                devAvgDist: e.target.value
            }
        })
    }

    const devEnDistGeoRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                devEnDistGeo: e.target.value
            }
        })
    }

    const devEnDistPopRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                devEnDistPop: e.target.value
            }
        })
    }

    const setEfficiencyGapSlider = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                efficiencyGap: e.target.value
            }
        })
    }

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const userChecked = (e) => {

        const parsedIndex = parseInt(e.target.id.split('_')[1])

        let tempChecks = [false, false, false]
        for (let i = 0; i < checks.length; i++) { //toggle on and off
            if (i === parsedIndex) {
                tempChecks[i] = true;
            }
            else {
                tempChecks[i] = false;
            }
        }


        setChecks([...tempChecks]) //set this list to change ui

        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                compactness: {
                    type: parsedIndex,
                    value: objValueParams.compactness.value
                }
            }
        })
    }

    const setCompactnessSlider = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                compactness: {
                    type: objValueParams.compactness.type,
                    value: e.target.value
                }
            }
        })
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "3", position: "relative" }}>
                    <div className="d-flex flex-row justify-content-between">
                        <p class="h6 d-inline-block back-btn text-white" onClick={backToConstraints} style={{ position: 'relative', zIndex: "4" }}>Back</p>
                        <p class="h6 d-inline-block back-btn text-white" onClick={backToStateSelection} style={{ position: 'relative', zIndex: "4" }}>Home</p>
                    </div>

                    <div className="text-white" align="center" style={{ paddingTop: "1rem", zIndex: "4", position: "relative", marginBottom: "30px" }}>
                        <p class="h3">Objective Function Weights</p>
                        <p class="h6"><em>Job {stateFeature.job + 1}: {numberWithCommas(Math.floor(Math.sqrt(stateFeature.jobs[stateFeature.job])))} redistrictings</em></p>
                        {/* <p class="text-muted"><em>Figure on the right shows the most recent district boundaries</em></p> */}
                    </div>
                    <div className="weights_banner" style={{backgroundColor:'#a6283d'}}>

                    </div>
                    <div className="d-flex flex-column justify-content-between" style={{ height: "70%", width: "100%" }}>
                        <div>

                            <p class="h4">General:</p>
                            <div>
                                <div >
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Population equality:</p>
                                        <input type="number" value={objValueParams.populationEquality} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{popEqRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="pop_eq_range" onInput={popEqRange} value={objValueParams.populationEquality} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Split counties:</p>
                                        <input type="number" value={objValueParams.splitCounties} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{splitCountyRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="split_county_range" onInput={splitCountyRange} value={objValueParams.splitCounties} />
                                </div>
                            </div>
                            <hr></hr>
                        </div>


                        <div>

                            <p class="h4">Deviation From:</p>
                            <div>
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Average districting:</p>
                                        <input type="number" value={objValueParams.devAvgDist} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgDistRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_dist_range" onInput={devAvgDistRange} value={objValueParams.devAvgDist} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Enacted districting (geometric):</p>
                                        <input type="number" value={objValueParams.devEnDistGeo} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgEnDistGeoRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_en_dist_geo_range" onInput={devEnDistGeoRange} value={objValueParams.devEnDistGeo} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Enacted districting (population):</p>
                                        <input type="number" value={objValueParams.devEnDistPop} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgEnDistPopRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_en_dist_pop_range" onInput={devEnDistPopRange} value={objValueParams.devEnDistPop} />
                                </div>

                            </div>
                            <hr></hr>
                        </div>

                        <div>
                            <p class="h4">Compactness:</p>
                            <div>
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label h6" htmlFor="geo-compact_0">
                                                {/* <p class="h6">Geographic compactness:</p> */}
                                                Geographic compactness
                                            </label>
                                            <input class="form-check-input" type="radio" id="geo-compact_0" checked={checks[0]} onChange={userChecked} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label" htmlFor="graph-compact_1">
                                                <p class="h6">Graph compactness</p>
                                            </label>
                                            <input class="form-check-input" type="radio" id="graph-compact_1" checked={checks[1]} onChange={userChecked} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label" htmlFor="pop-fat_2">
                                                <p class="h6">Population fatness</p>
                                            </label>
                                            <input class="form-check-input" type="radio" id="pop-fat_2" checked={checks[2]} onChange={userChecked} />
                                        </div>
                                        {/* <p class="h6">Population fatness:</p> */}
                                        <input type="number" value={objValueParams.compactness.value} disabled="disabled" style={{ width: '60px' }} />
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="slider_range" onInput={setCompactnessSlider} value={objValueParams.compactness.value} />
                                </div>
                            </div>
                            <hr></hr>
                        </div>
                        <div>
                            <div className='d-flex flex-row justify-content-between'>
                                <p class="h5 " >Efficiency Gap:</p>
                                <input type="number" value={objValueParams.efficiencyGap} disabled style={{ width: '60px', marginRight: '15px' }} />
                            </div>
                            <input type="range" class="form-range" min="0" max="1" step="0.01" id="slider_range" onInput={setEfficiencyGapSlider} value={objValueParams.efficiencyGap} />

                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <button type="button" className="btn btn-lg col-12 btn-primary" onClick={saveEverything}>Apply</button>
                        </div>
                    </div>

                </div>
                {/* <div id="right-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    bar 2
                </div> */}
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

                {popUpCoords ? (
                    <Popup
                        latitude={popUpCoords[1]}
                        longitude={popUpCoords[0]}
                        onClose={() => { setPopUpCoords(null) }}
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

export default Weights;