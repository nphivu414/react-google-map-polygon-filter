import React, { useState, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import SelectedMarkers from './SelectedMarkers';

function CustomGoogleMap(props) {
  const [ mapMarkers, setMapMarkers ] = useState([]);

  const mapMarkersRef = useRef(mapMarkers);
  const previousMarkersRef = useRef([]);
  const mapRef = useRef();
  const drawingManagerRef = useRef();
  
  function setMapMarkersRef(data) {
    mapMarkersRef.current = data;
    setMapMarkers(data);
  }

  function _initDefaultMarkers(google) {
    var myLatLng = {lat: 59.98311473265551, lng: 30.359113754862896};
    const marker = new google.maps.Marker({
        position: myLatLng,
        title:"Hello World!"
    });
    setMapMarkersRef([marker]);
    marker.setMap(mapRef.current);
  }

  function _onMarkerClick(marker) {
    console.log("function_onMarkerClick -> LATTTTTTT", marker.latLng.lat())
    console.log("function_onMarkerClick -> LATTTTTTT", marker.latLng.lng())
  }

  function _onPolygonClick(google) {
    return function(polygon) {
      console.log("function_onPolygonClick -> polygon", polygon)
      this.setMap(null);
      setMapMarkersRef(previousMarkersRef.current)
      previousMarkersRef.current.forEach(marker => {
        marker.setMap(mapRef.current)
      });
      drawingManagerRef.current.setOptions({
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['marker', 'polygon']
        }
      });
    }
  }

  function _onMarkerComplete(marker) {
    const newMarkers = [...mapMarkersRef.current, marker];
      setMapMarkersRef(newMarkers);
      marker.addListener('click', _onMarkerClick)
  }

  function _onPolygonComplete(google) {
    return function (polygon) {
      polygon.addListener('click', _onPolygonClick(google));
      previousMarkersRef.current = mapMarkersRef.current;

      const selectedMarkers = [];
      for (var i = 0; i < mapMarkersRef.current.length; i++) {
          const currentMarker = mapMarkersRef.current[i];
          if (google.maps.geometry.poly.containsLocation(currentMarker.getPosition(), polygon)) {
            selectedMarkers.push(currentMarker);
          } else {
            currentMarker.setMap(null)
          }
      }

      setMapMarkersRef(selectedMarkers)
      drawingManagerRef.current.setOptions({
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: []
        }
      });
      drawingManagerRef.current.setDrawingMode(null);
    }
  }

  function _createGoogleMapDrawingManager(google) {
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['marker', 'polygon']
      },
      polygonOptions: {
        fillColor: '#000000',
        fillOpacity: 0.5,
        strokeWeight: 3,
        editable: true,
        zIndex: 1
      }
    });
    return drawingManager;
  }

  function _onGoogleApiLoaded(google) {
    const map = google.map
    mapRef.current = map;
    const drawingManager = _createGoogleMapDrawingManager(google);
    drawingManagerRef.current = drawingManager;
    google.maps.event.addListener(drawingManager, 'markercomplete', _onMarkerComplete);
    google.maps.event.addListener(drawingManager, 'polygoncomplete', _onPolygonComplete(google));
    drawingManager.setMap(map);

    _initDefaultMarkers(google)
  }

  console.log('mapMarkers', mapMarkers)

  return (
    <div style={{ width: '80%', margin: '0 auto' }}>
      <div class="columns" style={{ height: '80vh' }}>
        <div class="column">
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyDqNBEcO5PP4Q471pE4W3qy3wQkRZwaJZo', libraries: ['drawing', 'geometry'].join(','), }}
            defaultCenter={props.center}
            defaultZoom={props.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={_onGoogleApiLoaded}/>
        </div>
        <div class="column">
          <SelectedMarkers markers={mapMarkers}/>
        </div>
      </div>
    </div>
  )
}

CustomGoogleMap.defaultProps = {
  center: {
    lat: 59.95,
    lng: 30.33
  },
  zoom: 11
}

export default CustomGoogleMap;