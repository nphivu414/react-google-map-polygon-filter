import React from 'react';

function SelectedMarkers(props) {
  const { markers } = props;
  return (
    <article class="panel is-primary">
      <p class="panel-heading">
        Markers
      </p>
      {
        markers.length > 0 && markers.map(marker => (
          <div class="panel-block is-active">
            <span class="panel-icon">
              <i class="fas fa-map-marker" aria-hidden="true"></i>
            </span>
            <span><strong>{marker.title}:</strong></span>
            <span style={{ marginLeft: 5 }}>{`lat: ${marker.position.lat()} - long: ${marker.position.lng()}`}</span>
          </div>
        ))
      }
      
    </article>
  )
}

export default SelectedMarkers;