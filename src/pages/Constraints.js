import React, { useState, useContext, useEffect } from "react";
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl";
import RingLoader from "react-spinners/RingLoader";

import { StateContext } from "../contexts/StateContext";

const Constraints = () => {
  const { state, page, districts, constraintsData } = useContext(StateContext);
  const [stateFeature, setStateFeature] = state;
  const [pageName, setPageName] = page;
  const [stateDistricts, setStateDistricts] = districts;
  const [constraints, setConstraints] = constraintsData;
  const [loading, setLoading] = useState(false);

  const [popUpText, setPopUpText] = useState("");
  const [popUpCoords, setPopUpCoords] = useState(null);
  const [showIncumbents, setShowIncumbents] = useState(false);
  const [checkPopulation, setCheckPopulation] = useState([false, false, false]);

  const [countyLayer, setCountyLayer] = useState("");
  const [precinctLayer, setPrecinctLayer] = useState("");
  let [checks, setChecks] = useState([false, false]);

  const [counties, setCounties] = useState(null)
  const [precincts, setPrecincts] = useState(null)

  const [checkCompactness, setCheckCompactness] = useState([
    false,
    false,
    false,
  ]);
  const [checkMinority, setCheckMinority] = useState([false, false, false]);

  const minorityMap = {
    0: 'asian',
    1: 'black',
    2: 'hispanic'
  }

  const [viewport, setViewport] = useState({
    //map viewing settings
    latitude: parseFloat(stateFeature.stateCenter[0]),
    longitude: parseFloat(stateFeature.stateCenter[1]),
    zoom: 6,
    bearing: 0,
    pitch: 0,
  });

  const MODAL_STYLES = {
    //incumbent display styling
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    backgroundColor: "rgba(255,255,255,1.0)",
    zIndex: 1000,
    width: "40%",
    height: "70%",
  };

  const OVERLAY_STYLES = {
    //darken the background behind the incumbent popup
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 1000,
  };

  const enactedDistricts = require("../data/districts114.json");

  useEffect(() => {
    let statename = stateFeature.feature.properties.name.toLowerCase();
    console.log(statename);
    console.log(stateDistricts);
    console.log(stateFeature)
    console.log(constraints.incumbents)

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

    if (stateDistricts === null) {
      //if the districts for the enacted districting weren't loaded in before, load them in now
      let coordHolder = {
        //set up the map that will hold all this data
        type: "FeatureCollection",
        features: [],
        distNums: [],
        distColors: [],
      };
      let districts = []; //this will hold the numbers for each district
      let colors = []; //this will hold the colors(randomly generated) for each district
      const features = enactedDistricts.features;
      for (var i = 0; i < features.length; i++) {
        if (
          features[i].properties.STATENAME ===
          stateFeature.feature.properties.name
        ) {
          //get only the data for the selected state
          coordHolder.features.push({
            //set data in our map we made earlier
            type: features[i].type,
            geometry: {
              type: features[i].geometry.type,
              coordinates: features[i].geometry.coordinates,
            },
            properties: features[i].properties,
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
    let tempCheckPopulation = checkPopulation;
    tempCheckPopulation[[constraints.populationConstraint.type]] = true;
    setCheckPopulation(tempCheckPopulation);

    let tempCheckCompactness = checkCompactness;
    tempCheckCompactness[[constraints.compactnessConstraint.type]] = true;
    setCheckCompactness(tempCheckCompactness);

    let tempCheckMinority = checkMinority;
    tempCheckMinority[[constraints.majorityMinorityConstraint.type]] = true;
    setCheckMinority(tempCheckMinority);
  }, []);

  const openIncumbentPopup = (e) => {
    e.preventDefault();
    setShowIncumbents(true);
  };

  const saveEverything = (e) => {
    setLoading(true)
    e.preventDefault();
    const popFat = constraints.compactnessConstraint.type === 2 ? constraints.compactnessConstraint.value : -1
    const graph = constraints.compactnessConstraint.type === 1 ? constraints.compactnessConstraint.value : -1
    const geo = constraints.compactnessConstraint.type === 0 ? constraints.compactnessConstraint.value : -1

    const pop = constraints.populationConstraint.type === 0 ? constraints.populationConstraint.value : -1;
    const vap = constraints.populationConstraint.type === 1 ? constraints.populationConstraint.value : -1;
    const cvap = constraints.populationConstraint.type === 2 ? constraints.populationConstraint.value : -1;

    let protectedIncumb = []
    for (let i = 0; i < constraints.incumbents.length; i++) {
      if (constraints.incumbentsChecked[i]) {
        protectedIncumb.push(constraints.incumbents[i].incumbentID)
      }
    }

    let minorityIndex = checkMinority.indexOf(true);
    let requestObj = new XMLHttpRequest();
    let link = `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/construct-constraint/job=${stateFeature.jobs[stateFeature.job].id}&minority=${minorityMap[minorityIndex]}&threshold=${constraints.threshold}&majMin=${constraints.majorityMinorityConstraint.value}&incumbent={${protectedIncumb.join()}}&pop=${pop}&vap=${vap}&cvap=${cvap}&geoComp=${geo}&graphComp=${graph}&popFat=${popFat}`
    requestObj.onreadystatechange = (res) => {
      let response = res.target;
      if (response.readyState == 4 && response.status == 200) {
        console.log(response.responseText)
        console.log(link)
        setStateFeature((prevStateFeature) => {
          return {
            ...prevStateFeature,
            remainingJobs: response.responseText
          }
        })
        setLoading(false)
        setPageName("weights"); //move on to next page
      }
    };
    requestObj.open(
      "GET",
      `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/construct-constraint/job=${stateFeature.jobs[stateFeature.job].id}&minority=${minorityMap[minorityIndex]}&threshold=${constraints.threshold}&majMin=${constraints.majorityMinorityConstraint.value}&incumbent={${protectedIncumb.join()}}&pop=${pop}&vap=${vap}&cvap=${cvap}&geoComp=${geo}&graphComp=${graph}&popFat=${popFat}`,
      true
    );
    requestObj.send();

  };

  const backToStateSelection = (e) => {
    console.log("back to state selection");
    resetChecks(); //reset any incumbents user protected

    setConstraints({
      //reset constraint value and choice
      populationConstraint: {
        value: 0.02,
        type: 0,
      },
      compactnessConstraint: {
        value: 0.5,
        type: 0,
      },
      majorityMinorityConstraint: {
        value: 2,
        type: 0,
      },
      incumbents: [],
    });

    setPageName("state-selection"); //go back to state selection
  };

  const userCheckedFilters = (e) => {
    let tempChecks = [...checks];
    const index = parseInt(e.target.id.split("-")[2]); //get the index of the selected filter

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

  const userChecked = (e) => {
    let index = parseInt(e.target.id.split("t")[1]); //get index of incumbent in list
    let tempChecks = [...constraints.incumbentsChecked]; //get the list of checks
    tempChecks[index - 1] = !tempChecks[index - 1]; //toggle the incumbent in list

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        incumbentsChecked: [...tempChecks], //set list of checks in context
      };
    });
  };

  const resetChecks = (e) => {
    let tempChecks = [];
    for (let i = 0; i < constraints.incumbents.length; i++) {
      tempChecks.push(false);
    }

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        incumbentsChecked: [...tempChecks], //set list of checks in context
      };
    });
  };

  const popEqual = (e) => {
    e.preventDefault();

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        populationConstraint: {
          value: e.target.value,
          type: constraints.populationConstraint.type,
        },
      };
    });
  };

  const majMin = (e) => {
    e.preventDefault();

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        majorityMinorityConstraint: {
          value: e.target.value,
          type: constraints.majorityMinorityConstraint.type,
        },
      };
    });
  };

  const compact = (e) => {
    e.preventDefault();

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        compactnessConstraint: {
          value: e.target.value,
          type: constraints.compactnessConstraint.type,
        },
      };
    });
  };

  const threshold = (e) => {
    e.preventDefault();
    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        threshold: e.target.value
      }
    })
  }

  const userClickedDistrict = (e) => {
    e.preventDefault();

    if (e.features[0].source !== "composite") {
      //if the area the user clicked on is a district
      const dist_num = parseInt(e.features[0].source.split("_")[1]);

      setPopUpCoords([...e.lngLat]); //set the position of the popup
      setPopUpText(`District ${dist_num}`); //set the text of the popup
    } else {
      setPopUpCoords(null);
    }
  };

  const numberWithCommas = (x) => {
    //added commas for numbers
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const selectAllIncumbents = (e) => {
    e.preventDefault();
    let tempChecks = [];
    for (let i = 0; i < constraints.incumbents.length; i++) {
      tempChecks.push(true);
    }
    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        incumbentsChecked: [...tempChecks], //set list of checks in context
      };
    });
  };

  const userCheckedPop = (e) => {
    const parsedIndex = parseInt(e.target.id.split("_")[1]);
    console.log(parsedIndex);
    let index = 0;
    let tempChecks = checkPopulation;
    for (let i = 0; i < tempChecks.length; i++) {
      if (i === parsedIndex) {
        //toggle the selected population type
        tempChecks[i] = true;
        index = i;
      } else {
        tempChecks[i] = false; //set everything else to false
      }
    }

    setCheckPopulation([...tempChecks]); //set population type list

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        populationConstraint: {
          value: constraints.populationConstraint.value,
          type: index,
        },
      };
    });
  };

  const userCheckedCompactness = (e) => {
    const parsedIndex = parseInt(e.target.id.split("_")[1]);
    console.log(parsedIndex);
    let index = 0;
    let tempChecks = checkCompactness;
    for (let i = 0; i < tempChecks.length; i++) {
      if (i === parsedIndex) {
        //toggle the selected population type
        tempChecks[i] = true;
        index = i;
      } else {
        tempChecks[i] = false; //set everything else to false
      }
    }

    setCheckCompactness([...tempChecks]); //set population type list

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        compactnessConstraint: {
          value: constraints.compactnessConstraint.value,
          type: index,
        },
      };
    });
  };

  const userCheckedMinority = (e) => {
    const parsedIndex = parseInt(e.target.id.split("_")[1]);
    console.log(parsedIndex);
    let index = 0;
    let tempChecks = checkMinority;
    for (let i = 0; i < tempChecks.length; i++) {
      if (i === parsedIndex) {
        //toggle the selected population type
        tempChecks[i] = true;
        index = i;
      } else {
        tempChecks[i] = false; //set everything else to false
      }
    }

    setCheckMinority([...tempChecks]); //set population type list

    setConstraints((prevConstraints) => {
      return {
        ...prevConstraints,
        majorityMinorityConstraint: {
          value: constraints.majorityMinorityConstraint.value,
          type: index,
        },
      };
    });
  };

  let render = "";

  if (stateDistricts) {
    //if the districts have been loaded in
    render = stateDistricts.features.map((districtFeature, index) => {
      //for each district
      const districtFeatureData = {
        //create the data for that district
        type: districtFeature.type,
        geometry: {
          type: districtFeature.geometry.type,
          coordinates: districtFeature.geometry.coordinates,
        },
      };

      const districtFeatureLayer = {
        //create the layer for that district
        id: `district_${stateDistricts.distNums[index]}_layer`, //lets identify each layer by the district's actual number
        type: "fill",
        source: `district_${stateDistricts.distNums[index]}`,
        layout: {},
        paint: {
          "fill-color": stateDistricts.distColors[index],
          "fill-outline-color": "rgba(255,255,255,1.0)",
        },
      };

      return (
        //return a source component with a child Layer component for that district
        <Source
          id={`district_${stateDistricts.distNums[index]}`} //lets identify each Source component by the district's actual number
          type="geojson"
          data={districtFeatureData}
          key={index}
        >
          <Layer {...districtFeatureLayer} />
        </Source>
      );
    });
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
          <p
            class="h6 d-inline-block back-btn text-white"
            onClick={backToStateSelection}
            style={{ position: "relative", zIndex: "4" }}
          >
            Back
          </p>
          <div className="bg-primary constraints_banner"></div>
          <div className="progress" style={{ height: "11px", zIndex: "10", position: "relative" }}>
            <div className="progress-bar progress-bar-striped bg-success progress-bar-animated" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style={{ width: "50%" }}>
              50%
            </div>
          </div>
          <div
            className="text-white"
            align="center"
            style={{
              paddingTop: "1.5rem",
              position: "relative",
              zIndex: "4",
              marginBottom: "25px",
            }}
          >
            <p class="h2">Constraints</p>
            <p class="h6">
              <em>
                Job {stateFeature.job + 1}:{" "}
                {numberWithCommas(stateFeature.jobs[stateFeature.job].numDistrictings)}{" "}
                districtings
              </em>
            </p>
          </div>
          <div
            className="d-flex flex-column justify-content-between py-4"
            style={{ height: "80%", width: "100%" }}
          >
            <div>

              <div className="row d-flex justify-content-around" style={{ width: "100%" }}>
                <div class="col form-check" style={{ marginLeft: "70px" }}>
                  <label class="form-check-label" htmlFor="split-counties-1">
                    Show counties
                                    </label>
                  <input class="form-check-input" type="checkbox" value="" id="split-counties-1" checked={checks[0]} onChange={userCheckedFilters} />
                </div>

                <div class="col form-check">
                  <label class="form-check-label" htmlFor="dev-avg-2">
                    Show precincts
                                    </label>
                  <input class="form-check-input" type="checkbox" value="" id="dev-avg-2" checked={checks[1]} onChange={userCheckedFilters} />
                </div>
              </div>
              <div>
              </div>
              <p class="h4">Incumbent Protection:</p>
              <button
                type="button"
                class="btn btn-link"
                onClick={openIncumbentPopup}
              >
                Choose incumbents
              </button>
              <hr></hr>
            </div>


            <div>
              <p class="h4">Population Equality:</p>
              <div>
                <div class="d-flex flex-row justify-content-start">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="totPop_0"
                    style={{ marginRight: "10px" }}
                    checked={checkPopulation[0]}
                    onChange={userCheckedPop}
                  />
                  <label class="h6" htmlFor="totPop_0">
                    Total Population
                  </label>
                </div>
                <div class="d-flex flex-row justify-content-start">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="vap_1"
                    style={{ marginRight: "10px" }}
                    checked={checkPopulation[1]}
                    onChange={userCheckedPop}
                  />
                  <label class="h6" htmlFor="vap_1">
                    Voting Age Population
                  </label>
                </div>
                <div class="d-flex flex-row justify-content-between">
                  <div>
                    <input
                      class="form-check-input"
                      type="radio"
                      id="cvap_2"
                      style={{ marginRight: "10px" }}
                      checked={checkPopulation[2]}
                      onChange={userCheckedPop}
                      disabled
                    />
                    <label class="h6" htmlFor="cvap_2">
                      Citizen Voting Age Population
                    </label>
                  </div>
                  {/* <p class="h4 px-2 border border-primary">{popEqualValue}</p> */}
                  <input
                    type="number"
                    value={constraints.populationConstraint.value}
                    disabled="disabled"
                    style={{ width: "60px" }}
                  />
                </div>
              </div>

              <input
                type="range"
                class="form-range"
                min="0"
                max="1"
                step="0.001"
                id="pop_eq_range"
                onInput={popEqual}
                value={constraints.populationConstraint.value}
              />
              <hr></hr>
            </div>


            <div>
              <div>
                <p class="h4">Majority-Minority Districts:</p>

                <div>
                  <div class="d-flex flex-row justify-content-start">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="asian_0"
                      style={{ marginRight: "10px" }}
                      checked={checkMinority[0]}
                      onChange={userCheckedMinority}
                    />
                    <label class="h6" htmlFor="asian_0">
                      Asian
                    </label>
                  </div>
                  <div class="d-flex flex-row justify-content-start">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="aamerican_1"
                      style={{ marginRight: "10px" }}
                      checked={checkMinority[1]}
                      onChange={userCheckedMinority}
                    />
                    <label class="h6" htmlFor="aamerican_1">
                      African-American
                    </label>
                  </div>
                  <div class="d-flex flex-row justify-content-between">
                    <div>
                      <input
                        class="form-check-input"
                        type="radio"
                        id="hispanic_2"
                        style={{ marginRight: "10px" }}
                        checked={checkMinority[2]}
                        onChange={userCheckedMinority}
                      />
                      <label class="h6" htmlFor="hispanic_2">
                        Hispanic
                      </label>
                    </div>
                    {/* <p class="h4 px-2 border border-primary">{popEqualValue}</p> */}
                    <input
                      type="number"
                      value={constraints.majorityMinorityConstraint.value}
                      disabled="disabled"
                      style={{ width: "60px" }}
                    />
                  </div>
                </div>
              </div>
              <input
                type="range"
                class="form-range"
                min="0"
                max="4"
                step="1"
                id="maj_min_range"
                onInput={majMin}
                value={constraints.majorityMinorityConstraint.value}
              />
              <div class="d-flex flex-row justify-content-between">
                <label class="h6">
                  Threshold
                </label>
                <input
                  type="number"
                  value={constraints.threshold}
                  disabled="disabled"
                  style={{ width: "60px" }}
                />
              </div>
              <input
                type="range"
                class="form-range"
                min="0"
                max="1"
                step="0.01"
                id="threshold_range"
                onInput={threshold}
                value={constraints.threshold}
              />
              <hr></hr>
            </div>

            <div>
              <div>
                <p class="h4">Compactness:</p>
                <div>
                  <div class="d-flex flex-row justify-content-between">
                    <div class="form-check">
                      <label
                        class="form-check-label h6"
                        htmlFor="geo-compact_0"
                      >
                        Geometric Compactness
                      </label>
                      <input
                        class="form-check-input"
                        type="radio"
                        id="geo-compact_0"
                        onChange={userCheckedCompactness}
                        checked={checkCompactness[0]}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div class="d-flex flex-row justify-content-between">
                    <div class="form-check">
                      <label class="form-check-label" htmlFor="graph-compact_1">
                        <p class="h6">Graph Compactness</p>
                      </label>
                      <input
                        class="form-check-input"
                        type="radio"
                        id="graph-compact_1"
                        onChange={userCheckedCompactness}
                        checked={checkCompactness[1]}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div class="d-flex flex-row justify-content-between">
                    <div class="form-check">
                      <label class="form-check-label" htmlFor="pop-fat_2">
                        <p class="h6">Population Fatness</p>
                      </label>
                      <input
                        class="form-check-input"
                        type="radio"
                        id="pop-fat_2"
                        onChange={userCheckedCompactness}
                        checked={checkCompactness[2]}
                      />
                    </div>
                    <input
                      type="number"
                      value={constraints.compactnessConstraint.value}
                      disabled="disabled"
                      style={{ width: "60px" }}
                    />
                  </div>
                </div>
              </div>
              <input
                type="range"
                class="form-range"
                min="0"
                max="1"
                step="0.01"
                id="compact_range"
                onInput={compact}
                value={constraints.compactnessConstraint.value}
              />
            </div>

            <div>
              <button
                type="button"
                className="btn btn-lg col-12 btn-primary"
                onClick={saveEverything}
              >
                Apply
              </button>
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
        onClick={userClickedDistrict}
      >
        {countyLayer}
        {precinctLayer}
        {render}

        {popUpCoords ? (
          <Popup
            latitude={popUpCoords[1]}
            longitude={popUpCoords[0]}
            onClose={() => {
              setPopUpCoords(null);
            }}
          >
            <div class="px-2">
              <h5>{popUpText}</h5>
            </div>
          </Popup>
        ) : (
          ""
        )}
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

      {showIncumbents ? (
        <div className="incumbentPopup">
          <div style={OVERLAY_STYLES} />
          <div className="card" style={MODAL_STYLES}>
            {/* {children} */}
            <div class="card-body">
              <h5 class="card-title">Choose your incumbents</h5>
              <h6 class="card-subtitle mb-2 text-muted">
                Edits are automatically saved
              </h6>
              <div style={{ height: "80%", overflow: "auto" }}>
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
                    {constraints.incumbents.map((incumbent, index) => {
                      let cleanedParty = incumbent.party.substring(1, incumbent.party.length - 1)
                      let cleanedName = incumbent.name.substring(1, incumbent.name.length - 1)
                      let className = cleanedParty === 'Republican' ? "table-danger" : "table-info";
                      console.log(incumbent.party.substring(1, incumbent.party.length - 1))
                      return (
                        <tr className={className}>
                          <th scope="row">{index + 1}</th>
                          <td>{cleanedName}</td>
                          <td>{cleanedParty}</td>
                          <td>
                            <input
                              class="form-check-input"
                              type="checkbox"
                              value=""
                              id={`incumbent${index + 1}`}
                              checked={constraints.incumbentsChecked[index]}
                              onChange={userChecked}
                            />
                          </td>
                        </tr>
                      )
                    })}

                  </tbody>
                </table>
              </div>

              <div
                className="d-flex flex-row justify-content-around"
                style={{ marginTop: "10px" }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={selectAllIncumbents}
                >
                  Select All
                </button>
                <button className="btn btn-success" onClick={resetChecks}>
                  Reset
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowIncumbents(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <p
        style={{
          position: "absolute",
          top: "95%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: "1",
        }}
      >
        <strong>
          <em>Figure shows the most recent district boundaries</em>
        </strong>
      </p>
    </div>
  );
};

export default Constraints;
