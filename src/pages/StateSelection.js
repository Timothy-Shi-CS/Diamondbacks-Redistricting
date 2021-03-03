import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const StateSelection = () => {
    const { state, page, polygon } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page
    const [pd, setPd] = polygon

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
    const [showModal, setShowModal] = useState(false);
    // const [polygonLayer, setPolygonLayer] = useState(null);
    // const [polygonData, setPolygonData] = useState(null);
    // const [feature, setFeature] = useState(null);


    const [viewport, setViewport] = useState({
        latitude: 39.8283,
        longitude: -98.5795,
        zoom: 3.75,
        bearing: 0,
        pitch: 0
    });

    const resetFeature = {
        feature: null,
        jobs: null,
        job: null,
        stateCenter: null
    }

    const statesLayer = {
        id: 'states-layer',
        type: 'fill',
        source: 'states',
        paint: {
            'fill-color': 'rgba(181, 209, 255, 0.15)',
            'fill-outline-color': 'rgba(150, 173, 212, 0.2)'
        }
    }

    useEffect(()=>{
        if(stateFeature.feature!==null){
            //disable respective job button
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = true;

            //set value of dropdown
            document.getElementById('state-selection').value=stateFeature.feature.properties.postal;
        }
    },[])

    const mapClicked = (e) => {
        e.preventDefault();

        if (stateFeature.job !== null) {
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
        }
        setCurJob(null);
        setShowModal(false);
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
                stateCenter: null
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
                        'fill-color': 'rgba(132, 245, 134, 0.15)',
                        'fill-outline-color': 'rgba(113, 191, 114, 0.3)'
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
        setShowModal(false);
        setStateFeature(resetFeature);

        const state = e.target.options[e.target.selectedIndex].text;
        getState(state);
    }

    const jobClick = (e) => {
        e.preventDefault();
        setShowModal(true);
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
    }

    const closePopup = (e) => {
        e.preventDefault();
        setCurJob(null);
        setShowModal(false);
    }

    const applyJob = (e) => {
        e.preventDefault();
        if (stateFeature.job === null) {
            document.getElementById(`job-${curJob + 1}`).disabled = true;
        } else {
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
            document.getElementById(`job-${curJob + 1}`).disabled = true;
        }

        setStateFeature({
            feature: stateFeature.feature,
            jobs: stateFeature.jobs,
            job: curJob,
            stateCenter: null
        });
        setShowModal(false);
    }

    const applyEverything = (e) => {
        e.preventDefault();
        if (stateFeature.job === null) {
            alert("You must choose a job before applying.");
        } else {

            setStateFeature({
                feature: stateFeature.feature,
                jobs: stateFeature.jobs,
                job: curJob,
                stateCenter: [stateCapitals[stateFeature.feature.properties.postal].lat, stateCapitals[stateFeature.feature.properties.postal].long]
            });
            setPageName('first-filter')
        }
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-2" align="center" style={{ backgroundColor: "#fff", zIndex: "2", paddingTop: "5rem" }}>
                    <h3>State selection:</h3>
                    <select id="state-selection" onChange={stateSelection}>
                        <option value="" defaultValue hidden>Select a state</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                    </select>
                    {stateFeature.jobs !== null ? (
                        <div className="d-flex flex-column justify-content-between py-4" style={{ height: "80%", width: "100%" }}>
                            <hr></hr>
                            <h5>Choose a job:</h5>
                            {stateFeature.jobs.map((job, index) => {
                                return (
                                    <div key={index + 1}>
                                        <button id={`job-${index + 1}`} className="btn btn-primary" onClick={jobClick}>Job {index + 1}</button>
                                    </div>
                                )
                            })}

                            <div>
                                <button type="button" className="btn btn-lg col-12 btn-primary" onClick={applyEverything}>Apply</button>
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
                {/* {console.log(pd.polygonData)} */}
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
                    data='https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'
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

            {showModal ? (
                <div className="card" style={{
                    zIndex: "2",
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
            ) : ""}


        </div>

    )
}

export default StateSelection;