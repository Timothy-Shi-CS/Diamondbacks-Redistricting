import React, { useState, useContext } from 'react'
import ReactMapGL, { Source, Layer } from "react-map-gl"

import { StateContext } from '../contexts/StateContext'

const FirstFilter = () => {
    const { state, page } = useContext(StateContext);
    const [stateFeature, setStateFeature] = state;
    const [pageName, setPageName] = page

    const [viewport, setViewport] = useState({
        latitude: parseFloat(stateFeature.stateCenter[0]),
        longitude: parseFloat(stateFeature.stateCenter[1]),
        zoom: 6,
        bearing: 0,
        pitch: 0
    });

    const polygonData = {
        'type': stateFeature.feature.type,
        'geometry': {
            'type': stateFeature.feature.geometry.type,
            'coordinates': stateFeature.feature.geometry.coordinates
        }
    };

    const polygonLayer = {
        'id': 'state-layer',
        'type': 'fill',
        'source': 'state',
        'layout': {},
        'paint': {
            'fill-color': 'rgba(132, 245, 134, 0.15)',
            'fill-outline-color': 'rgba(113, 191, 114, 0.3)'
        }
    };

    const backToStateSelection=(e)=>{
        console.log('back to state selection');
        setPageName('state-selection');
    }

    return (
        <div className="container-fluid" style={{ height: "100vh", width: "100vw", position: 'relative' }}>
            <div className="row d-flex justify-content-between" style={{ height: "100%", width: "100%", position: 'absolute', top: '0' }}>
                <div id="left-bar" className="col-2" align="center" style={{ backgroundColor: "#fff", zIndex: "2", paddingTop: "5rem"}}>
                    <p class="h6 d-inline-block back-btn" onClick={backToStateSelection}>Back</p>
                </div>
            </div>

            <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={setViewport}
                mapboxApiAccessToken={"pk.eyJ1IjoieGxpdHRvYm95eHgiLCJhIjoiY2tscHFmejN4MG5veTJvbGhyZjFoMjR5MiJ9.XlWX6UhL_3qDIlHl0eUuiw"}
            >
                <Source
                    id="state"
                    type="geojson"
                    data={polygonData}
                >
                    <Layer
                        {...polygonLayer}
                    />
                </Source>
            </ReactMapGL>




        </div>
    )
}

export default FirstFilter;