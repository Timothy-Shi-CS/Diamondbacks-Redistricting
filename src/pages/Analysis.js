import React, { useState, useContext, useEffect } from "react";
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl";
import Plot from "react-plotly.js";
import RingLoader from "react-spinners/RingLoader";

import { StateContext } from "../contexts/StateContext";

const Analysis = () => {
    const { state, page, districts, objective, constraintsData, districtings } =
        useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page;
    const [stateDistricts, setStateDistricts] = districts;
    const [objValueParams, setObjValueParams] = objective;
    const [constraints, setConstraints] = constraintsData;
    const [districtingsData, setDistrictingsData] = districtings;
    const [loading, setLoading] = useState(false);

    const [districtingOBJ, setDistrictingOBJ] = useState(null);

    const [showFilters, setShowFilters] = useState(false);

    const [countyLayer, setCountyLayer] = useState("");
    const [precinctLayer, setPrecinctLayer] = useState("");

    const [showPopup, setShowPopup] = useState(false);
    const [popUpText, setPopUpText] = useState(null);
    const [popUpCoords, setPopUpCoords] = useState(null);

    const [view, setView] = useState("");
    const [bawData, setBAWData] = useState(null)
    const [majMin, setMajMin] = useState(null)
    let [checks, setChecks] = useState([false, false]);

    const [curDistricting, setCurDistricting] = useState("");
    const [curDistrictingNum, setCurDistrictingNum] = useState(null);

    const [districtNumbers, setDistrictNumbers] = useState(null);
    const [showComparisonPopup, setShowComparisonPopup] = useState(false);
    const [showBoxAndWhiskerPopup, setShowBoxAndWhiskerPopup] = useState(false);

    const [showDistrictData, setShowDistrictData] = useState(null)

    const dic = {
        "avg_geo": "Deviation From Average Geometric",
        "avg_pop": "Deviation From Average Population",
        "enacted_geo": "Deviation From Enacted Geometric",
        "enacted_pop": "Deviation From Enacted Population",
        "geo_compact": "Geometric Compactness",
        "graph_compact": "Graph Compactness",
        "pop_fat": "Population Fatness",
    }

    const [measure, setMeasure] = useState("")

    let measureValues = ""

    const [viewport, setViewport] = useState({
        //main map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0,
    });

    const [viewportEnacted, setViewportEnacted] = useState({
        //enacted map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0,
    });

    const [viewportDB, setViewportDB] = useState({
        //chosen districting map viewing settings
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0,
    });

    const OVERLAY_STYLES = {
        //background of comparison popup
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        zIndex: 1000,
    };

    const MODAL_STYLES = {
        //styling for display of comparing districtings
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        // backgroundColor: "rgba(255,255,255,1.0)",
        height: "100%",
        width: "100%",
        zIndex: 1000,
    };

    const [counties, setCounties] = useState(null)
    const [precincts, setPrecincts] = useState(null)
    // let counties=null
    // let precincts=''

    const [districtingData, setDistrictingData] = useState(null);


    const stateCoords = require("../data/stateCoords.json"); //load in dataset that contains geometry for each state. we'll use this to show the actual state as a default view.

    useEffect(() => {
        console.log(districtingData);
        const stateLayer = {
            //create a layer to hold the styling of state geometry
            id: "state-layer",
            type: "fill",
            source: "state",
            layout: {},
            paint: {
                "fill-color": "rgba(98, 201, 42, 0.15)",
                "fill-outline-color": "rgba(113, 191, 114, 0.3)",
            },
        };
        setCurDistricting(
            <Source
                id="state"
                type="geojson"
                data={stateFeature.feature} //use the saved stateFeature feature data for the source layer
            >
                <Layer {...stateLayer} />
            </Source>
        );
    }, []);

    const backToObjFunc = (e) => {
        e.preventDefault();
        setPageName("weights"); //go back to weights
    };

    const backToStateSelection = (e) => {
        e.preventDefault();
        let paramValues = {
            populationEquality: 0.62,
            splitCounties: 0.21,
            devAvgDist: 0.79,
            devEnDistGeo: 0.44,
            devEnDistPop: 0.97,
            compactness: {
                type: 0,
                value: 0.5,
            },
            efficiencyGap: 0.75,
        };
        setObjValueParams(paramValues); //reset the weights
        setPageName("state-selection"); //go back to state selection
    };

    const getMaxKey = (arr) => {
        let max = 0;
        for (let i = 0; i < arr.length; i++) {
            if (parseInt(arr[i]) > max) {
                max = arr[i];
            }
        }
        return max;
    };

    const convertCoordinates = (lon, lat) => {
        var x = (lon * 20037508.34) / 180;
        var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
        y = (y * 20037508.34) / 180;
        return [x, y];
    };

    const convertGeoJson = (data) => {
        for (let i = 0; i < data.features.length; i++) {
            for (let j = 0; j < data.features[i].geometry.coordinates.length; j++) {
                for (let k = 0; k < data.features[i].geometry.coordinates[j].length; k++) {
                    data.features[i].geometry.coordinates[j][k] = convertCoordinates(data.features[i].geometry.coordinates[j][k][0], data.features[i].geometry.coordinates[j][k][1])
                }
            }
        }
        return data
    }

    const userChecked = (e) => {
        //user clicked on one of the filters
        let tempChecks = [...checks];
        const index = parseInt(e.target.id.split("-")[2]); //get the index of the selected filter
        setShowPopup(false); //remove any popups
        if (checks[index - 1] === true) {
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
        setChecks([...tempChecks]);
        console.log(index);
    };

    const getDistrictColorsAndNumbers = (data) => {
        let distNums = [];
        let distColor = [];
        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members);

            if (
                data.features[i].properties.member[maxMember][
                    Object.keys(data.features[i].properties.member[maxMember])[0]
                ].party === "Republican"
            ) {
                distColor.push(`rgba(235, 64, 52,0.4)`);
            } else {
                distColor.push(`rgba(52, 122, 235,0.4)`);
            }
            console.log(members);
            console.log(maxMember);
        }

        return {
            distNums: distNums,
            distColor: distColor,
        };
    };

    const setMapWithDistrictsData = (data) => {
        console.log("here");
        setCurDistricting(
            //let the current districting be a new list of source and layer components corresponding to the data of each district.
            data.features.map((f, index) => {
                console.log(f["id"]);
                const f_data = {
                    //for the source component
                    type: f.type,
                    geometry: {
                        type: f.geometry.type,
                        coordinates: f.geometry.coordinates,
                    },
                };

                const f_layer = {
                    //for the layer component
                    id: `district_${index}_layer`, //uniquely identify each district layer by the district's index.
                    type: "fill",
                    source: `district_${index}`,
                    layout: {},
                    paint: {
                        "fill-color": `${stateDistricts.distColors[index]}`,
                        "fill-outline-color": "rgba(0,0,0,1.0)",
                    },
                };

                return (
                    <Source
                        id={`district_${index}`} //uniquely identify each district source by the district's index.
                        type="geojson"
                        data={f_data}
                        key={index}
                    >
                        <Layer {...f_layer} />
                    </Source>
                );
            })
        );
        setLoading(false)
    };

    const setDistrictMap = (data) => {
        console.log(data);
        // const districtsColorsAndNumbers = getDistrictColorsAndNumbers(data)
        // const distNums = districtsColorsAndNumbers.distNums
        // console.log(data);
        // console.log(distNums)
        // setDistrictNumbers([...distNums]); //save the list of district numbers
        setMapWithDistrictsData(data);
    };

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
                "fill-outline-color": "rgba(0,0,0,0.7)",
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

    const resetCurDistricting = () => {
        const stateLayer = {
            //styling used to reset the map
            id: "state-layer",
            type: "fill",
            source: "state",
            layout: {},
            paint: {
                "fill-color": "rgba(98, 201, 42, 0.15)",
                "fill-outline-color": "rgba(113, 191, 114, 0.3)",
            },
        };
        for (let i = 0; i < stateCoords.features.length; i++) {
            if (
                stateCoords.features[i].properties.name ===
                stateFeature.feature.properties.name
            ) {
                console.log(stateCoords.features[i]);
                setCurDistricting(
                    <Source id="state" type="geojson" data={stateCoords.features[i]}>
                        <Layer {...stateLayer} />
                    </Source>
                );
                break;
            }
        }
    };

    const userClickedOnMap = (e) => {
        //user clicked on one of the districts
        e.preventDefault();
        // console.log(e.features[0].source);
        let coords = [e.lngLat[0], e.lngLat[1]]; //get the coordinates of where the user clicked.
        if (e.features[0].source.includes("district")) {
            //make sure that the user actually clicked on one of the districts
            const index = parseInt(e.features[0].source.split("_")[1]); //get the index of that district
            const districtNumber = index + 1
            console.log(districtNumber)
            console.log(districtingOBJ)
            let requestObj = new XMLHttpRequest();
            requestObj.onreadystatechange = (res) => {
                let response = res.target;
                console.log(`http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/getDistrictData/districtingID=${"\"" + districtingOBJ.id + "\""}/districtID=${districtNumber}`)
                if (response.readyState == 4 && response.status == 200) {
                    let resp = JSON.parse(response.responseText)
                    for (let i = 1; i < resp.length; i++) {
                        resp[i] = parseFloat(resp[i])
                    }
                    console.log(resp)
                }
            };
            requestObj.open(
                "GET",
                `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/getDistrictData/districtingID=${"\"" + districtingOBJ.id + "\""}/districtID=${districtNumber}`,
                true
            );

            requestObj.send();
            // let requestObj2 = new XMLHttpRequest()
            // requestObj2.onreadystatechange=(res)=>{
            //     let response = res.target;
            //     console.log(JSON.parse(response.responseText))
            // }

            // requestObj2.open(
            //     "GET",
            //     ``
            // )
        } else if (e.features[0].source === "counties") {
            //if the user clicked on a county instead
            setShowPopup(true); //show popup
            e.features[0].properties.name
                ? setPopUpText(`${e.features[0].properties.name}`)
                : setPopUpText(`${e.features[0].properties.NAME}`); //set the text
            setPopUpCoords([...coords]); //set location of the popup
        } else {
            setShowPopup(false);
        }
    };

    const getUnstyledCurDistricting = () => {
        //get the unstyled current districting
        let data = districtingData[parseInt(curDistrictingNum) - 1];
        let distNums = [];
        let distColor = [];

        for (let i = 0; i < data.features.length; i++) {
            distNums.push(data.features[i].properties.district);
            const members = Object.keys(data.features[i].properties.member);
            const maxMember = getMaxKey(members);

            if (
                data.features[i].properties.member[maxMember][
                    Object.keys(data.features[i].properties.member[maxMember])[0]
                ].party === "Republican"
            ) {
                distColor.push(`rgba(235, 64, 52,0.4)`);
            } else {
                distColor.push(`rgba(52, 122, 235,0.4)`);
            }
            console.log(members);
            console.log(maxMember);
        }
        console.log(data);
        console.log(distNums);
        //setDistrictNumbers([...distNums]);
        return data.features.map((f, index) => {
            const f_data = {
                type: f.type,
                geometry: {
                    type: f.geometry.type,
                    coordinates: f.geometry.coordinates,
                },
            };

            const f_layer = {
                id: `district_${index}_layer`,
                type: "fill",
                source: `district_${index}`,
                layout: {},
                paint: {
                    "fill-color": `${distColor[index]}`,
                    "fill-outline-color": "rgba(255,255,255,1.0)",
                },
            };

            return (
                <Source
                    id={`district_${index}`}
                    type="geojson"
                    data={f_data}
                    key={index}
                >
                    <Layer {...f_layer} />
                </Source>
            );
        });
    };

    const setPlot = (data) => {
        let boxAndWhisker = [];
        let bawPart = data[2];
        let x = []
        const keys = Object.keys(bawPart)
        console.log(bawPart)
        for (let i = 0; i < keys.length; i++) {
            boxAndWhisker.push(
                {
                    name: `District ${i + 1}`,
                    y: bawPart[i],
                    boxpoints: false,
                    type: "box",
                    marker: {
                        color: '#3D9970',
                    },
                    showlegend: false,
                }
            )
            x.push(`District ${i + 1}`)
        }
        boxAndWhisker.push({
            name: "Enacted",
            mode: "markers",
            x: x,
            y: Object.values(data[1]),
            type: "scatter",
            showlegend: true,
            marker: { color: "red" }
        })

        boxAndWhisker.push({
            name: "Current",
            mode: "markers",
            x: x,
            y: Object.values(data[0]),
            type: "scatter",
            showlegend: true,
            marker: { color: "blue" }
        })
        setBAWData(boxAndWhisker);
        console.log(boxAndWhisker);
        setShowBoxAndWhiskerPopup(true);
    }

    const showBoxAndWhisker = (e) => {
        e.preventDefault();
        let requestObj = new XMLHttpRequest();
        requestObj.onreadystatechange = (res) => {
            let response = res.target;
            if (response.readyState == 4 && response.status == 200) {

                console.log(response.responseText)
            }
        };
        requestObj.open(
            "GET",
            `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/getBAW`,
            true
        );
        requestObj.send();
    };

    const districtingClicked = (districtingsData) => {
        setLoading(true)
        let filepath = `C:/Users/jimmy_lin/Desktop/new_az/${stateFeature.jobs[stateFeature.job].id
            }/${districtingsData.id}`;
        console.log(filepath);
        let statename = stateFeature.feature.properties.name.toLowerCase();
        console.log(statename);
        //
        //stateFeature.jobs[stateFeature.job].id
        let requestObj = new XMLHttpRequest();
        requestObj.onreadystatechange = (res) => {
            let response = res.target;
            if (response.readyState == 4 && response.status == 200) {
                // console.log(response.responseText);
                let dat = JSON.parse(response.responseText);
                // console.log(dat)
                // setDistrictingData(JSON.parse(response.responseText));
                setDistrictMap(dat);
            }
        };
        requestObj.open(
            "GET",
            `http://127.0.0.1:5000/${statename}?districtingID=${filepath}`,
            true
        );
        requestObj.send();

        let requestObj1 = new XMLHttpRequest();
        requestObj1.onreadystatechange = (res) => {
            let response = res.target;
            if (response.readyState == 4 && response.status == 200) {
                setMajMin(response.responseText)
                console.log(response.responseText);
            }
        }
        requestObj1.open(
            "GET",
            `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/setDistricting/districtingID=${districtingsData.id}`,
            true
        )
        requestObj1.send()

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
        setDistrictingOBJ(districtingsData);
    };

    const infoClicked = (measure) => {
        if (curDistrictingNum) {
            console.log(curDistrictingNum)
            console.log(measure)

            setMeasure(measure)
            let requestObj1 = new XMLHttpRequest();
            requestObj1.onreadystatechange = (res) => {
                let response = res.target;
                if (response.readyState == 4 && response.status == 200) {
                    console.log(JSON.parse(response.responseText))
                    measureValues = (JSON.parse(response.responseText))
                    // let values=Object.values(measureValues)
                    // console.log(typeof(values))
                    // console.log(values)
                    setShowDistrictData(
                        (<div className="districtPopup">
                            <div style={OVERLAY_STYLES} />
                            <div className="container-fluid" align="center" style={MODAL_STYLES}>
                                {/* {children} */}
                                <div
                                    class="row d-flex flex-row justify-content-center align-items-center"
                                    style={{ height: "90%", width: "40%" }}
                                >
                                    {/* {measureValues} */}
                                    <table className="table table-bordered table-hover table-striped shadow-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col">District #</th>
                                                <th scope="col">{dic[measure]}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {measureValues.map((measure, index) => {
                                                return (
                                                    <tr className="table-light">
                                                        <th scope="row">District {index + 1}</th>
                                                        <td>{measure}</td>
                                                    </tr>)
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDistrictData(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>))
                    console.log('here')
                }
            }
            requestObj1.open(
                "GET",
                `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/getDistrictMeasures/measureType=${measure}`,
                true
            )
            requestObj1.send()
        }

    }

    let render = "";

    if (stateDistricts) {
        render = stateDistricts.features.map((f, index) => {
            const f_data = {
                type: f.type,
                geometry: {
                    type: f.geometry.type,
                    coordinates: f.geometry.coordinates,
                },
            };

            const f_layer = {
                id: `district_${stateDistricts.distNums[index]}_layer`,
                type: "fill",
                source: `district_${stateDistricts.distNums[index]}`,
                layout: {},
                paint: {
                    "fill-color": stateDistricts.distColors[index],
                    "fill-outline-color": "rgba(255,255,255,1.0)",
                },
            };

            return (
                <Source
                    id={`district_${stateDistricts.distNums[index]}`}
                    type="geojson"
                    data={f_data}
                    key={index}
                >
                    <Layer {...f_layer} />
                </Source>
            );
        });
    }

    let race = ""
    if (constraints.majorityMinorityConstraint.type === 0) {
        race = "Asians"
    } else if (constraints.majorityMinorityConstraint.type === 1) {
        race = "African Americans"
    } else {
        race = "Hispanics"
    }

    return (
        <div
            className="container-fluid"
            style={{ height: "100vh", width: "100vw", position: "relative" }}
        >
            <div
                className="row d-flex justify-content-between"
                style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    top: "0",
                }}
            >
                <div
                    id="left-bar"
                    className="col-3 shadow-lg"
                    style={{ backgroundColor: "#fff", zIndex: "2", position: "relative" }}
                >
                    <div
                        className="d-flex flex-row justify-content-between text-white"
                        style={{ position: "relative", zIndex: "4" }}
                    >
                        <p class="h6 d-inline-block back-btn" onClick={backToObjFunc}>
                            Back
            </p>
                        <p
                            class="h6 d-inline-block back-btn"
                            onClick={backToStateSelection}
                        >
                            Home
            </p>
                    </div>
                    <div
                        className="text-white"
                        align="center"
                        style={{
                            paddingTop: "3rem",
                            position: "relative",
                            zIndex: "4",
                            marginBottom: "30px",
                        }}
                    >
                        <p class="h3">Analyze Results</p>
                    </div>
                    <div className="bg-primary results_banner">
                        <div
                            className="progress"
                            style={{
                                height: "11px",
                                zIndex: "10",
                                position: "relative",
                                marginTop: "30px",
                                width: "94%",
                                marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        >
                            <div
                                className="progress-bar progress-bar-striped bg-success progress-bar-animated shadow"
                                role="progressbar"
                                aria-valuenow="10"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ width: "100%" }}
                            >
                                100%
              </div>
                        </div>
                    </div>
                    <div
                        className="d-flex flex-column justify-content-around py-4"
                        style={{ height: "77%", width: "100%" }}
                    >
                        <div className="row d-flex justify-content-around" style={{ width: "100%" }}>
                            <div class="col form-check" style={{ marginLeft: "70px" }}>
                                <label class="form-check-label" htmlFor="split-counties-1">
                                    Show counties
                                    </label>
                                <input class="form-check-input" type="checkbox" value="" id="split-counties-1" checked={checks[0]} onChange={userChecked} />
                            </div>

                            <div class="col form-check">
                                <label class="form-check-label" htmlFor="dev-avg-2">
                                    Show precincts
                                    </label>
                                <input class="form-check-input" type="checkbox" value="" id="dev-avg-2" checked={checks[1]} onChange={userChecked} />
                            </div>
                        </div>
                        <div>
                            <button type="button" class="btn btn-lg col-12 btn-primary boxAndWhisker" disabled>View Box and Whisker plot</button>
                        </div>

                        <div style={{ overflow: "auto", height: "600px" }}>
                            <div style={{ width: "100%" }}>
                                <nav
                                    className="navbar navbar-dark bg-dark navbar-expand-lg text-light "
                                    style={{ height: "30px", justifyContent: "center" }}
                                >
                                    {" "}
                  Top 10 Districtings
                </nav>
                                <div
                                    className="row d-flex justify-content-between align-items-center"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <div className="col">
                                        {curDistrictingNum===0?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[0]);
                                                setCurDistrictingNum(0);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 1:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[0].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[0]);
                                                setCurDistrictingNum(0);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 1:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[0].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    <div className="col">
                                        {curDistrictingNum===1?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[1]);
                                                setCurDistrictingNum(1);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 2:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[1].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[1]);
                                                setCurDistrictingNum(1);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 2:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[1].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="row d-flex justify-content-center align-items-center"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <div className="col">
                                        {curDistrictingNum===2?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[2]);
                                                setCurDistrictingNum(2);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 3:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[2].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[2]);
                                                setCurDistrictingNum(2);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 3:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[2].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    <div className="col">
                                        {curDistrictingNum===3?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[3]);
                                                setCurDistrictingNum(3);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 4:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[3].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[3]);
                                                setCurDistrictingNum(3);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 4:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[3].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="row d-flex justify-content-center align-items-center"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <div className="col">
                                        {curDistrictingNum===4?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[4]);
                                                setCurDistrictingNum(4);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 5:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[4].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[4]);
                                                setCurDistrictingNum(4);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 5:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[4].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    <div className="col">
                                        {curDistrictingNum===5?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[5]);
                                                setCurDistrictingNum(5);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 6:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[5].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[5]);
                                                setCurDistrictingNum(5);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 6:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[5].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="row d-flex justify-content-center align-items-center"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <div className="col">
                                        {curDistrictingNum===6?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[6]);
                                                setCurDistrictingNum(6);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 7:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[6].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[6]);
                                                setCurDistrictingNum(6);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 7:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[6].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    <div className="col">
                                        {curDistrictingNum===7?(
                                            <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[7]);
                                                setCurDistrictingNum(7);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 8:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[7].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        ):(
                                            <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[7]);
                                                setCurDistrictingNum(7);
                                            }}
                                        >
                                            <h5 class="card-header">Rank 8:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[7].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                        )}
                                    </div>

                                </div>


                                <div
                                    className="row d-flex justify-content-center align-items-center"
                                    style={{ paddingTop: "10px", paddingBottom: "10px" }}
                                >
                                    <div className="col">
                                        {curDistrictingNum === 8 ? (
                                            <div
                                                class="card districting border border-primary border-5"
                                                onClick={() => {
                                                    districtingClicked(districtingsData[8]);
                                                    setCurDistrictingNum(8);
                                                }}
                                            >
                                                <h5 class="card-header">Rank 9:</h5>
                                                <div class="card-body">
                                                    <h6 class="card-title">Objective Value:</h6>
                                                    <p class="card-text">
                                                        {districtingsData[8].overallObjectiveValueScore}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                class="card districting"
                                                onClick={() => {
                                                    districtingClicked(districtingsData[8]);
                                                    setCurDistrictingNum(8);
                                                }}
                                            >
                                                <h5 class="card-header">Rank 9:</h5>
                                                <div class="card-body">
                                                    <h6 class="card-title">Objective Value:</h6>
                                                    <p class="card-text">
                                                        {districtingsData[8].overallObjectiveValueScore}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col">
                                        {curDistrictingNum === 9 ? (
                                            <div
                                                class="card districting border border-primary border-5"
                                                onClick={() => {
                                                    districtingClicked(districtingsData[9]);
                                                    setCurDistrictingNum(9);
                                                }}
                                            >
                                                <h5 class="card-header">Rank 10:</h5>
                                                <div class="card-body">
                                                    <h6 class="card-title">Objective Value:</h6>
                                                    <p class="card-text">
                                                        {districtingsData[9].overallObjectiveValueScore}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                class="card districting"
                                                onClick={() => {
                                                    districtingClicked(districtingsData[9]);
                                                    setCurDistrictingNum(9);
                                                }}
                                            >
                                                <h5 class="card-header">Rank 10:</h5>
                                                <div class="card-body">
                                                    <h6 class="card-title">Objective Value:</h6>
                                                    <p class="card-text">
                                                        {districtingsData[9].overallObjectiveValueScore}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <nav
                                className="navbar navbar-dark bg-dark navbar-expand-lg text-light "
                                style={{ height: "30px", justifyContent: "center" }}
                            >
                                {" "}
                Deviation From Enacted
              </nav>
                            <div
                                className="row d-flex justify-content-center align-items-center"
                                style={{ paddingTop: "10px", paddingBottom: "10px" }}
                            >
                                <div className="col">
                                    {curDistrictingNum === 10 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[10]);
                                            setCurDistrictingNum(10);
                                        }}
                                    >
                                        <h5 class="card-header">Population:</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[10].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (
                                        <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[10]);
                                                setCurDistrictingNum(10);
                                            }}
                                        >
                                            <h5 class="card-header">Population:</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[10].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col">
                                    {curDistrictingNum === 11 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[11]);
                                            setCurDistrictingNum(11);
                                        }}
                                    >
                                        <h5 class="card-header">Geometric:</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[11].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (<div
                                        class="card districting"
                                        onClick={() => {
                                            districtingClicked(districtingsData[11]);
                                            setCurDistrictingNum(11);
                                        }}
                                    >
                                        <h5 class="card-header">Geometric:</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[11].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                            <nav
                                className="navbar navbar-dark bg-dark navbar-expand-lg text-light "
                                style={{ height: "30px", justifyContent: "center" }}
                            >
                                {" "}
                Very Different Area-Pair Deviations
              </nav>
                            <div
                                className="row d-flex justify-content-center align-items-center"
                                style={{ paddingTop: "10px", paddingBottom: "10px" }}
                            >
                                <div className="col">
                                    {curDistrictingNum === 12 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[12]);
                                            setCurDistrictingNum(12);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 1(A):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[12].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (<div
                                        class="card districting"
                                        onClick={() => {
                                            districtingClicked(districtingsData[12]);
                                            setCurDistrictingNum(12);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 1(A):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[12].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>)}
                                </div>
                                <div className="col">
                                    {curDistrictingNum === 21 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[21]);
                                            setCurDistrictingNum(21);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 1(B):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[21].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (<div
                                        class="card districting"
                                        onClick={() => {
                                            districtingClicked(districtingsData[21]);
                                            setCurDistrictingNum(21);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 1(B):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[21].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                            <hr></hr>
                            <div
                                className="row d-flex justify-content-center align-items-center"
                                style={{ paddingTop: "10px", paddingBottom: "10px" }}
                            >
                                <div className="col">
                                    {curDistrictingNum === 13 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[13]);
                                            setCurDistrictingNum(13);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 2(A):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[13].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (
                                        <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[13]);
                                                setCurDistrictingNum(13);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 2(A):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[13].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col">
                                    {curDistrictingNum === 20 ? (
                                        <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[20]);
                                                setCurDistrictingNum(20);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 2(B):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[20].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[20]);
                                                setCurDistrictingNum(20);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 2(B):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[20].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <hr></hr>
                            <div
                                className="row d-flex justify-content-center align-items-center"
                                style={{ paddingTop: "10px", paddingBottom: "10px" }}
                            >
                                <div className="col">
                                    {curDistrictingNum === 14 ? (
                                        <div
                                            class="card districting border border-primary border-5"
                                            onClick={() => {
                                                districtingClicked(districtingsData[14]);
                                                setCurDistrictingNum(14);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 3(A):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[14].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[14]);
                                                setCurDistrictingNum(14);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 3(A):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[14].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col">
                                    {curDistrictingNum === 19 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[19]);
                                            setCurDistrictingNum(19);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 3(B):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[19].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (
                                        <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[19]);
                                                setCurDistrictingNum(19);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 3(B):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[19].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <hr></hr>
                            <div
                                className="row d-flex justify-content-center align-items-center"
                                style={{ paddingTop: "10px", paddingBottom: "10px" }}
                            >
                                <div className="col">
                                    {curDistrictingNum === 15 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[15]);
                                            setCurDistrictingNum(15);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 4(A):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[15].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (<div
                                        class="card districting"
                                        onClick={() => {
                                            districtingClicked(districtingsData[15]);
                                            setCurDistrictingNum(15);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 4(A):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[15].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>)}
                                </div>
                                <div className="col">
                                    {curDistrictingNum === 18 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[18]);
                                            setCurDistrictingNum(18);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 4(B):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[18].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (<div
                                        class="card districting"
                                        onClick={() => {
                                            districtingClicked(districtingsData[18]);
                                            setCurDistrictingNum(18);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 4(B):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[18].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                            <hr></hr>
                            <div
                                className="row d-flex justify-content-center align-items-center"
                                style={{ paddingTop: "10px", paddingBottom: "10px" }}
                            >
                                <div className="col">
                                    {curDistrictingNum === 16 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[16]);
                                            setCurDistrictingNum(16);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 5(A):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[16].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) :
                                        (<div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[16]);
                                                setCurDistrictingNum(16);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 5(A):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[16].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>)}

                                </div>
                                <div className="col">
                                    {curDistrictingNum === 17 ? (<div
                                        class="card districting border border-primary border-5"
                                        onClick={() => {
                                            districtingClicked(districtingsData[17]);
                                            setCurDistrictingNum(17);
                                        }}
                                    >
                                        <h5 class="card-header">Pair 5(B):</h5>
                                        <div class="card-body">
                                            <h6 class="card-title">Objective Value:</h6>
                                            <p class="card-text">
                                                {districtingsData[17].overallObjectiveValueScore}
                                            </p>
                                        </div>
                                    </div>) : (
                                        <div
                                            class="card districting"
                                            onClick={() => {
                                                districtingClicked(districtingsData[17]);
                                                setCurDistrictingNum(17);
                                            }}
                                        >
                                            <h5 class="card-header">Pair 5(B):</h5>
                                            <div class="card-body">
                                                <h6 class="card-title">Objective Value:</h6>
                                                <p class="card-text">
                                                    {districtingsData[17].overallObjectiveValueScore}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
                <div
                    id="right-bar"
                    className="col-3 shadow-lg"
                    style={{
                        backgroundColor: "#fff",
                        zIndex: "2",
                        height: "100%",
                        position: "relative",
                    }}
                >
                    <div
                        className="text-white"
                        align="center"
                        style={{
                            paddingTop: "5rem",
                            position: "relative",
                            zIndex: "4",
                            marginBottom: "50px",
                        }}
                    >
                        {districtingOBJ ? (
                            <p class="h4 d-inline-block">Objective Function Value : {districtingOBJ.overallObjectiveValueScore}</p>
                        ) : (
                            <p class="h4 d-inline-block">Objective Function Value</p>
                        )}
                    </div>

                    <div className="bg-primary objective_banner"></div>

                    <div
                        className="d-flex flex-column justify-content-between"
                        style={{ height: "75%" }}
                    >
                        <div>
                            <table className="table table-bordered table-hover table-striped shadow-sm">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">General</th>
                                        <th scope="col">Weight</th>
                                        <th scope="col">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Population:</th>

                                        <td>{objValueParams.populationEquality}</td>
                                        {districtingOBJ ? (
                                            <td>
                                                {districtingOBJ.measures.TOT_POP_EQU.measureScore}
                                            </td>
                                        ) : (
                                            <td></td>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">Split Counties:</th>
                                        {showFilters ? (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">Majority Minority Districts:</th>
                                        {majMin ? (
                                            <>
                                                <td>NA</td>
                                                <td>{majMin}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr></hr>

                        <div>
                            <table className="table table-bordered table-hover table-striped shadow-sm">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Deviation From</th>
                                        <th scope="col">Weight</th>
                                        <th scope="col">Value</th>
                                        <th scope="col">Normalized</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("avg_geo") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Average (Geo.)
                                        </th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devAvgDistGeo}</td>
                                                <td>72</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{objValueParams.devAvgDistGeo}</td>
                                                {districtingOBJ ? (
                                                    <>
                                                        <td>
                                                            {districtingOBJ.measures.DEV_AVERAGE_GEO.measureScore.toPrecision(
                                                                3
                                                            )}
                                                        </td>
                                                        <td>
                                                            {(1 / (1 + Math.exp(Math.pow(-10, -25) * districtingOBJ.measures.DEV_AVERAGE_GEO.measureScore))).toPrecision(5)}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td></td>
                                                        <td></td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("avg_pop") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Average (Pop.)
                                        </th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devAvgDistPop}</td>
                                                <td>72</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{objValueParams.devAvgDistPop}</td>
                                                {districtingOBJ ? (<>
                                                    <td>
                                                        {districtingOBJ.measures.DEV_AVERAGE_POP.measureScore.toPrecision(
                                                            3
                                                        )}
                                                    </td>
                                                    <td>
                                                        {(1 / (1 + Math.exp(Math.pow(-10, -10) * districtingOBJ.measures.DEV_AVERAGE_POP.measureScore))).toPrecision(5)}
                                                    </td>
                                                </>
                                                ) : (
                                                    <>
                                                        <td></td>
                                                        <td></td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("enacted_geo") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Enacted (Geo.)
                                        </th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devEnDistGeo}</td>
                                                <td>53</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{objValueParams.devEnDistGeo}</td>
                                                {districtingOBJ ? (
                                                    <>
                                                        <td>
                                                            {districtingOBJ.measures.DEV_ENACTED_GEO.measureScore.toPrecision(
                                                                3
                                                            )}
                                                        </td>
                                                        <td>
                                                            {(1 / (1 + Math.exp(Math.pow(-10, -25) * districtingOBJ.measures.DEV_ENACTED_GEO.measureScore))).toPrecision(5)}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td></td>
                                                        <td></td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("enacted_pop") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Enacted (Pop.)
                                        </th>
                                        {showFilters ? (
                                            <>
                                                <td>{objValueParams.devEnDistPop}</td>
                                                <td>89</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{objValueParams.devEnDistPop}</td>
                                                {districtingOBJ ? (
                                                    <>
                                                        <td>
                                                            {districtingOBJ.measures.DEV_ENACTED_POP.measureScore.toPrecision(
                                                                3
                                                            )}
                                                        </td>
                                                        <td>
                                                            {(1 / (1 + Math.exp(Math.pow(-10, -10) * districtingOBJ.measures.DEV_ENACTED_POP.measureScore))).toPrecision(5)}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td></td>
                                                        <td></td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr></hr>

                        <div>
                            <table className="table table-bordered table-hover table-striped shadow-sm">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Compactness</th>
                                        <th scope="col">Weight</th>
                                        <th scope="col">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("geo_compact") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Geometric
                                        </th>
                                        {objValueParams.compactness.type === 0 ? (
                                            <>
                                                <td>{objValueParams.compactness.value}</td>
                                                {districtingOBJ ? (
                                                    <td>
                                                        {districtingOBJ.measures.GEOMETRIC_COMPACTNESS.measureScore.toPrecision(
                                                            7
                                                        )}
                                                    </td>
                                                ) : (
                                                    <td></td>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("graph_compact") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Graph
                                        </th>
                                        {objValueParams.compactness.type === 1 ? (
                                            <>
                                                <td>{objValueParams.compactness.value}</td>
                                                {districtingOBJ ? (
                                                    <td>
                                                        {districtingOBJ.measures.GRAPH_COMPACTNESS.measureScore.toPrecision(
                                                            7
                                                        )}
                                                    </td>
                                                ) : (
                                                    <td></td>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle info-circle" viewBox="0 0 16 16" onClick={() => { infoClicked("pop_fat") }}>
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                            </svg>
                                            {" "}
                                            Population Fatness
                                        </th>
                                        {objValueParams.compactness.type === 2 ? (
                                            <>
                                                <td>{objValueParams.compactness.value}</td>
                                                {districtingOBJ ? (
                                                    <td>
                                                        {districtingOBJ.measures.POPULATION_FATNESS.measureScore.toPrecision(
                                                            7
                                                        )}
                                                    </td>
                                                ) : (
                                                    <td></td>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr></hr>
                        <div>
                            <table className="table table-bordered table-hover table-striped shadow-sm">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Other</th>
                                        <th scope="col">Weight</th>
                                        <th scope="col">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Political fairness:</th>
                                        {showFilters ? (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>NA</td>
                                                <td>NA</td>
                                            </>
                                        )}
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
                mapboxApiAccessToken={
                    "pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"
                }
                onClick={userClickedOnMap}
            >
                {countyLayer}
                {precinctLayer}
                {curDistricting}

                {/* {showPopup && popUpText && popUpCoords ? (
                    <Popup
                        latitude={popUpCoords[1]}
                        longitude={popUpCoords[0]}
                        onClose={() => {
                            setShowPopup(false);
                        }}
                    >
                        <div class="px-2">
                            <h5>{popUpText}</h5>
                            <p></p>
                        </div>
                    </Popup>
                ) : (
                    ""
                )} */}
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

            {showComparisonPopup ? (
                <div className="comparisonPopup">
                    <div style={OVERLAY_STYLES} />
                    <div className="container-fluid" align="center" style={MODAL_STYLES}>
                        {/* {children} */}
                        <div
                            class="row d-flex flex-row justify-content-around align-items-center"
                            style={{ height: "90%", width: "100%" }}
                        >
                            <div
                                class="col-5"
                                style={{
                                    backgroundColor: "rgba(255,255,255,1.0)",
                                    height: "65%",
                                }}
                            >
                                <ReactMapGL
                                    {...viewportEnacted}
                                    width="100%"
                                    height="100%"
                                    onViewportChange={setViewportEnacted}
                                    mapboxApiAccessToken={
                                        "pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"
                                    }
                                >
                                    {render}
                                </ReactMapGL>
                                <h3 className="my-3" style={{ color: "rgba(255,255,255,1.0)" }}>
                                    <em>Enacted</em>
                                </h3>
                            </div>
                            <div
                                class="col-5"
                                style={{
                                    backgroundColor: "rgba(255,255,255,1.0)",
                                    height: "65%",
                                }}
                            >
                                <ReactMapGL
                                    {...viewportDB}
                                    width="100%"
                                    height="100%"
                                    onViewportChange={setViewportDB}
                                    mapboxApiAccessToken={
                                        "pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"
                                    }
                                >
                                    {getUnstyledCurDistricting()}
                                </ReactMapGL>
                                <h3
                                    className="my-3 "
                                    style={{ color: "rgba(255,255,255,1.0)" }}
                                >
                                    {" "}
                                    <em>Districting {curDistrictingNum}</em>
                                </h3>
                            </div>
                        </div>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowComparisonPopup(false)}
                        >
                            Close
            </button>
                    </div>
                </div>
            ) : (
                ""
            )}

            {showBoxAndWhiskerPopup ? (
                <div className="boxAndWhiskerPopup">
                    <div style={OVERLAY_STYLES} />
                    <div className="container-fluid" align="center" style={MODAL_STYLES}>
                        {/* {children} */}
                        <div
                            class="row d-flex flex-row justify-content-around align-items-center"
                            style={{ height: "90%", width: "100%" }}
                        >
                            <Plot
                                data={bawData}
                                layout={{
                                    width: 900,
                                    height: 700,
                                    title: `Distribution of ${race}`,
                                    display: "inline-block",
                                    xaxis: {
                                        title: {
                                            text: "Indexed Districts",
                                            font: {
                                                family: "Arial, Helvetica, sans-serif",
                                                size: 18,
                                                color: "#000",
                                            },
                                        },
                                    },
                                    yaxis: {
                                        title: {
                                            text: `Percentage of ${race}`,
                                            font: {
                                                family: "Arial, Helvetica, sans-serif",
                                                size: 18,
                                                color: "#000",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowBoxAndWhiskerPopup(false)}
                        >
                            Close
            </button>
                    </div>
                </div>
            ) : (
                ""
            )}

            {showDistrictData}
        </div>
    );
};

export default Analysis;
