// components/LandmarkForm.tsx
import React from 'react';

interface LandmarkFormProps {
  location: { lat: number; lon: number };
  onSubmit: (landmark: { title: string; lat: number; lon: number; imageUrl: string; color: string }) => void;
  onCancel: () => void;
}

const LandmarkForm: React.FC<LandmarkFormProps> = ({ location, onSubmit, onCancel }) => {
  const [title, setTitle] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [color, setColor] = React.useState('#8B4513');

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    onSubmit({
      title,
      lat: location.lat,
      lon: location.lon,
      imageUrl,
      color
    });
  };

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: 25,
      borderRadius: 12,
      border: "1px solid #f0e6e2",
      boxShadow: "0 0 20px rgba(0,0,0,0.15)",
      zIndex: 2,
      width: 350,
      maxWidth: "90%"
    }}>
      <h3 style={{ fontSize: 24, fontWeight: "bold", color: "#6d4c41", marginBottom: 15 }}>Add New Landmark</h3>
      <div style={{ marginBottom: 15 }}>
        <label>Landmark Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderWidth: 1,
            borderColor: "#d7ccc8",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 16,
            backgroundColor: "#fff",
            color: "#5d4037"
          }}
          autoFocus
        />
      </div>
      <div style={{ marginBottom: 15 }}>
        <label>Image URL:</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderWidth: 1,
            borderColor: "#d7ccc8",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 16,
            backgroundColor: "#fff",
            color: "#5d4037"
          }}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div style={{ marginBottom: 15 }}>
        <label>Marker Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: "100%", height: 40, marginBottom: 15 }}
        />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <button 
          onClick={onCancel}
          style={{
            backgroundColor: "#f5f5f5",
            padding: "12px 16px",
            borderRadius: 8,
            color: "#5d4037",
            border: "1px solid #d7ccc8",
            fontSize: 16,
            cursor: "pointer",
            flex: 1
          }}
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!title.trim()}
          style={{ 
            backgroundColor: "#6d4c41",
            padding: "12px 16px",
            borderRadius: 8,
            color: "#FFD700",
            border: "none",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            flex: 1,
            opacity: !title.trim() ? 0.5 : 1
          }}
        >
          Save Landmark
        </button>
      </div>
    </div>
  );
};

