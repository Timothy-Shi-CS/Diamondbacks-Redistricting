import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const StateSelection = () => {
    const { state, page, polygon } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page
    const [pd, setPd] = polygon

    const allStates = require('../data/allState.json');
    const [filteredStates, setFilteredStates] = useState(null);

    let geojson;
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson')
        .then(resp => {
            return resp.json();
        })
        .then(data => {
            geojson = data;
        });

    let stateCapitals;
    fetch('https://gist.githubusercontent.com/jpriebe/d62a45e29f24e843c974/raw/b1d3066d245e742018bce56e41788ac7afa60e29/us_state_capitals.json')
        .then(resp => {
            return resp.json();
        })
        .then(data => {
            stateCapitals = data;
        });

    const [curJob, setCurJob] = useState(null);
    //const [showModal, setShowModal] = useState(false);
    // const [polygonLayer, setPolygonLayer] = useState(null);
    // const [polygonData, setPolygonData] = useState(null);
    // const [feature, setFeature] = useState(null);


    const [viewport, setViewport] = useState({
        latitude: 39.8283,
        longitude: -98.5795,
        zoom: 4.25,
        bearing: 0,
        pitch: 0
    });

    const resetFeature = {
        feature: null,
        jobs: null,
        job: null,
        stateCenter: null,
        incumbents: []
    }

    const statesLayer = {
        id: 'states-layer',
        type: 'fill',
        source: 'states',
        paint: {
            'fill-color': 'rgba(181, 209, 255, 0.3)',
            'fill-outline-color': 'rgba(0, 0, 0, 0.5)'
        }
    }

    useEffect(() => {
        let states = {
            type: 'FeatureCollection',
            features: []
        }
        const features = allStates.features;

        for (let i = 0; i < features.length; i++) {
            if (features[i].properties.name === 'Utah' || features[i].properties.name === 'Virginia' || features[i].properties.name === 'Nevada') {
                states.features.push(features[i])
            }
        }

        setFilteredStates(states);
        if (stateFeature.feature !== null) {
            //disable respective job button
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = true;

            //set value of dropdown
            document.getElementById('state-selection').value = stateFeature.feature.properties.postal;
        }
    }, [])

    const mapClicked = (e) => {
        e.preventDefault();

        if (stateFeature.job !== null) {
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
        }
        setCurJob(null);
        //setShowModal(false);
        setStateFeature(resetFeature);
        //setPopUpCoords({ latitude: e.lngLat[1], longitude: e.lngLat[0], state: e.features[0].properties.name });
        if (e.features[0].properties.name === undefined || e.features[0].properties.name === "Toronto") {
            //setShowPopup(false)
            //setFeature(null);

            document.getElementById('state-selection').value = '';
        } else {
            //setShowPopup(true);
            getState(e.features[0].properties.name);
        }


    }

    const getState = (name) => {
        if (geojson === undefined) {
            return;
        }
        console.log(name)
        let cur_feature = null;
        for (let i = 0; i < geojson.features.length; i++) {
            if (geojson.features[i].properties.name === name) {
                cur_feature = geojson.features[i]
                // console.log(cur_feature.properties.postal)
                break
            }
        }
        console.log(cur_feature);

        //setFeature(cur_feature);
        // let temp_feature = {
        //     feature: null,
        //     jobs: null,
        //     job: null,
        //     stateCenter: null,
        //     page: 'state-selection'
        // }
        setStateFeature(resetFeature);
        if (cur_feature) {

            //10 jobs with random number of districtings
            let jobs = [];
            for (let i = 0; i < 10; i++) {
                jobs.push(Math.floor(Math.random() * 50000));
            }

            let temp_feature = {
                feature: cur_feature,
                jobs: jobs,
                job: null,
                stateCenter: null,
                incumbents: []
            };

            setStateFeature(temp_feature);

            setPd({
                polygonData: {
                    'type': cur_feature.type,
                    'geometry': {
                        'type': cur_feature.geometry.type,
                        'coordinates': cur_feature.geometry.coordinates
                    }
                },
                polygonLayer: {
                    'id': 'state-layer',
                    'type': 'fill',
                    'source': 'state',
                    'layout': {},
                    'paint': {
                        'fill-color': 'rgba(98, 201, 42, 0.5)',
                        'fill-outline-color': 'rgba(0, 0, 0, 0.5)'
                    }
                }
            })

            // setPolygonData({
            //     'type': cur_feature.type,
            //     'geometry': {
            //         'type': cur_feature.geometry.type,
            //         'coordinates': cur_feature.geometry.coordinates
            //     }
            // });

            // setPolygonLayer({
            //     'id': 'state-layer',
            //     'type': 'fill',
            //     'source': 'state',
            //     'layout': {},
            //     'paint': {
            //         'fill-color': 'rgba(132, 245, 134, 0.15)',
            //         'fill-outline-color': 'rgba(113, 191, 114, 0.3)'
            //     }
            // })

            document.getElementById('state-selection').value = cur_feature.properties.postal;
        }
    }

    const stateSelection = (e) => {
        e.preventDefault()

        if (stateFeature.job !== null) {
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
        }
        setCurJob(null);
        //setShowModal(false);
        setStateFeature(resetFeature);

        const state = e.target.options[e.target.selectedIndex].text;
        getState(state);
    }

    const jobClick = (e) => {
        e.preventDefault();
        //setShowModal(true);
        const index = parseInt(e.target.id.split("-")[1]);
        // const temp_feature = {
        //     feature: stateFeature.feature,
        //     jobs: stateFeature.jobs,
        //     job: index - 1
        // }
        // setStateFeature(temp_feature);

        setCurJob(index - 1);
        console.log(stateFeature);
        console.log(`Job ${index} has ${stateFeature.jobs[index - 1]} districtings.`)

        if (stateFeature.job === null) {
            console.log("null")
            document.getElementById(`job-${index}`).disabled = true;
        } else {
            console.log("not null")
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
            document.getElementById(`job-${index}`).disabled = true;
        }

        setStateFeature({
            feature: stateFeature.feature,
            jobs: stateFeature.jobs,
            job: index - 1,
            stateCenter: null,
            incumbents: []
        });
    }

    // const closePopup = (e) => {
    //     e.preventDefault();
    //     setCurJob(null);
    //     setShowModal(false);
    // }

    // const applyJob = () => {
    //     //e.preventDefault();
    //     if (stateFeature.job === null) {
    //         console.log("null")
    //         document.getElementById(`job-${curJob + 1}`).disabled = true;
    //     } else {
    //         console.log("not null")
    //         document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
    //         document.getElementById(`job-${curJob + 1}`).disabled = true;
    //     }

    //     setStateFeature({
    //         feature: stateFeature.feature,
    //         jobs: stateFeature.jobs,
    //         job: curJob,
    //         stateCenter: null,
    //         incumbents: []
    //     });
    //     setShowModal(false);
    // }

    const applyEverything = (e) => {
        e.preventDefault();

        setStateFeature({
            feature: stateFeature.feature,
            jobs: stateFeature.jobs,
            job: curJob,
            stateCenter: [stateCapitals[stateFeature.feature.properties.postal].lat, stateCapitals[stateFeature.feature.properties.postal].long],
            incumbents: []
        });
        setPageName('first-filter')

    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-2" align="center" style={{ backgroundColor: "#fff", zIndex: "2", paddingTop: "5rem" }}>
                    <h3>Select a state:</h3>
                    <select id="state-selection" class="form-select" onChange={stateSelection}>
                        <option value="" defaultValue hidden>Select a state</option>
                        <option value="NV">Nevada</option>
                        <option value="UT">Utah</option>
                        <option value="VA">Virginia</option>
                    </select>
                    {stateFeature.jobs !== null ? (
                        <div className="d-flex flex-column justify-content-between py-4" style={{ height: "80%", width: "100%" }}>
                            <hr></hr>
                            <h5>Choose a job:</h5>
                            {stateFeature.jobs.map((job, index) => {
                                return (
                                    <div key={index + 1}>
                                        <button id={`job-${index + 1}`} className="btn btn-primary" onClick={jobClick}>Job {index + 1}: {stateFeature.jobs[index]} redistrictings</button>
                                    </div>
                                )
                            })}

                            <div>
                                {stateFeature.job ? (
                                    <button type="button" className="btn btn-lg col-12 btn-success" onClick={applyEverything}>Proceed</button>
                                ) : (
                                        <button type="button" className="btn btn-lg col-12 btn-success" onClick={applyEverything} disabled>Proceed</button>
                                    )}

                            </div>
                            <hr></hr>
                        </div>
                    ) : ""}



                </div>

                {/* <div id="right-bar" className="col-2" style={{ backgroundColor: "#fff", zIndex: "2" }}>
                    bar 2
                </div> */}
            </div>


            <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={setViewport}
                mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
                onClick={mapClicked}
            >
                {stateFeature.feature !== null ? (
                    <Source
                        id="state"
                        type="geojson"
                        data={pd.polygonData}
                    >
                        <Layer
                            {...pd.polygonLayer}
                        />
                    </Source>
                ) : ""}

                <Source
                    id="states"
                    type="geojson"
                    data={filteredStates}
                >
                    <Layer
                        {...statesLayer}
                    />
                </Source>


                {/* {showPopup && <Popup
                    latitude={popUpCoords.latitude}
                    longitude={popUpCoords.longitude}
                    onClose={() => {
                        setShowPopup(false);
                        setFeature(null)
                    }}
                >
                    <div>{popUpCoords.state}</div>
                </Popup>
                } */}
            </ReactMapGL>

            {/* {showModal ? (
                <div className="card" style={{
                    zIndex: "1000",
                    height: "20%",
                    width: "20%",
                    position: "absolute",
                    backgroundColor: "rgba(255,255,255,0.8)",
                    bottom: "5%",
                    right: "50%",
                    left: "50%"
                }}>
                    <div className="card-body">
                        <h5 className="card-title">Job {curJob + 1}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">{stateFeature.feature.properties.name}</h6>
                        <p className="card-text">This job for {stateFeature.feature.properties.name} has {stateFeature.jobs[curJob]} districtings. Would you like to choose this job?</p>
                        <div className="d-flex flex-row justify-content-around">
                            <button className="btn btn-success" onClick={applyJob}>Yes</button>
                            <button className="btn btn-danger" onClick={closePopup}>No</button>
                        </div>

                    </div>
                </div>
            ) : ""} */}


        </div>

    )
}

export default StateSelection;