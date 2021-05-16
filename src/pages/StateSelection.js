import React, { useState, useContext, useEffect } from "react";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import RingLoader from "react-spinners/RingLoader";

import { StateContext } from "../contexts/StateContext";

const StateSelection = () => {
  const { state, page, polygon, districts, constraintsData } = useContext(StateContext);
  const [stateFeature, setStateFeature] = state;
  const [pageName, setPageName] = page;
  const [stateDistricts, setStateDistricts] = districts;
  const [constraints, setConstraints] = constraintsData;
  const [pd, setPd] = polygon;
  const [loading, setLoading] = useState(false);

  //grab states from global state.
  const [stateCenter, setStateCenter] = useState(null);
  const allStates = require("../data/allState.json");
  const enactedDistricts = require("../data/districts114.json");
  const [filteredStates, setFilteredStates] = useState(null);

  let geojson;
  fetch(
    "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson"
  )
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      geojson = data;
    });

  let stateCenters;
  fetch(
    "https://gist.githubusercontent.com/meiqimichelle/7727723/raw/0109432d22f28fd1a669a3fd113e41c4193dbb5d/USstates_avg_latLong"
  )
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      stateCenters = data;
    });

  const [viewport, setViewport] = useState({
    //set viewing settings for map
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 4.25,
    bearing: 0,
    pitch: 0,
  });

  const resetFeature = {
    //used to reset state data
    feature: null,
    jobs: null,
    job: null,
    stateCenter: null,
  };

  const statesLayer = {
    //used to outline the entire U.S.
    id: "states-layer",
    type: "fill",
    source: "states",
    paint: {
      "fill-color": "rgba(181, 209, 255, 0.3)",
      "fill-outline-color": "rgba(0, 0, 0, 0.5)",
    },
  };

  useEffect(() => {
    let states = {
      type: "FeatureCollection",
      features: [],
    };
    const features = allStates.features;

    for (let i = 0; i < features.length; i++) {
      if (
        features[i].properties.name === "Utah" || features[i].properties.name === "Virginia" || features[i].properties.name === "Arizona"
      ) {
        states.features.push(features[i]);
      }
    }

    setFilteredStates(states);
    if (stateFeature.feature !== null) {
      //if there is already a state chosen
      //disable respective job button
      document.getElementById(`job-${stateFeature.job + 1}`).disabled = true; //there must have been a job that was already chosen as well

      //set value of dropdown
      document.getElementById("state-selection").value =
        stateFeature.feature.properties.postal;

      if (stateDistricts) {
        setViewport((prevViewPort) => {
          return {
            ...prevViewPort,
            latitude: stateFeature.stateCenter[0],
            longitude: stateFeature.stateCenter[1],
            zoom: 6
          }
        })
      }
    }
  }, []);

  const mapClicked = (e) => {
    e.preventDefault();

    if (stateFeature.job !== null) {
      //if user clicked on another state after choosing a job
      document.getElementById(`job-${stateFeature.job + 1}`).disabled = false; //reset the job button
    }

    setStateFeature(resetFeature); //reset the data for state
    setStateDistricts(null);
    console.log(e.features)
    if (e.features[0].properties.name === "Utah" || e.features[0].properties.name === "Virginia" || e.features[0].properties.name === "Arizona") {
      //check which state the user just clicked on
      setStateByName(e.features[0].properties.name); //state data for map will be set in the function
    } else {
      //if the chosen state is none of the 3
      console.log(e.features[0].properties);
      document.getElementById("state-selection").value = ""; //reset the dropdown value
    }
  };

  const setStateByName = (name) => {
    let cur_feature = null;
    for (let i = 0; i < geojson.features.length; i++) {
      if (geojson.features[i].properties.name === name) {
        cur_feature = geojson.features[i]; //get features for chosen state
        setStateFeature((prevStateFeature) => {
          return {
            ...prevStateFeature,
            feature: cur_feature,
          };
        });
        break;
      }
    }
    let requestObj = new XMLHttpRequest();
    requestObj.onreadystatechange = (res) => {
      if (res.target.readyState == 4 && res.target.status == 200) {
        const responseObj = JSON.parse(res.target.responseText);
        let jobs = [];
        for (let i = 0; i < responseObj.length; i++) {
          if (responseObj[i].id !== "enacted") {
            jobs.push({
              id: responseObj[i].id,
              coolingPeriod: responseObj[i].coolingPeriod,
              rounds: responseObj[i].rounds,
              stateName: responseObj[i].state.stateName,
              numDistrictings: responseObj[i].numDistrictings,
            });
          }

        }
        setStateFeature((prevStateFeature) => {
          return {
            ...prevStateFeature,
            jobs: jobs,
          };
        });
      }
    };
    requestObj.open("GET", `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/jobs=${name.toUpperCase()}`, false);
    requestObj.send();

    getStateDistricts(name);

    document.getElementById("state-selection").value = cur_feature.properties.postal;

    getStateCenter(name);
  };

  const stateSelectionDropdown = (e) => {
    //for the dropdown
    e.preventDefault();

    if (stateFeature.job !== null) {
      //if the user has chosen a job and changed state, reset the job button
      document.getElementById(`job-${stateFeature.job + 1}`).disabled = false;
    }

    setStateFeature(resetFeature); //reset state data

    const state = e.target.options[e.target.selectedIndex].text;
    setStateByName(state); //set state data from value chosen in dropdown
  };

  const jobClick = (e) => {
    e.preventDefault();

    const id = parseInt(e.target.id.split("-")[1]); //get the id of that job

    console.log(stateFeature);
    console.log(`Job ${id} has ${stateFeature.jobs[id - 1]} districtings.`);

    if (stateFeature.job === null) {
      //if no previously chosen job exists
      console.log("null");
      document.getElementById(`job-${id}`).disabled = true; //disable currently chosen job button
    } else {
      console.log("not null");
      document.getElementById(`job-${stateFeature.job + 1}`).disabled = false; //reset the previously chosen job button
      document.getElementById(`job-${id}`).disabled = true; //disable currently chosen job button
    }

    setStateFeature((prevStateFeature) => {
      return {
        ...prevStateFeature,
        job: id - 1, //set current job by index
      };
    });
  };

  const getStateDistricts = (name) => {
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
      if (features[i].properties.STATENAME === name) {
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

        colors.push(`rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},0.5)`); //generate a random color and push
        districts.push(features[i].properties.DISTRICT); //push the district number
      }
    }
    coordHolder.distNums = [...districts]; //set the district numbers list
    coordHolder.distColors = [...colors]; //set the colors list
    setStateDistricts(coordHolder); //set all this data in global state
  };

  const getStateCenter = (name) => {
    let center;
    for (let i = 0; i < stateCenters.length; i++) {
      if (stateCenters[i].state === name) {
        //get the state center for respective state
        center = stateCenters[i];
        setStateCenter(center);
        break;
      }
    }
    setViewport((prevViewPort) => {
      return {
        ...prevViewPort,
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: 6,
      };
    });
  };

  const applyEverything = (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(stateFeature.feature);

    let requestObj = new XMLHttpRequest();
    requestObj.onreadystatechange = (res) => {
      let response = res.target;
      if (response.readyState == 4 && response.status == 200) {
        let incumbents = JSON.parse(response.responseText)
        let incumbentsChecked = []
        console.log(incumbents)
        for (let i = 0; i < incumbents.length; i++) {
          incumbentsChecked.push(false)
          incumbents[i].incumbentID = incumbents[i].incumbentID.split("_")[1]
        }
        console.log(incumbents)
        console.log(`http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/state=${stateFeature.feature.properties.name.toUpperCase()}&job=${stateFeature.jobs[stateFeature.job].id}`)
        setConstraints((prevConstraints) => {
          return {
            ...prevConstraints,
            incumbents: [...incumbents],
            incumbentsChecked: [...incumbentsChecked]
          }
        })
        setLoading(false)
        setPageName("constraints"); //move on to next page
      }
    };
    requestObj.open(
      "GET",
      `http://localhost:8080/Diamondbacks-1.0-SNAPSHOT/api/controller/state=${stateFeature.feature.properties.name.toUpperCase()}&job=${stateFeature.jobs[stateFeature.job].id}`,
      true
    );
    requestObj.send();

    if (!stateFeature.stateCenter) {
      setStateFeature((prevStateFeature) => {
        return {
          ...prevStateFeature,
          stateCenter: [stateCenter.latitude, stateCenter.longitude], //set the center of that state for the next page
        };
      })
    }

  };

  const numberWithCommas = (x) => {
    // add commas for thousands place and stuff
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  let render = null;

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
          "fill-outline-color": "rgba(0,0,0,1.0)",
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
          className="col-3 shadow-lg "
          align="center"
          style={{
            backgroundColor: "#fff",
            zIndex: "2",
            paddingTop: "5rem",
            height: "100%",
            position: "relative",
          }}
        >

          <div
            className="text-white"
            style={{ zIndex: "4", position: "relative" }}
          >

            <h3>Select a state:</h3>
            <select
              id="state-selection"
              class="form-select"
              onChange={stateSelectionDropdown}
            >
              <option value="" defaultValue hidden>
                Select a state
              </option>
              <option value="AZ">Arizona</option>
              <option value="UT">Utah</option>
              <option value="VA">Virginia</option>
            </select>
          </div>
          <div className="bg-primary state_selection_banner">
            <div className="progress" style={{ height: "11px", zIndex: "10", position: "relative", marginTop: "30px", width: "94%" }}>
              <div className="progress-bar progress-bar-striped bg-success progress-bar-animated" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style={{ width: "25%" }}>
                25%
              </div>
            </div>
          </div>
          {stateFeature.jobs !== null ? (
            <div
              className="d-flex flex-column justify-content-between py-4"
              style={{ height: "90%", width: "100%" }}
            >
              <hr></hr>
              <h5>Choose a job:</h5>
              <div
                className="shadow"
                style={{ overflow: "auto", height: "80%" }}
              >
                {stateFeature.jobs.map((job, index) => {
                  return (
                    <div class="card" key={index + 1}>
                      <h5 class="card-header">{job.stateName} - Job {index + 1}</h5>
                      <div class="card-body">
                        <h5 class="card-title">
                          {numberWithCommas(job.numDistrictings)} redistrictings
                        </h5>
                        <p class="card-text">
                          Rounds : {numberWithCommas(job.rounds)}
                        </p>
                        <p class="card-text">
                          Cooling-Period : {job.coolingPeriod}
                        </p>
                        <button
                          id={`job-${index + 1}`}
                          className="btn btn-primary"
                          onClick={jobClick}
                        >
                          Pick job {index + 1}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ margin: "10px" }}>
                {stateFeature.job !== null ? ( //the proceed button should only be clickable when user has chosen a job
                  <button
                    type="button"
                    className="btn btn-lg col-12 btn-success"
                    onClick={applyEverything}
                  >
                    Proceed
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-lg col-12 btn-success"
                    onClick={applyEverything}
                    disabled
                  >
                    Proceed
                  </button>
                )}
              </div>
            </div>
          ) : (
            ""
          )}
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
        onClick={mapClicked}
      >
        {render}

        <Source id="states" type="geojson" data={filteredStates}>
          <Layer {...statesLayer} />
        </Source>
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
    </div>
  );
};

export default StateSelection;
