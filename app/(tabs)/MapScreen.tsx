import React from 'react';

export default function MapScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
      {/* Embedding the ArcGIS Experience */}
      <iframe
        src="https://experience.arcgis.com/experience/b645389696674c228440a4a1ea375f34"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 'none' }}
        title="ArcGIS Experience"
      ></iframe>
    </div>
  );
}
