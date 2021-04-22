import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const Constraints = () => {
    const { state, page, districts, constraintsData} = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [constraints,setConstraints]=constraintsData

    const [popUpText, setPopUpText] = useState("");
    const [popUpCoords, setPopUpCoords] = useState(null);
    const [showIncumbents, setShowIncumbents] = useState(false);
    const [checkPopulation, setCheckPopulation] = useState([false, false, false])
    const [checkCompactness, setCheckCompactness] = useState([false, false, false])

    const [viewport, setViewport] = useState({ //map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const MODAL_STYLES = { //incumbent display styling
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        backgroundColor: "rgba(255,255,255,1.0)",
        zIndex: 1000,
        width: '40%',
        height:'70%'
    }

    const OVERLAY_STYLES = { //darken the background behind the incumbent popup
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
        console.log(stateDistricts)
        if (stateDistricts === null) { //if the districts for the enacted districting weren't loaded in before, load them in now
            let coordHolder = { //set up the map that will hold all this data
                type: "FeatureCollection",
                features: [],
                distNums: [],
                distColors: []
            }
            let districts = []; //this will hold the numbers for each district
            let colors = []; //this will hold the colors(randomly generated) for each district
            const features = enactedDistricts.features;
            for (var i = 0; i < features.length; i++) {
                if (features[i].properties.STATENAME === stateFeature.feature.properties.name) { //get only the data for the selected state
                    coordHolder.features.push({ //set data in our map we made earlier
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

                    colors.push(`rgba(${red},${blue},${green},0.5)`); //generate a random color and push
                    districts.push(features[i].properties.DISTRICT); //push the district number
                }
            }
            coordHolder.distNums = [...districts]; //set the district numbers list
            coordHolder.distColors = [...colors]; //set the colors list
            setStateDistricts(coordHolder); //set all this data in global state
        }
        let tempCheckPopulation=checkPopulation
        tempCheckPopulation[[constraints.populationConstraint.type]]=true
        setCheckPopulation(tempCheckPopulation)
       
        let tempCheckCompactness=checkCompactness
        tempCheckCompactness[[constraints.compactnessConstraint.type]]=true
        setCheckCompactness(tempCheckCompactness)
        
    }, [])

    const openIncumbentPopup = (e) => {
        e.preventDefault();
        setShowIncumbents(true); 
    }

    const saveEverything = (e) => {
        e.preventDefault();
        setPageName('obj-func-page'); //move on to next page
    }

    const backToStateSelection = (e) => {
        console.log('back to state selection');
        resetChecks(); //reset any incumbents user protected
        setStateDistricts(null); //reset any district data for enacted districting

        setConstraints({ //reset constraint value and choice
            populationConstraint:{
                value:0.02,
                type:0
            },
            compactnessConstraint:{
                value:0.5,
                type:0
            },
            majorityMinorityConstraint:2,
            incumbents:[]
        })

        setPageName('state-selection'); //go back to state selection
    }

    const userChecked = (e) => {
        let index = parseInt(e.target.id.split('t')[1]) //get index of incumbent in list
        let tempChecks = [...constraints.incumbents]; //get the list of checks
        tempChecks[index - 1] = !tempChecks[index - 1] //toggle the incumbent in list

        setConstraints(prevConstraints => {
            return {
                ...prevConstraints,
                incumbents:[...tempChecks] //set list of checks in context
            }
        })
    }

    const resetChecks = (e) => {
        let reset = [false, false, false, false, false, false, false, false, false, false, false]; 

        setConstraints(prevConstraints => {
            return {
                ...prevConstraints,
                incumbents:[...reset] //set list of checks in context
            }
        })
    }

    const popEqual = (e) => {
        e.preventDefault();

        setConstraints(prevConstraints=>{
            return{
                ...prevConstraints,
                populationConstraint:{
                    value:e.target.value,
                    type:constraints.populationConstraint.type
                }
            }
        })
    }

    const majMin = (e) => {
        e.preventDefault();

        setConstraints(prevConstraints=>{
            return{
                ...prevConstraints,
                majorityMinorityConstraint:e.target.value
            }
        })
    }

    const compact = (e) => {
        e.preventDefault();

        setConstraints(prevConstraints=>{
            return{
                ...prevConstraints,
                compactnessConstraint:{
                    value:e.target.value,
                    type:constraints.compactnessConstraint.type
                }
            }
        })
    }

    const userClickedDistrict = (e) => {
        e.preventDefault();

        if (e.features[0].source !== 'composite') { //if the area the user clicked on is a district
            const dist_num = parseInt(e.features[0].source.split('_')[1]);

            setPopUpCoords([...e.lngLat]); //set the position of the popup
            setPopUpText(`District ${dist_num}`); //set the text of the popup
        } else {
            setPopUpCoords(null)
        }

    }

    const numberWithCommas = (x) => { //added commas for numbers
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const selectAllIncumbents = (e) => {
        e.preventDefault();
        let tempChecks = [true, true, true, true, true, true, true, true, true, true, true];
        setConstraints(prevConstraints => {
            return {
                ...prevConstraints,
                incumbents:[...tempChecks] //set list of checks in context
            }
        })
        
    }

    const userCheckedPop = (e) => {
        const parsedIndex = parseInt(e.target.id.split('_')[1])
        console.log(parsedIndex)
        let index=0;
        let tempChecks = checkPopulation;
        for (let i = 0; i < tempChecks.length; i++) {
            if (i === parsedIndex) { //toggle the selected population type
                tempChecks[i] = true;
                index=i;
            } else {
                tempChecks[i] = false; //set everything else to false
            }
        }

        setCheckPopulation([...tempChecks]); //set population type list

        setConstraints(prevConstraints =>{
            return {
                ...prevConstraints,
                populationConstraint:{
                    value:constraints.populationConstraint.value,
                    type:index
                }
            }
        })
    }

    const userCheckedCompactness=(e)=>{
        const parsedIndex = parseInt(e.target.id.split('_')[1])
        console.log(parsedIndex)
        let index=0;
        let tempChecks = checkCompactness;
        for (let i = 0; i < tempChecks.length; i++) {
            if (i === parsedIndex) { //toggle the selected population type
                tempChecks[i] = true;
                index=i
            } else {
                tempChecks[i] = false; //set everything else to false
            }
        }

        setCheckCompactness([...tempChecks]); //set population type list

        setConstraints(prevConstraints => {
            return {
                ...prevConstraints,
                compactnessConstraint:{
                    value:constraints.compactnessConstraint.value,
                    type:index
                }
            }
        })
    }

    let render = "";

    if (stateDistricts) { //if the districts have been loaded in
        render = stateDistricts.features.map((districtFeature, index) => { //for each district
            const districtFeatureData = { //create the data for that district
                type: districtFeature.type,
                geometry: {
                    type: districtFeature.geometry.type,
                    coordinates: districtFeature.geometry.coordinates
                }
            };

            const districtFeatureLayer = { //create the layer for that district
                'id': `district_${stateDistricts.distNums[index]}_layer`, //lets identify each layer by the district's actual number
                'type': 'fill',
                'source': `district_${stateDistricts.distNums[index]}`,
                'layout': {},
                'paint': {
                    'fill-color': stateDistricts.distColors[index],
                    'fill-outline-color': 'rgba(255,255,255,1.0)'
                }
            };

            return ( //return a source component with a child Layer component for that district
                <Source
                    id={`district_${stateDistricts.distNums[index]}`} //lets identify each Source component by the district's actual number
                    type='geojson'
                    data={districtFeatureData}
                    key={index}
                >
                    <Layer {...districtFeatureLayer} />
                </Source>
            )
        })
    }


    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0'}}>
                <div id="left-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2", position:'relative'}}>
                    <p class="h6 d-inline-block back-btn text-white" onClick={backToStateSelection} style={{position:'relative', zIndex:"4"}}>Back</p>
                    <div className="bg-primary constraints_banner">

                    </div>
                    <div className="text-white" align="center" style={{ paddingTop: "1.5rem" , position:'relative', zIndex:"4", marginBottom:"25px"}}>
                        <p class="h2">Constraints</p>
                        <p class="h6"><em>Job {stateFeature.job + 1}: {numberWithCommas(stateFeature.jobs[stateFeature.job])} redistrictings</em></p>
                    </div>
                    <div className="d-flex flex-column justify-content-between py-4" style={{ height: "80%", width: "100%" }}>
                        <div>
                            <p class="h4">Incumbent Protection:</p>
                            <button type="button" class="btn btn-link" onClick={openIncumbentPopup}>Choose incumbents</button>
                        </div>
                        <hr></hr>

                        <div>
                            <p class="h4">Population Equality:</p>
                            <div>
                                <div class="d-flex flex-row justify-content-start">
                                    <input class="form-check-input" type="radio" id="totPop_0" style={{ marginRight: '10px' }} checked={checkPopulation[0]} onChange={userCheckedPop} />
                                    <label class="h6" htmlFor='totPop_0'>Total Population</label>

                                </div>
                                <div class="d-flex flex-row justify-content-start">
                                    <input class="form-check-input" type="radio" id="vap_1" style={{ marginRight: '10px' }} checked={checkPopulation[1]} onChange={userCheckedPop} />
                                    <label class="h6" htmlFor='vap_1'>Voting Age Population</label>
                                </div>
                                <div class="d-flex flex-row justify-content-between">
                                    <div>
                                        <input class="form-check-input" type="radio" id="cvap_2" style={{ marginRight: '10px' }} checked={checkPopulation[2]} onChange={userCheckedPop} />
                                        <label class="h6" htmlFor='cvap_2'>Citizen Voting Age Population</label>
                                    </div>
                                    {/* <p class="h4 px-2 border border-primary">{popEqualValue}</p> */}
                                    <input type="number" value={constraints.populationConstraint.value} disabled="disabled" style={{ width: '60px' }} />
                                </div>
                            </div>


                            <input type="range" class="form-range" min="0" max="0.05" step="0.001" id="pop_eq_range" onInput={popEqual} value={constraints.populationConstraint.value} />
                            <div class="d-flex flex-row justify-content-between">
                                <p>0</p>
                                <p>0.05</p>
                            </div>
                        </div>
                        <hr></hr>

                        <div>
                            <div class="d-flex flex-row justify-content-between">
                                <p class="h4">Majority-Minority Districts:</p>
                                <input type="number" value={constraints.majorityMinorityConstraint} disabled="disabled" style={{ width: '60px' }} />
                            </div>
                            <input type="range" class="form-range" min="0" max="4" step="1" id="maj_min_range" onInput={majMin} value={constraints.majorityMinorityConstraint} />
                            <div class="d-flex flex-row justify-content-between">
                                <p>0</p>
                                <p>4</p>
                            </div>
                        </div>
                        <hr></hr>
                        <div>
                            <div>
                                <p class="h4">Compactness:</p>
                                <div class="px-3">
                                <div>
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="form-check">
                                            <label class="form-check-label h6" htmlFor="geo-compact_0">
                                                {/* <p class="h6">Geographic compactness:</p> */}
                                                Geographic compactness
                                            </label>
                                            <input class="form-check-input" type="radio" id="geo-compact_0" onChange={userCheckedCompactness} checked={checkCompactness[0]}/>
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
                                            <label class="form-check-label" htmlFor="graph-compact_1">
                                                <p class="h6">Graph compactness</p>
                                            </label>
                                            <input class="form-check-input" type="radio" id="graph-compact_1" onChange={userCheckedCompactness} checked={checkCompactness[1]}/>
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
                                            <label class="form-check-label" htmlFor="pop-fat_2">
                                                <p class="h6">Population fatness</p>
                                            </label>
                                            <input class="form-check-input" type="radio" id="pop-fat_2" onChange={userCheckedCompactness} checked={checkCompactness[2]}/>
                                        </div>
                                        {/* <p class="h6">Population fatness:</p> */}
                                        <input type="number" value={constraints.compactnessConstraint.value} disabled="disabled" style={{ width: '60px' }} />
                                    </div>
                                </div>
                            </div>
                                
                            </div>
                            <input type="range" class="form-range" min="0" max="1" step="0.01" id="compact_range" onInput={compact} value={constraints.compactnessConstraint.value} />
                            <div class="d-flex flex-row justify-content-between">
                                <p>0</p>
                                <p>1</p>
                            </div>
                        </div>

                        <div>
                            <button type="button" className="btn btn-lg col-12 btn-primary" onClick={saveEverything}>Apply</button>
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

                {popUpCoords? (
                    <Popup
                        latitude={popUpCoords[1]}
                        longitude={popUpCoords[0]}
                        onClose={() => { setPopUpCoords(null) }}
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


            {showIncumbents ? (
                <div className="incumbentPopup">
                    <div style={OVERLAY_STYLES} />
                    <div className="card" style={MODAL_STYLES}>
                        {/* {children} */}
                        <div class="card-body">
                            <h5 class="card-title">Choose your incumbents</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Edits are automatically saved</h6>
                            <div style={{height:'80%', overflow:'auto'}}>
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">District #</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Party</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="table-danger">
                                            <th scope="row">1</th>
                                            <td>Robert Wittman</td>
                                            <td>Republican</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent1" checked={constraints.incumbents[0]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">2</th>
                                            <td>Elaine Luria</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent2" checked={constraints.incumbents[1]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">3</th>
                                            <td>Robert Scott</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent3" checked={constraints.incumbents[2]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">4</th>
                                            <td>Donald McEachin</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent4" checked={constraints.incumbents[3]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-danger">
                                            <th scope="row">5</th>
                                            <td>Robert Good</td>
                                            <td>Republican</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent5" checked={constraints.incumbents[4]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-danger">
                                            <th scope="row">6</th>
                                            <td>Ben Cline</td>
                                            <td>Republican</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent6" checked={constraints.incumbents[5]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">7</th>
                                            <td>Abigail Spanberger</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent7" checked={constraints.incumbents[6]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">8</th>
                                            <td>Donald Beyer Jr.</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent8" checked={constraints.incumbents[7]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-danger">
                                            <th scope="row">9</th>
                                            <td>Morgan Griffith</td>
                                            <td>Republican</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent9" checked={constraints.incumbents[8]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">10</th>
                                            <td>Jennifer Wexton</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent10" checked={constraints.incumbents[9]} onChange={userChecked} /></td>
                                        </tr>
                                        <tr class="table-info">
                                            <th scope="row">11</th>
                                            <td>Gerald Connolly</td>
                                            <td>Democratic</td>
                                            <td><input class="form-check-input" type="checkbox" value="" id="incumbent11" checked={constraints.incumbents[10]} onChange={userChecked} /></td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex flex-row justify-content-around" style={{marginTop:"10px"}}>
                                <button className="btn btn-secondary" onClick={selectAllIncumbents}>Select All</button>
                                <button className="btn btn-success" onClick={resetChecks}>Reset</button>
                                <button className="btn btn-danger" onClick={() => setShowIncumbents(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : ""}
            <p style={{ position: 'absolute', top: '95%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1' }}><strong><em>Figure shows the most recent district boundaries</em></strong></p>

        </div>
    )
}

export default Constraints;