// src/ImageCRUD.js (or ImageCRUD.jsx) - Enhanced with Tailwind CSS

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// IMPORTANT: Must match your backend server address and main route
const API_URL = 'http://localhost:5000/api/images'; 
const BASE_URL = 'http://localhost:5000'; 

const ImageCRUD = () => {
    // --- State Hooks ---
    const [images, setImages] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [editingImage, setEditingImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const isEditing = editingImage !== null;

    // --- R (Read): Fetch all images ---
    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // --- Helper function to set form fields for editing ---
    const handleEditClick = (image) => {
        setEditingImage(image);
        setTitle(image.title);
        setDescription(image.description);
        setImageFile(null);
    };
    
    // --- D (Delete): Delete an image ---
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchImages();
            } catch (error) {
                console.error('Error deleting image:', error);
                alert('Failed to delete image. Server error.');
            }
        }
    };
    
    // --- C (Create) and U (Update) with file handling (Combined Logic) ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        
        if (imageFile) {
            // Key 'imageFile' MUST match Multer config
            formData.append('imageFile', imageFile);
        } else if (!isEditing) {
            return alert('Please select an image file for a new entry.');
        }

        const url = isEditing ? `${API_URL}/${editingImage._id}` : API_URL;
        const method = isEditing ? axios.put : axios.post;
        
        try {
            await method(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // --- Success handling: reset form, fetch images ---
            setEditingImage(null);
            setTitle('');
            setDescription('');
            setImageFile(null);
            
            // Manually clear the file input field
            const fileInput = document.getElementById('imageFile');
            if (fileInput) fileInput.value = null; 
            
            fetchImages();
        } catch (error) {
            console.error('Error submitting form:', error.response?.data || error.message);
            alert(`Failed to save image: ${error.response?.data?.msg || error.message}`);
        }
    };
    
    // --- Image Gallery Content ---
    const imageGallery = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
                <div className="text-pink-600 col-span-full text-center py-10">
                    Loading images...
                </div>
            ) : images.length === 0 ? (
                <div className="text-gray-500 col-span-full text-center py-10">
                    No images found. Upload one to get started!
                </div>
            ) : (
                images.map((image) => (
                    <div key={image._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                        
                        {/* Image Display */}
                        <img 
                            src={`${BASE_URL}${image.imageUrl}`} 
                            alt={image.title} 
                            className="w-full h-48 object-cover"
                        />
                        
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-pink-700 truncate">{image.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{image.description}</p>

                            <div className="flex justify-between items-center">
                                <button 
                                    onClick={() => handleEditClick(image)} 
                                    className="px-3 py-1 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition duration-150"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(image._id)} 
                                    className="px-3 py-1 text-sm font-medium text-red-500 bg-red-100 rounded-lg hover:bg-red-200 transition duration-150"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    // --- Full Return Statement ---
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-pink-600">MERN Image CRUD Gallery</h1>
                    <p className="text-gray-500 mt-2">Create, Read, Update, and Delete your images with Node/Express and React.</p>
                </header>

                {/* --- Image Submission/Update Card --- */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl mb-12 border-t-4 border-pink-500">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        {isEditing ? 'Edit Image Details' : 'Upload New Image'}
                    </h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Image Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                        />
                        <textarea
                            placeholder="Description (Optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                        />
                        <div className="py-2">
                            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                                {isEditing ? 'Upload New File (Optional)' : 'Select Image File'}
                            </label>
                            <input
                                type="file"
                                id="imageFile"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                required={!isEditing} 
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                        </div>
                        
                        <div className="pt-4 flex space-x-3">
                            <button 
                                type="submit"
                                className="px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-pink-600 hover:bg-pink-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                            >
                                {isEditing ? 'Save Changes' : 'Upload Image'}
                            </button>
                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={() => setEditingImage(null)}
                                    className="px-6 py-3 text-pink-600 font-semibold rounded-lg shadow-md bg-white border border-pink-600 hover:bg-pink-50 transition duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- Image List Rendering --- */}
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Image Gallery</h2>
                {imageGallery}
                
            </div>
        </div>
    );
};

export default ImageCRUD;