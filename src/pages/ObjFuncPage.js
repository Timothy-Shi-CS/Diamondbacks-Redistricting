import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const ObjFuncPage = () => {
    const { state, page, districts, objective } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [objValueParams, setObjValueParams] = objective;
    const [distColors, setDistColors] = useState(null);

    const [selectedDist, setSelectedDist] = useState(null);
    const [distNums, setDistNums] = useState(null);

    const [popUpText, setPopUpText] = useState("");
    const [popUpCoords, setPopUpCoords] = useState(null);

    const [popEqRangeVal, setPopEqRangeVal] = useState(objValueParams.populationEquality);
    const [splitCountyRangeVal, setSplitCountyRangeVal] = useState(objValueParams.splitCounties);
    const [devAvgDistRangeVal, setDevAvgDistRangeVal] = useState(objValueParams.devAvgDist);
    const [devAvgEnDistGeoRangeVal, setDevAvgEnDistGeoRangeVal] = useState(objValueParams.devAvgEnDistGeo);
    const [devAvgEnDistPopRangeVal, setDevAvgEnDistPopRangeVal] = useState(objValueParams.devAvgEnDistPop);
    const [geoCompactRangeVal, setGeoCompactRangeVal] = useState(objValueParams.geographicCompact);
    const [graphCompactRangeVal, setGraphCompactRangeVal] = useState(objValueParams.graphCompact);
    const [popFatRangeVal, setPopFatRangeVal] = useState(objValueParams.populationFatness);
    const [checks, setChecks] = useState([false, false, false]);
    const [sliderVal, setSliderVal] = useState('0.5')
    const [chosenCompact, setChosenCompact] = useState('');

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const backToFirstFilter = (e) => {
        //setStateDistricts(null);
        let paramValues = {
            populationEquality: '0.62',
            splitCounties: '0.21',
            devAvgDist: '0.79',
            devAvgEnDistGeo: '0.44',
            devAvgEnDistPop: '0.97',
            geographicCompact: '0.10',
            graphCompact: '0.50',
            populationFatness: '0.83',
            chosenCompactness: '',
            compactnessVal: '0.5'
        }
        setObjValueParams(paramValues);
        setPageName('first-filter')
    }
    const backToStateSelection = (e) => {
        let paramValues = {
            populationEquality: '0.62',
            splitCounties: '0.21',
            devAvgDist: '0.79',
            devAvgEnDistGeo: '0.44',
            devAvgEnDistPop: '0.97',
            geographicCompact: '0.10',
            graphCompact: '0.50',
            populationFatness: '0.83',
            chosenCompactness: '',
            compactnessVal: '0.5'
        }
        setObjValueParams(paramValues);
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

        if (objValueParams.chosenCompactness !== '') {
            let index;
            if (objValueParams.chosenCompactness === 'geo-compact') {
                index = 0;
            }
            else if (objValueParams.chosenCompactness === 'graph-compact') {
                index = 1;
            } else {
                index = 2;
            }

            let tempChecks = [false, false, false]
            for (let i = 0; i < checks.length; i++) {
                if (i === index) {
                    tempChecks[i] = true;
                }
                else {
                    tempChecks[i] = false;
                }
            }
            setChecks([...tempChecks])
            //document.getElementById('slider_range').disabled = false
        }
        setChosenCompact(objValueParams.chosenCompactness)
        setSliderVal(objValueParams.compactnessVal);
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
        let allFalse = true
        for (let i = 0; i < checks.length; i++) {
            if (checks[i] === true) {
                allFalse = false;
            }
        }

        if (allFalse) {
            alert('You must choose a compactness measure!')
            return;
        }

        let paramValues = {
            populationEquality: popEqRangeVal,
            splitCounties: splitCountyRangeVal,
            devAvgDist: devAvgDistRangeVal,
            devAvgEnDistGeo: devAvgEnDistGeoRangeVal,
            devAvgEnDistPop: devAvgEnDistPopRangeVal,
            geographicCompact: geoCompactRangeVal,
            graphCompact: graphCompactRangeVal,
            populationFatness: popFatRangeVal,
            chosenCompactness: chosenCompact,
            compactnessVal: sliderVal
        }
        setObjValueParams(paramValues);
        setPageName('final-filters');
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
                    key={index}
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

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const userChecked = (e) => {

        let index;
        if (e.target.id === 'geo-compact') {
            index = 0;
        }
        else if (e.target.id === 'graph-compact') {
            index = 1;
        } else {
            index = 2;
        }

        let tempChecks = [false, false, false]
        for (let i = 0; i < checks.length; i++) {
            if (i === index) {
                if (checks[i] === false) {
                    tempChecks[i] = true;
                }
            }
            else {
                tempChecks[i] = false;
            }
        }


        setChecks([...tempChecks])
        setChosenCompact(e.target.id)
    }

    const setSlider = (e) => {
        e.preventDefault();
        setSliderVal(e.target.value);
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "3" }}>
                    <div className="d-flex flex-row justify-content-between">
                        <p class="h5 d-inline-block back-btn" onClick={backToFirstFilter}>Back</p>
                        <p class="h5 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                    </div>

                    <div align="center" style={{ paddingTop: "1rem" }}>
                        <p class="h3">Objective Function Weights</p>
                        <p class="h6"><em>Job {stateFeature.job + 1}: {numberWithCommas(Math.floor(Math.sqrt(stateFeature.jobs[stateFeature.job])))} redistrictings</em></p>
                        {/* <p class="text-muted"><em>Figure on the right shows the most recent district boundaries</em></p> */}
                        <hr></hr>
                    </div>
                    <div className="d-flex flex-column justify-content-between" style={{ height: "70%", width: "100%" }}>
                        <div>

                            <p class="h4">General:</p>
                            <div class="px-3">
                                <div >
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Population equality:</p>
                                        <input type="number" value={popEqRangeVal} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{popEqRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="pop_eq_range" onInput={popEqRange} value={popEqRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Split counties:</p>
                                        <input type="number" value={splitCountyRangeVal} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{splitCountyRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="split_county_range" onInput={splitCountyRange} value={splitCountyRangeVal} />
                                </div>
                            </div>

                        </div>
                        <hr></hr>


                        <div>

                            <p class="h4">Deviation From:</p>
                            <div class="px-3">
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Average districting:</p>
                                        <input type="number" value={devAvgDistRangeVal} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgDistRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_dist_range" onInput={devAvgDistRange} value={devAvgDistRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Enacted districting (geometric):</p>
                                        <input type="number" value={devAvgEnDistGeoRangeVal} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgEnDistGeoRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_en_dist_geo_range" onInput={devAvgEnDistGeoRange} value={devAvgEnDistGeoRangeVal} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Enacted districting (population):</p>
                                        <input type="number" value={devAvgEnDistPopRangeVal} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgEnDistPopRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_en_dist_pop_range" onInput={devAvgEnDistPopRange} value={devAvgEnDistPopRangeVal} />
                                </div>

                            </div>
                        </div>
                        <hr></hr>

                        <div>
                            <p class="h4">Compactness:</p>
                            <div class="px-3">
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label h6" htmlFor="geo-compact">
                                                {/* <p class="h6">Geographic compactness:</p> */}
                                                Geographic compactness
                                            </label>
                                            <input class="form-check-input" type="checkbox" id="geo-compact" checked={checks[0]} onChange={userChecked} />
                                        </div>
                                        {/* <p class="h6">Geographic compactness:</p> */}
                                        {/* <input type="number" value={geoCompactRangeVal} disabled="disabled" style={{ width: '60px' }} /> */}
                                        {/* <p class="h6 px-2 border border-primary">{geoCompactRangeVal}</p> */}
                                    </div>
                                    {/* <input type="range" class="form-range" min="0" max="1" step="0.01" id="geo_compact_range" onInput={geoCompactRange} value={geoCompactRangeVal} /> */}
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label" htmlFor="graph-compact">
                                                <p class="h6">Graph compactness</p>
                                            </label>
                                            <input class="form-check-input" type="checkbox" id="graph-compact" checked={checks[1]} onChange={userChecked} />
                                        </div>
                                        {/* <p class="h6">Graph compactness:</p> */}
                                        {/* <input type="number" value={graphCompactRangeVal} disabled="disabled" style={{ width: '60px' }} /> */}
                                        {/* <p class="h6 px-2 border border-primary">{graphCompactRangeVal}</p> */}
                                    </div>
                                    {/* <input type="range" class="form-range" min="0" max="1" step="0.01" id="graph_compact_range" onInput={graphCompactRange} value={graphCompactRangeVal} /> */}
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label" htmlFor="pop-fat">
                                                <p class="h6">Population fatness</p>
                                            </label>
                                            <input class="form-check-input" type="checkbox" id="pop-fat" checked={checks[2]} onChange={userChecked} />
                                        </div>
                                        {/* <p class="h6">Population fatness:</p> */}
                                        <input type="number" value={sliderVal} disabled="disabled" style={{ width: '60px' }} />
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="slider_range" onInput={setSlider} value={sliderVal} />
                                </div>
                            </div>
                        </div>
                        <hr></hr>
                        <div>
                            <div className='d-flex flex-row justify-content-between'>
                                <p class="h5 " >Efficiency Gap:</p>
                                <input type="number" value={0.78} disabled="disabled" style={{ width: '60px', marginRight:'15px'}} />
                            </div>
                            <input type="range" class="form-range" min="0" max="1" step="0.01" id="slider_range" value={0.78} disabled/>

                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <button type="button" className="btn btn-lg col-12 btn-primary" onClick={saveEverything}>Proceed</button>
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