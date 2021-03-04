import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const FinalFilters = () => {
    const { state, page, districts } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;

    const [view, setView] = useState('');

    let [checks, setChecks] = useState([false, false, false, false, false, false, false, false]);


    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const backToObjFunc = (e) => {
        e.preventDefault();
        setPageName('obj-func-page');
    }

    const backToStateSelection = (e) => {
        e.preventDefault();
        setPageName('state-selection')
    }

    const userChoseDistricting = (e) => {
        console.log(e.target.options[e.target.selectedIndex].text);
    }

    const userChecked = (e) => {
        let tempChecks = [false, false, false, false, false];
        const index = parseInt(e.target.id.split('-')[2]);
        if (checks[index - 1] === true) {
            tempChecks[index - 1] = false;
            setView('');
        } else {
            tempChecks[index - 1] = true;
            setView(e.target.id);
        }
        setChecks([...tempChecks]);
        console.log(index);
    }

    const resetChecks = (e) => {
        e.preventDefault();
        let tempChecks = [false, false, false, false, false];
        setChecks([...tempChecks]);
        setView('');
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

                        <div class="form-check">
                            <label class="form-check-label" htmlFor="split-counties-1">
                                Show split counties
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
            >
            </ReactMapGL>

            {console.log(view)}
        </div>
    )
}

export default FinalFilters;