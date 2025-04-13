import React, { useState } from "react";
import axios from "axios";

const AddLandmark: React.FC = () => {
  const [name, setName] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lon, setLon] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8082/api/landmarks', {
        name,
        lat,
        lon,
      });
      alert('Landmark added successfully!');
      setName('');
      setLat('');
      setLon('');
    } catch (error) {
      console.error('Error adding landmark:', error);
      alert('Failed to add landmark.');
    }
  };

  return (
    <div className="add-landmark-form">
      <h2>Add New Landmark</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          required 
        />
        <input 
          type="number" 
          placeholder="Latitude" 
          value={lat} 
          onChange={(e) => setLat(Number(e.target.value))}
          required 
        />
        <input 
          type="number" 
          placeholder="Longitude" 
          value={lon} 
          onChange={(e) => setLon(Number(e.target.value))}
          required 
        />
        <button type="submit">Save Landmark</button>
      </form>
    </div>
  );
};

export default AddLandmark;
