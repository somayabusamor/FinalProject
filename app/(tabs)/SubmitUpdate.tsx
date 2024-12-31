import React, { useState, ChangeEvent, FormEvent } from 'react';
import styles from '../styles/SubmitUpdate.module.css';

interface FormData {
    firstName: string;
    lastName: string;
    villageName: string;
    updateType: string;
    description: string;
    images: File[] | null;
}

const SubmitUpdate: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        villageName: '',
        updateType: '',
        description: '',
        images: null,
    });

    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setFormData((prev) => ({ ...prev, images: Array.from(files) }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('villageName', formData.villageName);
        formDataToSend.append('updateType', formData.updateType);
        formDataToSend.append('description', formData.description);

        if (formData.images) {
            for (const file of formData.images) {
                formDataToSend.append('images', file);
            }
        }

        try {
            const response = await fetch('http://localhost:8081/api', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
              if (response.status === 404) {
                throw new Error('API endpoint not found. Please check the URL.');
            }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStatusMessage({ type: 'success', text: 'Update submitted successfully!' });
            console.log('Update submitted:', data);
            setFormData({
                firstName: '',
                lastName: '',
                villageName: '',
                updateType: '',
                description: '',
                images: null,
            });
        } catch (error) {
            console.error('Error:', error);
            setStatusMessage({ type: 'error', text: 'Error submitting the update. Please try again.' });
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Submit an Update</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                />
                <input
                    type="text"
                    name="villageName"
                    placeholder="Village Name"
                    value={formData.villageName}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                />
                <select
                    name="updateType"
                    value={formData.updateType}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                >
                    <option value="">Select Update Type</option>
                    <option value="new building">New Building</option>
                    <option value="new road">New Road</option>
                    <option value="other">Other</option>
                </select>
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    required
                />
                <input
                    type="file"
                    name="images"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    multiple
                />
                <button type="submit" className={styles.submitButton}>
                    Submit
                </button>
            </form>
            {statusMessage && (
                <div
                    className={
                        statusMessage.type === 'success'
                            ? styles.successMessage
                            : styles.errorMessage
                    }
                >
                    {statusMessage.text}
                </div>
            )}
        </div>
    );
};

export default SubmitUpdate;
