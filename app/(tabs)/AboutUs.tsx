import React from 'react';

const AboutUs = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>About Us</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Improving emergency access with accurate geographic data
        </p>
      </div>

      {/* Project Overview */}
      <section>
        <h2 style={{ fontSize: '2rem', color: '#333' }}>Our Mission</h2>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          Emergency services in Israel face difficulties reaching unrecognized areas, leading to delays and potentially harmful consequences. Our platform aims to change this by providing a reliable way to collect and share accurate geographic data for these areas, helping emergency personnel reach their destinations quickly and efficiently.
        </p>
      </section>

      {/* Problem Definition */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '2rem', color: '#333' }}>The Problem</h2>
        <ul style={{ fontSize: '1.1rem', color: '#555' }}>
          <li>Lack of accurate geographic data</li>
          <li>Delayed response times</li>
          <li>Limited information</li>
        </ul>
      </section>

      {/* Project Goal */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '2rem', color: '#333' }}>Our Goal</h2>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          Our platform collects and uploads accurate geographic data for unrecognized areas, creating a comprehensive database of coordinates, landmarks, and access routes. This enables local communities to contribute and update geographic data, providing a reference for emergency services to reach critical locations faster.
        </p>
      </section>

      {/* How It Works */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '2rem', color: '#333' }}>How It Works</h2>
        <ol style={{ fontSize: '1.1rem', color: '#555' }}>
          <li><strong>Collect Data</strong>: Local communities add accurate geographic information.</li>
          <li><strong>Build Database</strong>: Information is uploaded and stored in a central database.</li>
          <li><strong>Access for Emergency Services</strong>: Emergency services access the database for quick references.</li>
        </ol>
      </section>

      {/* Our Vision */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '2rem', color: '#333' }}>Our Vision for the Future</h2>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          We envision a future where every unrecognized area in Israel has accurate, easily accessible geographic information, ensuring that emergency services can reach every corner of the country in record time.
        </p>
      </section>

      {/* Contact Us */}
      <section style={{ marginTop: '50px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#333' }}>Contact Us</h2>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          Have questions? Reach out to us at <a href="mailto:support@example.com">support@example.com</a>
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
