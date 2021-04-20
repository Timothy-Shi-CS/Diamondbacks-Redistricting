import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'



const StateSelection = () => {
    const { state, page, polygon } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page
    const [pd, setPd] = polygon

    //grab states from global state.

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

    let stateCenters;
    fetch('https://gist.githubusercontent.com/meiqimichelle/7727723/raw/0109432d22f28fd1a669a3fd113e41c4193dbb5d/USstates_avg_latLong')
        .then(resp => {
            return resp.json();
        })
        .then(data => {
            stateCenters = data;
        });

    const [curJob, setCurJob] = useState(null);


    const [viewport, setViewport] = useState({ //set viewing settings for map
        latitude: 39.8283,
        longitude: -98.5795,
        zoom: 4.25,
        bearing: 0,
        pitch: 0
    });

    const resetFeature = { //used to reset state data
        feature: null,
        jobs: null,
        job: null,
        stateCenter: null,
        incumbents: []
    }

    const statesLayer = {  //used to outline the entire U.S.
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
        if (stateFeature.feature !== null) { //if there is already a state chosen
            //disable respective job button
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = true; //there must have been a job that was already chosen as well

            //set value of dropdown
            document.getElementById('state-selection').value = stateFeature.feature.properties.postal;
            setCurJob(stateFeature.job)
            //set current job to job that was already chosen
        }
    }, [])

    const mapClicked = (e) => {
        e.preventDefault();

        if (stateFeature.job !== null) { //if user clicked on another state after choosing a job
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false; //reset the job button
        }
        setCurJob(null); //reset current job
        setStateFeature(resetFeature); //reset the data for state
        if (e.features[0].properties.name === 'Utah' || e.features[0].properties.name === 'Virginia' || e.features[0].properties.name === 'Nevada') { //check which state the user just clicked on
            setStateByName(e.features[0].properties.name); //state data for map will be set in the function
        } else { //if the chosen state is none of the 3
            console.log(e.features[0].properties)
            document.getElementById('state-selection').value = ''; //reset the dropdown value
        }


    }

    const setStateByName = (name) => { //set the state feature from name of chosen state
        if (geojson === undefined) { 
            return;
        }
        console.log(name)
        let cur_feature = null;
        for (let i = 0; i < geojson.features.length; i++) {
            if (geojson.features[i].properties.name === name) {
                cur_feature = geojson.features[i] //get features for chosen state
                break
            }
        }
        console.log(cur_feature);
        
        if (cur_feature) {  //if state exists

            //10 jobs with random number of districtings
            let jobs = [];
            for (let i = 0; i < 10; i++) {
                jobs.push(Math.floor((Math.random() * (101000 - 100000) + 100000)));
            }

            let temp_feature = {
                feature: cur_feature, //set the current features
                jobs: jobs, //set the randomly generated jobs
                job: null, //no job is chosen yet
                stateCenter: null,
                incumbents: []
            };

            setStateFeature(temp_feature); //set the data for the state

            setPd({
                polygonData: { //set geometry of chosen state
                    'type': cur_feature.type,
                    'geometry': {
                        'type': cur_feature.geometry.type,
                        'coordinates': cur_feature.geometry.coordinates
                    }
                },
                polygonLayer: { //set color and outline of chosen state
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

            document.getElementById('state-selection').value = cur_feature.properties.postal; //set the dropdown value with chosen state postal
        }else{ //state isn't valid
            setStateFeature(resetFeature); //reset the state data
        }
    }

    const stateSelectionDropdown = (e) => { //for the dropdown
        e.preventDefault()

        if (stateFeature.job !== null) { //if the user has chosen a job and changed state, reset the job button
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
        }
        setCurJob(null); //reset current job

        setStateFeature(resetFeature); //reset state data

        const state = e.target.options[e.target.selectedIndex].text;
        setStateByName(state); //set state data from value chosen in dropdown
    }

    const jobClick = (e) => {
        e.preventDefault();

        const id = parseInt(e.target.id.split("-")[1]); //get the id of that job


        setCurJob(id - 1); //set current job by the index
        console.log(stateFeature);
        console.log(`Job ${id} has ${stateFeature.jobs[id - 1]} districtings.`)

        if (stateFeature.job === null) { //if no previously chosen job exists
            console.log("null")
            document.getElementById(`job-${id}`).disabled = true; //disable currently chosen job button
        } else {
            console.log("not null")
            document.getElementById(`job-${stateFeature.job + 1}`).disabled = false; //reset the previously chosen job button
            document.getElementById(`job-${id}`).disabled = true; //disable currently chosen job button
        }

        setStateFeature({
            feature: stateFeature.feature,
            jobs: stateFeature.jobs,
            job: id - 1, //set current job by index
            stateCenter: null, //user hasn't confirmed on state selection so we leave center null
            incumbents: []
        });
    }

    const applyEverything = (e) => {
        e.preventDefault();
        console.log(stateFeature.feature)
        let center;
        for (let i = 0; i < stateCenters.length; i++) {
            if (stateCenters[i].state === stateFeature.feature.properties.name) {  //get the state center for respective state
                center = stateCenters[i];
                break;
            }
        }
        setStateFeature({
            feature: stateFeature.feature,
            jobs: stateFeature.jobs,
            job: curJob, //set the current job that was chosen
            stateCenter: [center.latitude, center.longitude], //set the center of that state for the next page
            incumbents: []
        });
        setPageName('constraints') //move on to next page

    }

    const numberWithCommas = (x) => { // add commas for thousands place and stuff
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-3 shadow-lg" align="center" style={{ backgroundColor: "#fff", zIndex: "2", paddingTop: "5rem", height: '100%' }}>
                    <h3>Select a state:</h3>
                    <select id="state-selection" class="form-select" onChange={stateSelectionDropdown}>
                        <option value="" defaultValue hidden>Select a state</option>
                        <option value="NV">Nevada</option>
                        <option value="UT">Utah</option>
                        <option value="VA">Virginia</option>
                    </select>
                    {stateFeature.jobs !== null ? ( 
                        <div className="d-flex flex-column justify-content-between py-4" style={{ height: "90%", width: "100%" }}>
                            <hr></hr>
                            <h5>Choose a job:</h5>
                            <div style={{ overflow: 'auto', height: '80%' }}>
                                {stateFeature.jobs.map((job, index) => {
                                    return (


                                        <div class="card" key={index + 1}>
                                            <h5 class="card-header">Job {index + 1}</h5>
                                            <div class="card-body">
                                                <h5 class="card-title">{numberWithCommas(stateFeature.jobs[index])} redistrictings</h5> 
                                                <p class="card-text">Rounds : {numberWithCommas(Math.floor(Math.random() * (100000 - 10000) + 10000))}</p>
                                                <p class="card-text">Cooling-Period: {Math.floor((Math.random() * 50) + 50)}</p>
                                                <button id={`job-${index + 1}`} className="btn btn-primary" onClick={jobClick}>Pick job {index + 1}</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div>
                                {stateFeature.job !== null ? ( //the proceed button should only be clickable when user has chosen a job
                                    <button type="button" className="btn btn-lg col-12 btn-success" onClick={applyEverything}>Proceed</button>
                                ) : (
                                        <button type="button" className="btn btn-lg col-12 btn-success" onClick={applyEverything} disabled>Proceed</button>
                                    )}

                            </div>
                            <hr></hr>
                        </div>
                    ) : ""}



                </div>


            </div>


            <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={setViewport}
                mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
                onClick={mapClicked}
            >
                {stateFeature.feature !== null ? ( //only display if the user has chosen a state and therefore setting stateFeature
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


            </ReactMapGL>


        </div>

    )
}

export default StateSelection;