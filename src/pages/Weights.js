import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"
import RingLoader from "react-spinners/RingLoader";

import { StateContext } from '../contexts/StateContext'

const Weights = () => {
    const { state, page, districts, objective, districtings } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [objValueParams, setObjValueParams] = objective;
    const [districtingsData, setDistrictingsData] = districtings
    const [loading, setLoading] = useState(false);

    const [popUpText, setPopUpText] = useState("");
    const [popUpCoords, setPopUpCoords] = useState(null);
    const [checks, setChecks] = useState([false, false, false]);

    const [countyLayer, setCountyLayer] = useState("");
    const [precinctLayer, setPrecinctLayer] = useState("");
    const [filterChecks, setFilterChecks] = useState([false, false]);

    const [counties, setCounties] = useState(null)
    const [precincts, setPrecincts] = useState(null)

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
        setPageName('state-selection') //go back to state selection
    }

    const enactedDistricts = require('../data/districts114.json'); //load in the enacted districtings of each state

    useEffect(() => {
        let statename = stateFeature.feature.properties.name.toLowerCase();
        console.log(statename);

        let requestObj2 = new XMLHttpRequest();
        requestObj2.onreadystatechange = (res) => {
            let response = res.target;
            if (response.readyState == 4 && response.status == 200) {

                setCounties(JSON.parse(response.responseText));
                console.log(counties)
            }
        };
        requestObj2.open(
            "GET",
            `http://127.0.0.1:5000/${statename}_counties`,
            true
        );
        requestObj2.send();

        let requestObj3 = new XMLHttpRequest();
        requestObj3.onreadystatechange = (res) => {
            let response = res.target;
            if (response.readyState == 4 && response.status == 200) {

                setPrecincts(JSON.parse(response.responseText));
            }
        };
        requestObj3.open(
            "GET",
            `http://127.0.0.1:5000/${statename}_precincts`,
            true
        );
        requestObj3.send();
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

    const userCheckedFilters = (e) => {
        let tempChecks = [...filterChecks];
        const index = parseInt(e.target.id.split("-")[2]); //get the index of the selected filter

        if (filterChecks[index - 1] === true) {
            //if the filter was originally selected, turn it off
            tempChecks[index - 1] = false;
            // removeOtherFilterLayers(); //get back the origin colors of each district
            // setView(""); //
            // setCountyLayer(""); //clear county layer
            if (index === 1) {
                setCountyLayer("")
            } else if (index === 2) {
                setPrecinctLayer("")
            }
        } else {
            //if the filter was originally deselected, turn it on
            tempChecks[index - 1] = true;
            // setView(e.target.id);
            if (index === 1) {
                // removeOtherFilterLayers();
                showCounties(); //show counties
                // setPrecinctLayer("");
            } else if (index === 2) {
                // showDevAvg(); //show deviation from average
                // setCountyLayer(""); //remove the counties
                showPrecincts();
            }
            // } else {
            //     removeOtherFilterLayers();
            //     setCountyLayer(""); //remove the counties
            // }
        }
        setFilterChecks([...tempChecks]);
        console.log(index);
    }

    const showCounties = () => {
        // console.log(counties);
        const countyLayer = {
            //styling for layer that shows counties
            id: "counties-layer",
            type: "fill",
            source: "counties",
            layout: {},
            paint: {
                "fill-color": "rgba(247, 138, 222, 0.33)",
                "fill-outline-color": "rgba(255, 0, 0, 0.46)",
            },
        };

        setCountyLayer(
            <Source
                id="counties"
                type="geojson"
                data={counties}
            >
                <Layer {...countyLayer} />
            </Source>
        );
    };

    const showPrecincts = () => {
        const precinctLayer = {
            id: "precincts-layer",
            type: "fill",
            source: "precincts",
            layout: {},
            paint: {
                "fill-color": "rgba(229, 145, 255, 0.025)",
                "fill-outline-color": "rgba(0,0,0,0.3)",
            }
        }

        setPrecinctLayer(
            <Source
                id="precincts"
                type="geojson"
                data={precincts}
            >
                <Layer {...precinctLayer} />
            </Source>
        );
    }

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
        setLoading(true)
        const popFat = objValueParams.compactness.type === 2 ? objValueParams.compactness.value : -1
        const graph = objValueParams.compactness.type === 1 ? objValueParams.compactness.value : -1
        const geo = objValueParams.compactness.type === 0 ? objValueParams.compactness.value : -1
        e.preventDefault();
        let requestObj = new XMLHttpRequest();
        requestObj.onreadystatechange = (res) => {
            let response = res.target;
            console.log(`http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/setWeights/popEquality=${objValueParams.populationEquality}&devAvgGeo=${objValueParams.devAvgDistGeo}&devAvgPop=${objValueParams.devAvgDistPop}&devEnactedGeo=${objValueParams.devEnDistGeo}&devEnactedPop=${objValueParams.devEnDistPop}&geoCompact=${geo}&graphCompact=${graph}&popFat=${popFat}`)
            if (response.readyState == 4 && response.status == 200) {
                let districtingsMap = []
                let districtingsResp = JSON.parse(response.responseText)
                const keys = Object.keys(districtingsResp);
                for (let i = 0; i < districtingsResp.length; i++) {
                    districtingsMap.push({
                        id: districtingsResp[i].fileName.substring(1, districtingsResp[i].fileName.length - 1),
                        ...districtingsResp[i]
                    })
                }
                console.log(districtingsMap)
                setDistrictingsData(districtingsMap)
                setLoading(false);
                setPageName('analysis'); //move on to the final page
            }

        };
        requestObj.open(
            "GET",
            `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/setWeights/popEquality=${objValueParams.populationEquality}&devAvgGeo=${objValueParams.devAvgDistGeo}&devAvgPop=${objValueParams.devAvgDistPop}&devEnactedGeo=${objValueParams.devEnDistGeo}&devEnactedPop=${objValueParams.devEnDistPop}&geoCompact=${geo}&graphCompact=${graph}&popFat=${popFat}`,
            true
        );
        requestObj.send();

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

    const devAvgDistGeoRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                devAvgDistGeo: e.target.value
            }
        })
    }

    const devAvgDistPopRange = (e) => {
        e.preventDefault();
        setObjValueParams(prevParams => {
            return {
                ...prevParams,
                devAvgDistPop: e.target.value
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
        // if(x>=2000){
        //     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"+";
        // }
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

                    <div className="text-white" align="center" style={{ paddingTop: "2rem", zIndex: "4", position: "relative", marginBottom: "30px" }}>
                        <p class="h3">Objective Function Weights</p>
                        <p class="h6"><em>Job {stateFeature.job + 1}: {numberWithCommas(stateFeature.remainingJobs)} redistrictings</em></p>
                        {/* <p class="text-muted"><em>Figure on the right shows the most recent district boundaries</em></p> */}
                    </div>
                    <div className="bg-primary weights_banner">
                        <div className="progress" style={{ height: "11px", zIndex: "10", position: "relative", marginTop: "30px", width: "94%", marginLeft: "auto", marginRight: "auto" }}>
                            <div className="progress-bar progress-bar-striped bg-success progress-bar-animated shadow" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style={{ width: "75%" }}>
                                75%
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-column justify-content-between" style={{ height: "70%", width: "100%" }}>
                        <div className="row d-flex justify-content-around" style={{ width: "100%" }}>
                            <div class="col form-check" style={{ marginLeft: "70px" }}>
                                <label class="form-check-label" htmlFor="split-counties-1">
                                    Show counties
                                    </label>
                                <input class="form-check-input" type="checkbox" value="" id="split-counties-1" checked={filterChecks[0]} onChange={userCheckedFilters} />
                            </div>

                            <div class="col form-check">
                                <label class="form-check-label" htmlFor="dev-avg-2">
                                    Show precincts
                                    </label>
                                <input class="form-check-input" type="checkbox" value="" id="dev-avg-2" checked={filterChecks[1]} onChange={userCheckedFilters} />
                            </div>
                        </div>
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
                                        <input type="number" disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{splitCountyRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="split_county_range" onInput={splitCountyRange} value={objValueParams.splitCounties} disabled />
                                </div>
                            </div>
                            {/* <hr></hr> */}
                        </div>


                        <div>

                            <p class="h4">Deviation From:</p>
                            <div>
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Average districting (geometric):</p>
                                        <input type="number" value={objValueParams.devAvgDistGeo} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgDistRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_dist_geo_range" onInput={devAvgDistGeoRange} value={objValueParams.devAvgDistGeo} />
                                </div>

                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <p class="h6">Average districting (population):</p>
                                        <input type="number" value={objValueParams.devAvgDistPop} disabled="disabled" style={{ width: '60px' }} />
                                        {/* <p class="h6 px-2 border border-primary">{devAvgDistRangeVal}</p> */}
                                    </div>
                                    <input type="range" class="form-range" min="0" max="1" step="0.01" id="dev_avg_dist_pop_range" onInput={devAvgDistPopRange} value={objValueParams.devAvgDistPop} />
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
                            {/* <hr></hr> */}
                        </div>

                        <div>
                            <p class="h4">Compactness:</p>
                            <div>
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label h6" htmlFor="geo-compact_0">
                                                {/* <p class="h6">Geographic compactness:</p> */}
                                                Geometric compactness
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
                            {/* <hr></hr> */}
                        </div>
                        <div>
                            <div className='d-flex flex-row justify-content-between'>
                                <p class="h5 " >Efficiency Gap:</p>
                                <input type="number" disabled style={{ width: '60px' }} />
                            </div>
                            <input type="range" class="form-range" min="0" max="1" step="0.01" id="slider_range" onInput={setEfficiencyGapSlider} value={objValueParams.efficiencyGap} disabled />

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
                {countyLayer}
                {precinctLayer}
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
            {loading ? (
                <div>
                    <div className="loading-screen">
                        <RingLoader
                            size={200}
                            color={'#25C5E2'}
                            loading={loading}
                        // margin={20}
                        />
                    </div>
                </div>
            ) : ""}

            <p style={{ position: 'absolute', top: '95%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1' }}><strong><em>Figure shows the most recent district boundaries</em></strong></p>



        </div>

    )
}

export default Weights;