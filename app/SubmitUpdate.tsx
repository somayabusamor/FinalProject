import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import './SubmitUpdate.css';

const SubmitUpdate: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [villageName, setVillageName] = useState<string>('');
  const [updateType, setUpdateType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<File[]>([]); // Define as File[]
  const [error, setError] = useState<string>('');
  const [filePreviews, setFilePreviews] = useState<string[]>([]); // Define as string[]

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files); // Ensure files are an array of File
    setImages(files);

    const previewUrls = files.map((file) => URL.createObjectURL(file)); // Create URLs for previews
    setFilePreviews(previewUrls);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('villageName', villageName);
    formData.append('updateType', updateType);
    formData.append('description', description);
    images.forEach((image) => formData.append('images', image)); // Append files

    try {
      await axios.post('http://localhost:8082/api/submitUpdate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Update submitted successfully!');
    } catch (error) {
      setError('There was an error submitting your update.');
    }
  };

  return (
    <div className="container">
      <h1>Submit an Update</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="villageName">Village Name</label>
          <input
            type="text"
            id="villageName"
            value={villageName}
            onChange={(e) => setVillageName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="updateType">Update Type</label>
          <select
            id="updateType"
            value={updateType}
            onChange={(e) => setUpdateType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="new_building">New Building</option>
            <option value="new_road">New Road</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="images">Images</label>
          <input
            type="file"
            id="images"
            onChange={handleFileChange}
            multiple
            required
          />
        </div>

        <div className="file-preview">
          {filePreviews.map((preview, index) => (
            <img key={index} src={preview} alt={`preview-${index}`} />
          ))}
        </div>

        <button type="submit">Submit Update</button>
      </form>
    </div>
  );
};

export default SubmitUpdate;
