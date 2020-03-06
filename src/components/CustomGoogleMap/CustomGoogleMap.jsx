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
    var myLatLng = {lat: 59.94656140610272, lng: 30.33084972591137};
    const marker = new google.maps.Marker({
        position: myLatLng,
        title:"Marker 1"
    });
    marker.addListener('click', _onMarkerClick)
    setMapMarkersRef([marker]);
    marker.setMap(mapRef.current);
  }

  function _onMarkerClick(marker) {
    alert(`lat: ${marker.latLng.lat()} - long: $${marker.latLng.lng()}`)
  }

  function _onPolygonClick(google) {
    return function(polygon) {
      // Remove polygon on click
      this.setMap(null);

      // Show all markers on left side panel again after removing polygon
      setMapMarkersRef(previousMarkersRef.current)
      // Show all markers on map again after removing polygon
      previousMarkersRef.current.forEach(marker => {
        marker.setMap(mapRef.current)
      });

      // Revert drawing mode
      drawingManagerRef.current.setOptions({
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['marker', 'polygon']
        }
      });
    }
  }

  function _onMarkerComplete(marker) {
    marker.setTitle(`Marker ${mapMarkersRef.current.length + 1}`);
    marker.addListener('click', _onMarkerClick)
    const newMarkers = [...mapMarkersRef.current, marker];
    setMapMarkersRef(newMarkers);
  }

  function _onPolygonComplete(google) {
    return function (polygon) {
      polygon.addListener('click', _onPolygonClick(google));
      previousMarkersRef.current = mapMarkersRef.current;

      const selectedMarkers = [];

      mapMarkersRef.current.forEach(currentMarker => {
        if (google.maps.geometry.poly.containsLocation(currentMarker.getPosition(), polygon)) {
          selectedMarkers.push(currentMarker);
        } else {
          currentMarker.setMap(null)
        }
      });

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

  return (
    <div style={{ width: '80%', margin: '0 auto' }}>
      <div class="columns">
        <div class="column" style={{ height: 500 }}>
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