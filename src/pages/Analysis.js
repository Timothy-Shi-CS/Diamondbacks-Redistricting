import React, { useState, useContext, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl"
import Plot from 'react-plotly.js';

import { StateContext } from '../contexts/StateContext'

const Analysis = () => {
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

    let [checks, setChecks] = useState([false, false, false, false, false]);

    const [curDistricting, setCurDistricting] = useState('');
    const [curDistrictingNum, setCurDistrictingNum] = useState(null);

    const [districtNumbers, setDistrictNumbers] = useState(null);
    const [showComparisonPopup, setShowComparisonPopup] = useState(false);
    const [showBoxAndWhiskerPopup, setShowBoxAndWhiskerPopup] = useState(false);

    const [viewport, setViewport] = useState({ //main map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const [viewportEnacted, setViewportEnacted] = useState({ //enacted map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const [viewportDB, setViewportDB] = useState({ //chosen districting map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });



    const OVERLAY_STYLES = { //background of comparison popup
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 1000
    }

    const MODAL_STYLES = { //styling for display of comparing districtings
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        // backgroundColor: "rgba(255,255,255,1.0)",
        height: "100%",
        width: '100%',
        zIndex: 1000
    }

    const data = [ //placeholder data for box and whisker
        {
            name: "1",
            y: [2.6, 2.7, 3.3, 5, 5, 6, 7, 9, 8.7, 10, 6.9, 5.33, 3.72, 2, 7.3, 2.9, 4.43, 5.67, 8.19, 15.76, 18.79],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "2",
            y: [4.3, 5.67, 4, 6.7, 7.8, , 8.9, 12.54, 18.33, 20.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "3",
            y: [6.3, 6.67, 5, 7.7, 8.8, 9.9, 13.54, 19.33, 22.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "4",
            y: [6.3, 8.67, 9, 10.7, 11.8, 12.9, 16.54, 22.33, 25.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "5",
            y: [6.9, 10.67, 11, 12.7, 14.8, 16.9, 20.54, 27.33, 33.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "6",
            y: [7.9, 12.67, 13, 15.7, 17.8, 20.9, 24.54, 31.33, 35.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "7",
            y: [8.4, 14.67, 15, 17.7, 21.8, 24.9, 27.54, 33.33, 37.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },

        {
            name: "8",
            y: [19.5, 20.67, 21, 24.7, 32.8, 35.9, 38.54, 38.33, 49.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "9",
            y: [31.5, 34.67, 36, 38.7, 46.8, 47.9, 48.54, 48.33, 59.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "10",
            y: [41.5, 44.67, 36, 48.7, 56.8, 57.9, 68.54, 78.33, 79.89],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false


        },
        {
            name: "11",
            y: [79.97, 82.15, 63.3, 65.87, 75.87, 67.3, 73.2, 91.21, 82.7, 84.24, 62.9, 52.33, 53.72, 42.87, 72.3, 44.9, 44.43, 55.67, 68.19, 65.76, 60.73],
            boxpoints: false,
            type: 'box', marker: {
                color: 'rgb'
            },
            showlegend: false

        },
        {
            name: "Enacted",
            mode: "markers",
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            y: [1, 2, 4, 16, 20, 24, 51, 54, 64, 82, 91],
            type: "scatter",
            marker: { color: "red" }
        }, {
            name: "Current",
            mode: "markers",
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            y: [Math.random() * (18.79 - 2.6) + 2.6,
            Math.random() * (20.89 - 4.3) + 4.3,
            Math.random() * (22.89 - 6.3) + 6.3,
            Math.random() * (25.89 - 6.3) + 6.3,
            Math.random() * (33.89 - 6.9) + 6.9,
            Math.random() * (35.89 - 7.9) + 7.9,
            Math.random() * (37.89 - 8.4) + 8.4,
            Math.random() * (49.89 - 19.5) + 19.5,
            Math.random() * (59.89 - 31.5) + 31.5,
            Math.random() * (79.89 - 36) + 36,
            Math.random() * (91.21 - 42.87) + 42.87,],
            type: "scatter",
            marker: { color: "blue" }
        }
    ];

    const demographics = { //placeholder demographic data for district popup
        '1': <p><b>Incumbent:</b> Rob Wittman<br /><b>Total Population:</b> 824,492<br /><b>White:</b> 596,921<br /><b>Black or African American:</b> 134,826<br /><b>American Indian and Alaska Native:</b> 1,781<br /><b>Asian:</b> 29,756<br /><b>Native Hawaiian and Other Pacific Islander:</b> 53<br /><b>Some other race:</b> 26,421</p>,
        '2': <p><b>Incumbent:</b> Elaine Luria<br /><b>Total Population:</b> 723,927<br /><b>White:</b> 486,553<br /><b>Black or African American:</b> 139,463<br /><b>American Indian and Alaska Native:</b> 1,888<br /><b>Asian:</b> 44,601<br /><b>Native Hawaiian and Other Pacific Islander:</b> 709<br /><b>Some other race:</b> 15,586</p>,
        '3': <p><b>Incumbent:</b> Bobby Scott<br /><b>Total Population:</b> 760,127<br /><b>White:</b> 329,198<br /><b>Black or African American:</b> 360,389<br /><b>American Indian and Alaska Native:</b> 975<br /><b>Asian:</b> 19,615<br /><b>Native Hawaiian and Other Pacific Islander:</b> 725<br /><b>Some other race:</b> 15,501</p>,
        '4': <p><b>Incumbent:</b> Donald McEachin<br /><b>Total Population:</b> 768,382<br /><b>White:</b> 394,028<br /><b>Black or African American:</b> 315,577<br /><b>American Indian and Alaska Native:</b> 2,487<br /><b>Asian:</b> 12,914<br /><b>Native Hawaiian and Other Pacific Islander:</b>26<br /><b>Some other race:</b> 16,956<br /><b>Hispanic or Latino (of any race):</b> 46,332</p>,
        '5': <p><b>Incumbent:</b> Robert Good<br /><b>Total Population:</b> 735,766<br /><b>White:</b> 551,428<br /><b>Black or African American:</b> 315,577<br /><b>American Indian and Alaska Native:</b> 2,632<br /><b>Asian:</b> 12,914<br /><b>Native Hawaiian and Other Pacific Islander:</b> 26<br /><b>Some other race:</b> 16,956<br /><b>Hispanic or Latino (of any race):</b> 46,332</p>,
        '6': <p><b>Incumbent:</b> Ben Cline<br /><b>Deviation from population from ideal:</b> 0.02<br /><b>Deviation from enacted:</b> 0.01<br /><b>Total Population:</b> 755,012<br /><b>White:</b> 620, 342<br /><b>Black or African American:</b> 90,140<br /><b>American Indian and Alaska Native:</b> 2,033<br /><b>Asian:</b> 11,315<br /><b>Native Hawaiian and Other Pacific Islander:</b> 428<br /><b>Some other race:</b> 8,558<br /><b>Hispanic or Latino(of any race):</b> 42,512</p>,
        '7': <p><b>Incumbent:</b> Abigail Spanberger<br /><b>Deviation from population from ideal:</b> 0.02<br /><b>Deviation from enacted:</b> 0.01<br /><b>Total Population:</b> 802,921<br /><b>White:</b> 554,096<br /><b>Black or African American:</b> 144,789<br /><b>American Indian and Alaska Native:</b> 1,580<br /><b>Asian:</b> 43,682<br /><b>Native Hawaiian and Other Pacific Islander:</b> 431<br /><b>Some other race:</b> 16,956<br /><b>Hispanic or Latino (of any race):</b> 46,332</p>,
        '8': <p><b>Incumbent:</b> Don Beyer<br /><b>Deviation from population from ideal:</b> 0.05<br /><b>Deviation from enacted:</b> 0.03<br /><b>Total Population:</b> 813,568<br /><b>White:</b> 511,900<br /><b>Black or African American:</b> 114,695<br /><b>American Indian and Alaska Native:</b> 2,268<br /><b>Asian</b>: 99,313<br /><b>Native Hawaiian and Other Pacific Islander</b>: 159<br /><b>Some other race:</b> 47,546<br /><b>Hispanic or Latino (of any race):</b> 150,802</p>,
        '9': <p><b>Incumbent:</b> Morgan Griffith<br /><b>Deviation from population from ideal:</b> 0.02<br /><b>Deviation from enacted:</b> 0.04<br /><b>Total Population:</b> 857,693<br /><b>White:</b> 638,988<br /><b>Black or African American:</b> 38,995<br /><b>American Indian and Alaska Native:</b> 1,714<br /><b>Asian:</b> 10,633<br /><b>Native Hawaiian and Other Pacific Islander:</b> 583<br /><b>Some other race:</b> 2,632<br /><b>Hispanic or Latino (of any race):</b> 19,557</p>,
        '10': <p><b>Incumbent:</b> Jennifer Wexton<br /><b>Deviation from population from ideal:</b> 0.02<br /><b>Deviation from enacted:</b> 0.04<br /><b>Total Population:</b> 857,693<br /><b>White:</b> 593,061<br /><b>Black or African American:</b> 68,611<br /><b>American Indian and Alaska Native:</b> 2,284<br /><b>Asian:</b> 133,607<br /><b>Native Hawaiian and Other Pacific Islander:</b> 490<br /><b>Some other race: </b>21,341<br /><b>Hispanic or Latino (of any race):</b> 123,194</p>,
        '11': <p><b>Incumbent:</b> Gerry Conolly<br /><b>Deviation from population from ideal:</b> 0.04<br /><b>Deviation from enacted:</b> 0.02<br /><b>Total Population:</b> 789,553<br /><b>White:</b> 438,131<br /><b>Black or African American:</b> 109,462<br /><b>American Indian and Alaska Native:</b> 3,746<br /><b>Asian:</b> 147,446<br /><b>Native Hawaiian and Other Pacific Islander:</b> 1,200<br /><b>Some other race: </b>54,991<br /><b>Hispanic or Latino (of any race):</b> 150,667</p>
    }

    let districtingData = new Array(3); //load in past districtings for the chosen state.
    let counties;
    if (stateFeature.feature.properties.name === 'Virginia') {
        districtingData[0] = require('../data/virginiaDistrict1.json');
        districtingData[1] = require('../data/virginiaDistrict2.json');
        districtingData[2] = require('../data/virginiaDistrict3.json');
        counties = require('../data/virginiaCounties.json');
    } else if (stateFeature.feature.properties.name === 'Utah') {
        districtingData[0] = require('../data/utahDistrict1.json');
        districtingData[1] = require('../data/utahDistrict2.json');
        districtingData[2] = require('../data/utahDistrict3.json');
        counties = require('../data/utahCounties.json');
    } else if (stateFeature.feature.properties.name === 'Nevada') {
        districtingData[0] = require('../data/nevadaDistrict1.json');
        districtingData[1] = require('../data/nevadaDistrict2.json');
        districtingData[2] = require('../data/nevadaDistrict3.json');
        counties = require('../data/nevadaCounties.json');
    }

    const stateCoords = require('../data/stateCoords.json'); //load in dataset that contains geometry for each state. we'll use this to show the actual state as a default view.

    useEffect(() => {

        console.log(districtingData)
        const stateLayer = { //create a layer to hold the styling of state geometry
            'id': 'state-layer',
            'type': 'fill',
            'source': 'state',
            'layout': {},
            'paint': {
                'fill-color': 'rgba(98, 201, 42, 0.15)',
                'fill-outline-color': 'rgba(113, 191, 114, 0.3)'
            }
        }
        setCurDistricting(
            <Source
                id="state"
                type="geojson"
                data={stateFeature.feature} //use the saved stateFeature feature data for the source layer
            >
                <Layer {...stateLayer} />
            </Source>
        )
    }, [])

    const backToObjFunc = (e) => {
        e.preventDefault();
        setPageName('weights'); //go back to weights
    }

    const backToStateSelection = (e) => {
        e.preventDefault();
        setStateDistricts(null);
        let paramValues = {
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
        setObjValueParams(paramValues); //reset the weights
        setPageName('state-selection') //go back to state selection
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

    const userChoseDistricting = (e) => {
        e.preventDefault()
        let tempChecks = [false, false, false, false, false]; //reset any filters the user has clicked on

        setShowPopup(false); //close any popups
        setChecks([...tempChecks]); //set the filter selection
        setView('');
        setCountyLayer(""); //clear the current county layer

        setShowFilters(true); //leave the filters visible
        const name = e.target.options[e.target.selectedIndex].text; //get the selected districting from dropdown
        setCurDistrictingNum(name.split(' ')[1]); //get the number of the districting
        setDistrictMap(name) //pass the districting name to the setDistrictMap function
        console.log(name);
    }

    const userChecked = (e) => { //user clicked on one of the filters
        let tempChecks = [false, false, false, false, false];
        const index = parseInt(e.target.id.split('-')[2]); //get the index of the selected filter
        setShowPopup(false); //remove any popups
        if (checks[index - 1] === true) { //if the filter was originally selected, turn it off
            tempChecks[index - 1] = false;
            removeOtherFilterLayers(); //get back the origin colors of each district
            setView(''); //
            setCountyLayer('') //clear county layer
        } else { //if the filter was originally deselected, turn it on
            tempChecks[index - 1] = true;
            setView(e.target.id);
            if (index === 1) {
                removeOtherFilterLayers();
                showCounties(); //show counties
            } else if (index === 2) {
                showDevAvg(); //show deviation from average
                setCountyLayer('') //remove the counties
            } else {
                removeOtherFilterLayers();
                setCountyLayer('') //remove the counties
            }
        }
        setChecks([...tempChecks]);
        console.log(index);
    }

    const getDistrictColorsAndNumbers = (data) => {
        let distNums = [];
        let distColor = [];
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

        return {
            distNums: distNums,
            distColor: distColor
        }
    }

    const setMapWithDistrictsData = (data, districtsColorsAndNumbers) => {
        setCurDistricting( //let the current districting be a new list of source and layer components corresponding to the data of each district.
            data.features.map((f, index) => {
                const f_data = { //for the source component
                    type: f.type,
                    geometry: {
                        type: f.geometry.type,
                        coordinates: f.geometry.coordinates
                    }
                };

                const f_layer = { //for the layer component
                    'id': `district_${index}_layer`, //uniquely identify each district layer by the district's index.
                    'type': 'fill',
                    'source': `district_${index}`,
                    'layout': {},
                    'paint': {
                        'fill-color': `${districtsColorsAndNumbers.distColor[index]}`,
                        'fill-outline-color': 'rgba(255,255,255,1.0)'
                    }
                };

                return (
                    <Source
                        id={`district_${index}`} //uniquely identify each district source by the district's index.
                        type='geojson'
                        data={f_data}
                        key={index}
                    >
                        <Layer {...f_layer} />
                    </Source>
                )
            })
        )
    }

    const setDistrictMap = (districtName) => {
        let data = districtingData[parseInt(districtName.split(' ')[1]) - 1]; //get the district data from the number of the districting
        console.log(data)
        const districtsColorsAndNumbers = getDistrictColorsAndNumbers(data)
        const distNums = districtsColorsAndNumbers.distNums
        console.log(data);
        console.log(distNums)
        setDistrictNumbers([...distNums]); //save the list of district numbers
        setMapWithDistrictsData(data, districtsColorsAndNumbers)
    }



    const removeOtherFilterLayers = () => {
        let data = districtingData[parseInt(curDistrictingNum) - 1]; //get the district data for the already selected districting

        const districtsColorsAndNumbers = getDistrictColorsAndNumbers(data);
        const distNums = districtsColorsAndNumbers.distNums

        console.log(data);
        console.log(distNums)
        setDistrictNumbers([...distNums]);

        setMapWithDistrictsData(data, districtsColorsAndNumbers)
    }

    const showCounties = () => {
        console.log(counties);
        const countyLayer = { //styling for layer that shows counties
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
                <Layer {...countyLayer} />
            </Source>
        );
    }

    const showDevAvg = () => {
        console.log(curDistrictingNum);

        let data = districtingData[parseInt(curDistrictingNum) - 1]; //get the data for the selected districting
        let distNums = [];
        let distColor = [];


        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members)

            if (data.features[i].properties.member[maxMember][Object.keys(data.features[i].properties.member[maxMember])[0]].party === 'Republican') {
                distColor.push(`rgba(235, 64, 52,${Math.random() * (1.0 - 0.1) + 0.1})`) //set the color and also the alpha value
            } else {
                distColor.push(`rgba(52, 122, 235,${Math.random() * (1.0 - 0.1) + 0.1})`)
            }
            console.log(members);
            console.log(maxMember)
        }
        console.log(data);
        console.log(distNums)
        setDistrictNumbers([...distNums]);
        const districtsColorsAndNumbers = {
            distColor: distColor
        }

        setMapWithDistrictsData(data, districtsColorsAndNumbers)
    }

    const resetCurDistricting = () => {
        const stateLayer = { //styling used to reset the map
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

    const resetChecks = (e) => { //user clicks on the reset button
        e.preventDefault();
        setShowFilters(false); //remove any filters from map
        setShowPopup(false); //remove any popups
        document.getElementById("districting-selection").value = ""; //clear the dropdown
        let tempChecks = [false, false, false, false, false]; //remove any selected filters
        setChecks([...tempChecks]);
        setView('');
        setCountyLayer("");
        resetCurDistricting(); //bring map of state back to a blank slate
        setCurDistrictingNum(null); //reset currently selected districting
    }

    const userClickedOnMap = (e) => { //user clicked on one of the districts
        e.preventDefault();
        console.log(e);
        let coords = [e.lngLat[0], e.lngLat[1]]; //get the coordinates of where the user clicked.
        if (e.features[0].source.includes('district')) { //make sure that the user actually clicked on one of the districts
            const index = parseInt(e.features[0].source.split('_')[1]); //get the index of that district

            setShowPopup(true); //show popup and set the text for the popup
            setPopUpText(<>
                <h3><b>District {districtNumbers[index]}</b></h3>
                {demographics[districtNumbers[index]]}
                <p>
                    <b>District {districtNumbers[index]} obj. value: </b>15<br />
                    <b>General:</b><br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Population Equality: </b>2 (<i>weight: 0.62</i>)<br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Split counties: </b>3 (<i>weight: 0.21</i>)<br />
                    <b>Deviation From: </b><br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Average Districting: </b>2 (<i>weight: 0.79</i>)<br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Enacted Districting(geometric): </b>1 (<i>weight: 0.44</i>)<br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Enacted Districting(population): </b>2 (<i>weight: 0.97</i>)<br />
                    <b>Compactness: </b>4<br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Geometric: </b>1 (<i>weight: 0.50</i>)<br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Graph: </b>2 (<i>weight: 0.50</i>)<br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Population Fatness: </b>1 (<i>weight: 0.50</i>)<br />
                    <b>Other:</b><br />
                    <b>&nbsp;&nbsp;&nbsp;&nbsp;Political Fairness:</b>1 (<i>weight: 0.43</i>)
                </p>
            </>);
            setPopUpCoords([...coords]); //set the location of the popup
        } else if (e.features[0].source === 'counties') { //if the user clicked on a county instead
            setShowPopup(true); //show popup
            e.features[0].properties.name ? setPopUpText(`${e.features[0].properties.name}`) : setPopUpText(`${e.features[0].properties.NAME}`); //set the text
            setPopUpCoords([...coords]); //set location of the popup
        }
        else {
            setShowPopup(false);
        }

    }

    const showComparison = (e) => {
        e.preventDefault();
        setShowComparisonPopup(true); //show the comparison between enacted and selected
        console.log('show comparison');
    }

    const getUnstyledCurDistricting = () => { //get the unstyled current districting
        let data = districtingData[parseInt(curDistrictingNum) - 1];
        let distNums = [];
        let distColor = [];

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
                        key={index}
                    >
                        <Layer {...f_layer} />
                    </Source>
                )
            })
        )
    }

    const showBoxAndWhisker = (e) => {
        e.preventDefault();
        setShowBoxAndWhiskerPopup(true); //show box and whisker
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

    let compactness;
    if (objValueParams.chosenCompactness === 'graph-compact') {
        compactness = 'Graph Compactness'
    }
    else if (objValueParams.chosenCompactness === 'geo-compact') {
        compactness = 'Geometric Compactness'
    } else {
        compactness = 'Population Fatness'
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2", position: 'relative' }}>
                    <div className="d-flex flex-row justify-content-between text-white" style={{ position: 'relative', zIndex: "4" }}>
                        <p class="h6 d-inline-block back-btn" onClick={backToObjFunc}>Back</p>
                        <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Home</p>
                    </div>
                    <div className="text-white" align="center" style={{ paddingTop: "3rem", position: 'relative', zIndex: "4", marginBottom: '30px' }}>
                        <p class="h3">Analyze Results</p>
                    </div>
                    <div className="bg-primary results_banner">

                    </div>
                    <div className="d-flex flex-column justify-content-between py-4" style={{ height: "77%", width: "100%" }}>
                        <select id="districting-selection" class="form-select" onChange={userChoseDistricting}>
                            <option value="" defaultValue hidden>Select a districting</option>
                            <option value="1">Districting 1 - Obj. Value : 607</option>
                            <option value="2">Districting 2 - Obj. Value : 606</option>
                            <option value="3">Districting 3 - Obj. Value : 605</option>
                            <option>Districting 4 - Obj. Value : 604</option>
                            <option>Districting 5 - Obj. Value : 603</option>
                            <option>Districting 6 - Obj. Value : 602</option>
                            <option>Districting 7 - Obj. Value : 601</option>
                            <option>Districting 8 - Obj. Value : 600</option>
                            <option>Districting 9 - Obj. Value : 400</option>
                            <option>Districting 10 - Obj. Value : 2</option>
                        </select>

                        {showFilters ? (
                            <>
                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="split-counties-1">
                                        Show counties
                            </label>
                                    <input class="form-check-input" type="radio" value="" id="split-counties-1" checked={checks[0]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="dev-avg-2">
                                        Show deviation from average districting
                            </label>
                                    <input class="form-check-input" type="radio" value="" id="dev-avg-2" checked={checks[1]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="geo-compact-3">
                                        Show geometric compactness
                            </label>
                                    <input class="form-check-input" type="radio" value="" id="geo-compact-3" checked={checks[2]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="graph-compact-4">
                                        Show graph compactness
                            </label>
                                    <input class="form-check-input" type="radio" value="" id="graph-compact-4" checked={checks[3]} onChange={userChecked} />
                                </div>

                                <div class="form-check">
                                    <label class="form-check-label" htmlFor="pop-fat-5">
                                        Show population fatness
                            </label>
                                    <input class="form-check-input" type="radio" value="" id="pop-fat-5" checked={checks[4]} onChange={userChecked} />
                                </div>

                                <div>
                                    <button type="button" class="btn btn-lg col-12 btn-primary compareBtn" onClick={showComparison}>View enacted and selected</button>
                                </div>
                                <div>
                                    <button type="button" class="btn btn-lg col-12 btn-primary boxAndWhisker" onClick={showBoxAndWhisker}>View Box and Whisker plot</button>
                                </div>

                                <div>
                                    <button type="button" className="btn btn-lg col-12 btn-primary" onClick={resetChecks}>Reset</button>
                                </div>
                            </>
                        ) : ""}

                    </div>
                </div>
                <div id="right-bar" className="col-3 shadow-lg" style={{ backgroundColor: "#fff", zIndex: "2", height: "100%", position: 'relative' }}>
                    <div className="text-white" align="center" style={{ paddingTop: "5rem", position: 'relative', zIndex: "4", marginBottom:'50px'}}>
                        {showFilters ? (<p class="h4 d-inline-block" >Objective Function Value : 607</p>) : (
                            <p class="h4 d-inline-block" >Objective Function Value</p>
                        )}

                    </div>

                    <div className="bg-primary objective_banner">

                    </div>

                    <div className="d-flex flex-column justify-content-between" style={{ height: "75%" }}>
                        <div>
                            <table className='table table-bordered table-hover table-striped shadow-sm'>
                                <thead className='table-dark'>
                                    <tr>
                                        <th scope='col'>General</th>
                                        <th scope='col'>Weight</th>
                                        <th scope='col'>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Population:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.populationEquality}</td>
                                                <td>54</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }

                                    </tr>
                                    <tr>
                                        <th scope="row">Split Counties:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.splitCounties}</td>
                                                <td>69</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr></hr>

                        <div>
                            <table className='table table-bordered table-hover table-striped shadow-sm'>
                                <thead className='table-dark'>
                                    <tr>
                                        <th scope='col'>Deviation From</th>
                                        <th scope='col'>Weight</th>
                                        <th scope='col'>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Average Districting:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devAvgDist}</td>
                                                <td>72</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }

                                    </tr>
                                    <tr>
                                        <th scope="row">Enacted Districting (Geometric):</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devEnDistGeo}</td>
                                                <td>53</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }
                                    </tr>
                                    <tr>
                                        <th scope="row">Enacted Districting (Population):</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devEnDistPop}</td>
                                                <td>89</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }

                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr></hr>

                        <div>
                            <table className='table table-bordered table-hover table-striped shadow-sm'>
                                <thead className='table-dark'>
                                    <tr>
                                        <th scope='col'>Compactness</th>
                                        <th scope='col'>Weight</th>
                                        <th scope='col'>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Geometric:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devAvgDist}</td>
                                                <td>72</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }

                                    </tr>
                                    <tr>
                                        <th scope="row">Graph:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devEnDistGeo}</td>
                                                <td>53</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }
                                    </tr>
                                    <tr>
                                        <th scope="row">Population Fatness:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devEnDistPop}</td>
                                                <td>89</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }

                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr></hr>
                        <div>
                            <table className='table table-bordered table-hover table-striped shadow-sm'>
                                <thead className='table-dark'>
                                    <tr>
                                        <th scope='col'>Other</th>
                                        <th scope='col'>Weight</th>
                                        <th scope='col'>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Political fairness:</th>
                                        {showFilters ? (
                                            <>
                                                <td>{0.43}</td>
                                                <td>58</td>
                                            </>
                                        )
                                            :
                                            (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                            )
                                        }

                                    </tr>
                                </tbody>
                            </table>
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
                onClick={userClickedOnMap}
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
                            <p></p>
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

            {showBoxAndWhiskerPopup ? (
                <div className="boxAndWhiskerPopup">
                    <div style={OVERLAY_STYLES} />
                    <div className="container-fluid" align='center' style={MODAL_STYLES}>
                        {/* {children} */}
                        <div class="row d-flex flex-row justify-content-around align-items-center" style={{ height: "90%", width: "100%" }}>
                            <Plot
                                data={data}
                                layout={{
                                    width: 800,
                                    height: 500,
                                    title: "District Rankings",
                                    display: 'inline-block',
                                    xaxis: {
                                        title: {
                                            text: 'District Number',
                                            font: {
                                                family: 'Arial, Helvetica, sans-serif',
                                                size: 18,
                                                color: '#000'
                                            }
                                        },
                                    },
                                    yaxis: {
                                        title: {
                                            text: 'Percentage of Minority',
                                            font: {
                                                family: 'Arial, Helvetica, sans-serif',
                                                size: 18,
                                                color: '#000'
                                            }
                                        }
                                    }
                                }}
                            />

                        </div>
                        <button className="btn btn-secondary" onClick={() => setShowBoxAndWhiskerPopup(false)}>Close</button>
                    </div>
                </div>
            ) : ''}

        </div >
    )
}

export default Analysis;