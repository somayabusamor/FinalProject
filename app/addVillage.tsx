import React, { useState } from "react";
import axios from "axios";
import "./addVillage.css";

const AddVillage: React.FC = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState(""); // Changed from File[] to string
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
          const response = await axios.post(
            "http://localhost:8081/api/addVillage",
            { name, description, imageUrl },
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
          
          setMessage("Village added successfully!");
          setName("");
          setDescription("");
          setImageUrl("");
        } catch (error: unknown) {
          let errorMessage = "Failed to add village";
          
          // Type guard for Axios errors
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message;
            console.error("Axios error details:", {
              status: error.response?.status,
              data: error.response?.data,
              config: error.config
            });
          } 
          // Type guard for standard Error
          else if (error instanceof Error) {
            errorMessage = error.message;
          }
          // Fallback for truly unknown errors
          else {
            console.error("Unknown error type:", error);
          }
          
          setMessage(errorMessage);
        } finally {
          setIsSubmitting(false);
        }
      };
    return (
        <div className="add-village-container">
            <h2>Add New Village</h2>
            <form onSubmit={handleSubmit} className="add-village-form">
                <input
                    type="text"
                    placeholder="Village Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Village Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input 
                    type="url"
                    placeholder="Image URL (e.g., https://www.dukium.org/wp-content/uploads/2013/08/Jmiaah-Al-Saghaira-Rakhamah-Water-tank-20.03.2018-150x113.jpg)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Village"}
                </button>
            </form>
            {message && (
                <p className={`message ${message.includes("success") ? "success" : "error"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default AddVillage;