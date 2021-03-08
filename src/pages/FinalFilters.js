import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const FinalFilters = () => {
    const { state, page, districts, objective } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [objValueParams, setObjValueParams] = objective;

    const [showFilters, setShowFilters] = useState(false);

    const [countyLayer, setCountyLayer] = useState("");

    const [showPopup, setShowPopup] = useState(false);
    const [popUpText, setPopUpText] = useState(null);
    const [popUpCoords, setPopUpCoords] = useState(null);

    const [view, setView] = useState('');

    let [checks, setChecks] = useState([false, false, false, false, false, false, false, false]);

    const [curDistricting, setCurDistricting] = useState('');
    const [curDistrictingNum, setCurDistrictingNum] = useState(null);

    const [districtNumbers, setDistrictNumbers] = useState(null);

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const [viewportEnacted, setViewportEnacted] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const [viewportDB, setViewportDB] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const [showComparisonPopup, setShowComparisonPopup] = useState(false);

    const OVERLAY_STYLES = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 1000
    }

    const MODAL_STYLES = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        // backgroundColor: "rgba(255,255,255,1.0)",
        height: "100%",
        width: '100%',
        zIndex: 1000
    }
    let districtData = new Array(3);
    let counties;
    if (stateFeature.feature.properties.name === 'Virginia') {
        districtData[0] = require('../data/virginiaDistrict1.json');
        districtData[1] = require('../data/virginiaDistrict2.json');
        districtData[2] = require('../data/virginiaDistrict3.json');
        counties = require('../data/virginiaCounties.json');
    } else if (stateFeature.feature.properties.name === 'Utah') {
        districtData[0] = require('../data/utahDistrict1.json');
        districtData[1] = require('../data/utahDistrict2.json');
        districtData[2] = require('../data/utahDistrict3.json');
        counties = require('../data/utahCounties.json');
    } else if (stateFeature.feature.properties.name === 'Nevada') {
        districtData[0] = require('../data/nevadaDistrict1.json');
        districtData[1] = require('../data/nevadaDistrict2.json');
        districtData[2] = require('../data/nevadaDistrict3.json');
        counties = require('../data/nevadaCounties.json');
    }

    //let virginiaDistricts = new Array(3);

    const stateCoords = require('../data/stateCoords.json');
    //const enactedDistricts = require('../data/districts114.json');
    // virginiaDistricts[2] = require('../data/virginiaDistrict3.json')
    // virginiaDistricts[1] = require('../data/virginiaDistrict2.json');
    // virginiaDistricts[0] = require('../data/virginiaDistrict1.json');

    //const counties = require('../data/virginiaCounties.json');

    useEffect(() => {

        console.log(districtData)
        const stateLayer = {
            'id': 'state-layer',
            'type': 'fill',
            'source': 'state',
            'layout': {},
            'paint': {
                'fill-color': 'rgba(98, 201, 42, 0.15)',
                'fill-outline-color': 'rgba(113, 191, 114, 0.3)'
            }
        }
        //for (let i = 0; i < stateCoords.features.length; i++) {
        //if (stateCoords.features[i].properties.name === stateFeature.feature.properties.name) {
        //console.log(stateCoords.features[i]);
        setCurDistricting(
            <Source
                id="state"
                type="geojson"
                data={stateFeature.feature}
            >
                <Layer {...stateLayer} />
            </Source>
        )
        //break;
        //}
        //}
    }, [])

    const backToObjFunc = (e) => {
        e.preventDefault();
        setPageName('obj-func-page');
    }

    const backToStateSelection = (e) => {
        e.preventDefault();
        setStateDistricts(null);
        setPageName('state-selection')
    }

    const userChoseDistricting = (e) => {
        e.preventDefault()
        let tempChecks = [false, false, false, false, false];

        setShowPopup(false);
        setChecks([...tempChecks]);
        setView('');
        setCountyLayer("");

        setShowFilters(true);
        const name = e.target.options[e.target.selectedIndex].text;
        setCurDistrictingNum(name.split(' ')[1]);
        setDistrictMap(name)
        console.log(name);
    }

    const getMaxKey = (arr) => {
        let max = 0;
        for (let i = 0; i < arr.length; i++) {
            if (parseInt(arr[i]) > max) {
                max = arr[i];
            }
        }
        return max;
    }

    const setDistrictMap = (districtName) => {
        let data;
        let distNums = [];
        let distColor = [];
        data = districtData[parseInt(districtName.split(' ')[1]) - 1];
        // if (districtName === 'Districting 1') {
        //     data = districtData[0]
        // } else if (districtName === 'Districting 2') {
        //     data = districtData[1]
        // } else if (districtName === 'Districting 3') {
        //     data = districtData[2]
        // }
        console.log(data)
        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members)

            if (data.features[i].properties.member[maxMember][Object.keys(data.features[i].properties.member[maxMember])[0]].party === 'Republican') {
                distColor.push('rgba(235, 64, 52,0.4)')
            } else {
                distColor.push('rgba(52, 122, 235,0.4)')
            }
            console.log(members);
            console.log(maxMember)
        }
        console.log(data);
        console.log(distNums)
        setDistrictNumbers([...distNums]);
        setCurDistricting(
            data.features.map((f, index) => {
                const f_data = {
                    type: f.type,
                    geometry: {
                        type: f.geometry.type,
                        coordinates: f.geometry.coordinates
                    }
                };

                const f_layer = {
                    'id': `district_${index}_layer`,
                    'type': 'fill',
                    'source': `district_${index}`,
                    'layout': {},
                    'paint': {
                        'fill-color': `${distColor[index]}`,
                        'fill-outline-color': 'rgba(255,255,255,1.0)'
                    }
                };

                return (
                    <Source
                        id={`district_${index}`}
                        type='geojson'
                        data={f_data}
                    >
                        <Layer {...f_layer} />
                    </Source>
                )
            })
        )
    }

    const removeOtherFilterLayers = () => {
        let data = districtData[parseInt(curDistrictingNum) - 1];
        let distNums = [];
        let distColor = [];
        // if (curDistrictingNum === '1') {
        //     data = districtData[0]
        // } else if (curDistrictingNum === '2') {
        //     data = districtData[1]
        // } else if (curDistrictingNum === '3') {
        //     data = districtData[2]
        // }

        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members)

            if (data.features[i].properties.member[maxMember][Object.keys(data.features[i].properties.member[maxMember])[0]].party === 'Republican') {
                distColor.push(`rgba(235, 64, 52,0.4)`)
            } else {
                distColor.push(`rgba(52, 122, 235,0.4)`)
            }
            console.log(members);
            console.log(maxMember)
        }
        console.log(data);
        console.log(distNums)
        setDistrictNumbers([...distNums]);
        setCurDistricting(
            data.features.map((f, index) => {
                const f_data = {
                    type: f.type,
                    geometry: {
                        type: f.geometry.type,
                        coordinates: f.geometry.coordinates
                    }
                };

                const f_layer = {
                    'id': `district_${index}_layer`,
                    'type': 'fill',
                    'source': `district_${index}`,
                    'layout': {},
                    'paint': {
                        'fill-color': `${distColor[index]}`,
                        'fill-outline-color': 'rgba(255,255,255,1.0)'
                    }
                };

                return (
                    <Source
                        id={`district_${index}`}
                        type='geojson'
                        data={f_data}
                    >
                        <Layer {...f_layer} />
                    </Source>
                )
            })
        )
    }

    const userChecked = (e) => {
        let tempChecks = [false, false, false, false, false];
        const index = parseInt(e.target.id.split('-')[2]);
        setShowPopup(false);
        if (checks[index - 1] === true) {
            tempChecks[index - 1] = false;
            removeOtherFilterLayers();
            setView('');
            setCountyLayer('')
        } else {
            tempChecks[index - 1] = true;
            setView(e.target.id);
            if (index === 1) {
                removeOtherFilterLayers();
                showCounties();


            } else if (index === 2) {
                showDevAvg();
                setCountyLayer('')
            } else {
                removeOtherFilterLayers();
                setCountyLayer('')
            }
        }
        setChecks([...tempChecks]);
        console.log(index);
    }

    const showCounties = () => {
        console.log(counties);
        const countyLayerStyle = {
            'id': 'counties-layer',
            'type': 'fill',
            'source': 'counties',
            'layout': {},
            'paint': {
                'fill-color': 'rgba(229, 145, 255, 0.025)',
                'fill-outline-color': 'rgba(0,0,0,0.3)'
            }
        };

        setCountyLayer(
            <Source
                id="counties"
                type="geojson"
                data={counties}
            >
                <Layer {...countyLayerStyle} />
            </Source>
        );
    }

    const showDevAvg = () => {
        let random = Math.random() * (1.0 - 0.1) + 0.1;
        console.log(random);
        console.log(curDistrictingNum);

        let data = districtData[parseInt(curDistrictingNum) - 1];
        let distNums = [];
        let distColor = [];


        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members)

            if (data.features[i].properties.member[maxMember][Object.keys(data.features[i].properties.member[maxMember])[0]].party === 'Republican') {
                distColor.push(`rgba(235, 64, 52,${Math.random() * (1.0 - 0.1) + 0.1})`)
            } else {
                distColor.push(`rgba(52, 122, 235,${Math.random() * (1.0 - 0.1) + 0.1})`)
            }
            console.log(members);
            console.log(maxMember)
        }
        console.log(data);
        console.log(distNums)
        setDistrictNumbers([...distNums]);
        setCurDistricting(
            data.features.map((f, index) => {
                const f_data = {
                    type: f.type,
                    geometry: {
                        type: f.geometry.type,
                        coordinates: f.geometry.coordinates
                    }
                };

                const f_layer = {
                    'id': `district_${index}_layer`,
                    'type': 'fill',
                    'source': `district_${index}`,
                    'layout': {},
                    'paint': {
                        'fill-color': `${distColor[index]}`,
                        'fill-outline-color': 'rgba(255,255,255,1.0)'
                    }
                };

                return (
                    <Source
                        id={`district_${index}`}
                        type='geojson'
                        data={f_data}
                    >
                        <Layer {...f_layer} />
                    </Source>
                )
            })
        )
    }

    const resetCurDistricting = () => {
        const stateLayer = {
            'id': 'state-layer',
            'type': 'fill',
            'source': 'state',
            'layout': {},
            'paint': {
                'fill-color': 'rgba(98, 201, 42, 0.15)',
                'fill-outline-color': 'rgba(113, 191, 114, 0.3)'
            }
        }
        for (let i = 0; i < stateCoords.features.length; i++) {
            if (stateCoords.features[i].properties.name === stateFeature.feature.properties.name) {
                console.log(stateCoords.features[i]);
                setCurDistricting(
                    <Source
                        id="state"
                        type="geojson"
                        data={stateCoords.features[i]}
                    >
                        <Layer {...stateLayer} />
                    </Source>
                )
                break;
            }
        }
    }

    const resetChecks = (e) => {
        e.preventDefault();
        setShowFilters(false);
        setShowPopup(false);
        document.getElementById("districting-selection").value = "";
        let tempChecks = [false, false, false, false, false];
        setChecks([...tempChecks]);
        setView('');
        setCountyLayer("");
        resetCurDistricting();
        setCurDistrictingNum(null);
    }

    const userClicked = (e) => {
        e.preventDefault();
        console.log(e);
        let coords = [e.lngLat[0], e.lngLat[1]];
        if (e.features[0].source.includes('district')) {
            const index = parseInt(e.features[0].source.split('_')[1]);

            setShowPopup(true);
            setPopUpText(`District ${districtNumbers[index]}`);
            setPopUpCoords([...coords]);
        } else if (e.features[0].source === 'counties') {
            setShowPopup(true);
            e.features[0].properties.name ? setPopUpText(`${e.features[0].properties.name}`) : setPopUpText(`${e.features[0].properties.NAME}`);
            //setPopUpText(`${e.features[0].properties.NAME}`);
            setPopUpCoords([...coords]);
        }
        else {
            setShowPopup(false);
        }

    }

    const showComparison = (e) => {
        e.preventDefault();
        setShowComparisonPopup(true);
        console.log('show comparison');
    }

    const getUnstyledCurDistricting = () => {
        let data = districtData[parseInt(curDistrictingNum) - 1];
        let distNums = [];
        let distColor = [];
        // if (curDistrictingNum === '1') {
        //     data = districtData[0]
        // } else if (curDistrictingNum === '2') {
        //     data = districtData[1]
        // } else if (curDistrictingNum === '3') {
        //     data = districtData[2]
        // }

        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members)

            if (data.features[i].properties.member[maxMember][Object.keys(data.features[i].properties.member[maxMember])[0]].party === 'Republican') {
                distColor.push(`rgba(235, 64, 52,0.4)`)
            } else {
                distColor.push(`rgba(52, 122, 235,0.4)`)
            }
            console.log(members);
            console.log(maxMember)
        }
        console.log(data);
        console.log(distNums)
        //setDistrictNumbers([...distNums]);
        return (
            data.features.map((f, index) => {
                const f_data = {
                    type: f.type,
                    geometry: {
                        type: f.geometry.type,
                        coordinates: f.geometry.coordinates
                    }
                };

                const f_layer = {
                    'id': `district_${index}_layer`,
                    'type': 'fill',
                    'source': `district_${index}`,
                    'layout': {},
                    'paint': {
                        'fill-color': `${distColor[index]}`,
                        'fill-outline-color': 'rgba(255,255,255,1.0)'
                    }
                };

                return (
                    <Source
                        id={`district_${index}`}
                        type='geojson'
                        data={f_data}
                    >
                        <Layer {...f_layer} />
                    </Source>
                )
            })
        )
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
                <div id="left-bar" className="col-2 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    <div className="d-flex flex-row justify-content-between">
                        <p class="h6 d-inline-block back-btn" onClick={backToObjFunc}>Back</p>
                        <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                    </div>
                    <div align="center" style={{ paddingTop: "3rem" }}>
                        <p class="h3">View Results</p>
                        <hr></hr>
                    </div>
                    <div className="d-flex flex-column justify-content-between py-4" style={{ height: "77%", width: "100%" }}>
                        <select id="districting-selection" class="form-select" onChange={userChoseDistricting}>
                            <option value="" defaultValue hidden>Select a districting</option>
                            <option value="1">Districting 1</option>
                            <option value="2">Districting 2</option>
                            <option value="3">Districting 3</option>
                        </select>

                        {showFilters ? (
                            <>
                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="split-counties-1">
                                        Show counties
                            </label>
                                    <input class="form-check-input" type="checkbox" value="" id="split-counties-1" checked={checks[0]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="dev-avg-2">
                                        Show deviation from average districting
                            </label>
                                    <input class="form-check-input" type="checkbox" value="" id="dev-avg-2" checked={checks[1]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="geo-compact-3">
                                        Show geometric compactness
                            </label>
                                    <input class="form-check-input" type="checkbox" value="" id="geo-compact-3" checked={checks[2]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="graph-compact-4">
                                        Show graph compactness
                            </label>
                                    <input class="form-check-input" type="checkbox" value="" id="graph-compact-4" checked={checks[3]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="pop-fat-5">
                                        Show population fatness
                            </label>
                                    <input class="form-check-input" type="checkbox" value="" id="pop-fat-5" checked={checks[4]} onChange={userChecked} />
                                </div>

                                <div>
                                    <p class="h6 compareBtn d-inline-block" onClick={showComparison}>Click to show enacted and selected </p>
                                </div>

                                <div>
                                    <button type="button" className="btn btn-lg col-12 btn-primary" onClick={resetChecks}>Reset</button>
                                </div>
                            </>
                        ) : ""}

                    </div>
                </div>
                <div id="right-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2", height: "100%" }}>
                        <div align="center" style={{ paddingTop: "5rem" }}>
                            <p class="h4 d-inline-block" >Objective Value Details</p>
                        </div>
                        
                        <hr></hr>
                        <div className="d-flex flex-column justify-content-between" style={{ height: "70%"}}>
                            <div>

                                <p class="h4">General</p>
                                <div class="px-3">
                                    <div >
                                        <div class="d-flex flex-row justify-content-between">
                                            <p class="h6">Population equality:</p>
                                            <p class="h6 px-2 border border-primary">{objValueParams.populationEquality}</p>
                                            
                                        </div>
                                        
                                    </div>

                                    <div>
                                        <div class="d-flex flex-row justify-content-between">
                                            <p class="h6">Split counties:</p>
                                            <p class="h6 px-2 border border-primary">{objValueParams.splitCounties}</p>
                                        </div>
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
                                            <p class="h6 px-2 border border-primary">{objValueParams.devAvgDist}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="d-flex flex-row justify-content-between">
                                            <p class="h6">Deviation from enacted districting (geometric):</p>
                                            <p class="h6 px-2 border border-primary">{objValueParams.devAvgEnDistGeo}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="d-flex flex-row justify-content-between">
                                            <p class="h6">Deviation from enacted districting (population):</p>
                                            <p class="h6 px-2 border border-primary">{objValueParams.devAvgEnDistPop}</p>
                                        </div>
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
                                            <p class="h6 px-2 border border-primary">{objValueParams.geographicCompact}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="d-flex flex-row justify-content-between">
                                            <p class="h6">Graph compactness:</p>
                                            <p class="h6 px-2 border border-primary">{objValueParams.graphCompact}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="d-flex flex-row justify-content-between">
                                            <p class="h6">Population fatness:</p>
                                            <p class="h6 px-2 border border-primary">{objValueParams.populationFatness}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                    {/* <div>
                        {curDistrictingNum === null ? '' : (`Districting ${curDistrictingNum}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mattis tortor libero, sit amet pellentesque est tincidunt sit amet. Suspendisse vel laoreet diam. Fusce id fermentum arcu. Praesent semper sem neque, ac interdum purus venenatis ac. Fusce nec dolor sed risus tristique condimentum eget sit amet risus. Morbi eget sapien et mi pharetra venenatis eget quis est. Morbi egestas dolor arcu, convallis maximus felis placerat vitae. Donec ac placerat purus. Nulla porttitor eros ut est hendrerit, ac commodo eros rutrum. Sed eget ante vel tellus ultrices ornare. Etiam vulputate accumsan tortor vel dictum. Maecenas et porttitor ligula.
                        `)}
                    </div> */}

                </div>

            </div>
            <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={setViewport}
                mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
                onClick={userClicked}
            >
                {countyLayer}
                {curDistricting}
                {showPopup && popUpText && popUpCoords ? (
                    <Popup
                        latitude={popUpCoords[1]}
                        longitude={popUpCoords[0]}
                        onClose={() => { setShowPopup(false) }}
                    >
                        <div class="px-2">
                            <h5>{popUpText}</h5>
                        </div>
                    </Popup>
                ) : ''}
            </ReactMapGL>

            {showComparisonPopup ? (
                <div className="comparisonPopup">
                    <div style={OVERLAY_STYLES} />
                    <div className="container-fluid" align='center' style={MODAL_STYLES}>
                        {/* {children} */}
                        <div class="row d-flex flex-row justify-content-around align-items-center" style={{ height: "90%", width: "100%" }}>
                            <div class="col-5" style={{ backgroundColor: "rgba(255,255,255,1.0)", height: "65%" }} >
                                <ReactMapGL
                                    {...viewportEnacted}
                                    width="100%"
                                    height="100%"
                                    onViewportChange={setViewportEnacted}
                                    mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
                                >
                                    {render}
                                </ReactMapGL>
                                <h3 className="my-3" style={{ color: 'rgba(255,255,255,1.0)' }}><em>Enacted</em></h3>
                            </div>
                            <div class="col-5" style={{ backgroundColor: "rgba(255,255,255,1.0)", height: "65%" }}>
                                <ReactMapGL
                                    {...viewportDB}
                                    width="100%"
                                    height="100%"
                                    onViewportChange={setViewportDB}
                                    mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
                                >
                                    {getUnstyledCurDistricting()}
                                </ReactMapGL>
                                <h3 className="my-3 " style={{ color: 'rgba(255,255,255,1.0)' }}> <em>Districting {curDistrictingNum}</em></h3>
                            </div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setShowComparisonPopup(false)}>Close</button>
                    </div>
                </div>
            ) : ''}

        </div >
    )
}

export default FinalFilters;