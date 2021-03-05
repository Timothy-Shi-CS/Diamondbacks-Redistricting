import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const FinalFilters = () => {
    const { state, page, districts } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;

    const [showFilters, setShowFilters] = useState(false);

    const [countyLayer, setCountyLayer] = useState("");

    const [showPopup, setShowPopup] = useState(false);
    const [popUpText, setPopUpText] = useState(null);
    const [popUpCoords, setPopUpCoords] = useState(null);

    const [view, setView] = useState('');

    let [checks, setChecks] = useState([false, false, false, false, false, false, false, false]);

    const [curDistricting, setCurDistricting] = useState('');

    const [districtNumbers, setDistrictNumbers] = useState(null);

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const stateCoords = require('../data/stateCoords.json');
    //const enactedDistricts = require('../data/districts114.json');
    const virginiaDistrict3 = require('../data/virginiaDistrict3.json')
    const virginiaDistrict2 = require('../data/virginiaDistrict2.json');
    const virginiaDistrict1 = require('../data/virginiaDistrict1.json');
    const virginiaCounties = require('../data/virginiaCounties.json');

    useEffect(() => {
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
            if (stateCoords.features[i].properties.name === 'Virginia') {
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
    }, [])

    const backToObjFunc = (e) => {
        e.preventDefault();
        setPageName('obj-func-page');
    }

    const backToStateSelection = (e) => {
        e.preventDefault();
        setPageName('state-selection')
    }

    const userChoseDistricting = (e) => {
        e.preventDefault()
        setShowFilters(true);
        const name = e.target.options[e.target.selectedIndex].text;
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
        if (districtName === 'Districting 1') {
            data = virginiaDistrict1
        } else if (districtName === 'Districting 2') {
            data = virginiaDistrict2
        } else if (districtName === 'Districting 3') {
            data = virginiaDistrict3
        }

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

    const userChecked = (e) => {
        let tempChecks = [false, false, false, false, false];
        const index = parseInt(e.target.id.split('-')[2]);
        if (checks[index - 1] === true) {
            tempChecks[index - 1] = false;
            setView('');
            if (index === 1) {
                setCountyLayer('')
            }
        } else {
            tempChecks[index - 1] = true;
            setView(e.target.id);
            if (index === 1) {
                showCounties();
            }
        }
        setChecks([...tempChecks]);
        console.log(index);
    }

    const showCounties = () => {
        console.log(virginiaCounties);
        const countyLayerStyle = {
            'id': 'counties-layer',
            'type': 'fill',
            'source': 'counties',
            'layout': {},
            'paint': {
                'fill-color': 'rgba(229, 145, 255, 0.05)',
                'fill-outline-color': 'rgba(255,255,255,1.0)'
            }
        };

        setCountyLayer(
            <Source
                id="counties"
                type="geojson"
                data={virginiaCounties}
            >
                <Layer {...countyLayerStyle} />
            </Source>
        );
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
            if (stateCoords.features[i].properties.name === 'Virginia') {
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
        document.getElementById("districting-selection").value = "";
        let tempChecks = [false, false, false, false, false];
        setChecks([...tempChecks]);
        setView('');
        setCountyLayer("");
        resetCurDistricting();
    }

    const userClickedDistrict = (e) => {
        e.preventDefault();
        if (e.features[0].source !== 'composite' && e.features[0].source !== 'state') {
            const index = parseInt(e.features[0].source.split('_')[1]);
            let coords = [e.lngLat[0], e.lngLat[1]];
            setShowPopup(true);
            setPopUpText(`District ${districtNumbers[index]}`);
            setPopUpCoords([...coords]);
        } else {
            setShowPopup(false);
        }

    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-2" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    <div className="d-flex flex-row justify-content-between">
                        <p class="h6 d-inline-block back-btn" onClick={backToObjFunc}>Back</p>
                        <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                    </div>
                    <div align="center" style={{ paddingTop: "3rem" }}>
                        <p class="h3">Filters</p>
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
                                    <p class="h6">Click to show enacted and selected </p>
                                </div>

                                <div>
                                    <button type="button" className="btn btn-lg col-12 btn-primary" onClick={resetChecks}>Reset</button>
                                </div>
                            </>
                        ) : ""}

                    </div>
                </div>
                <div id="right-bar" className="col-2" align="center" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    <p class="h6 d-inline-block">Objective Value Details</p>
                    <hr></hr>
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
        </div>
    )
}

export default FinalFilters;