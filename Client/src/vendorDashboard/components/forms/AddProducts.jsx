import React, { useState } from 'react';
import { API_URL } from '../../data/apiPath';

const AddProducts = () => {
  const [productname, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState([]);
  const [bestSeller, setBestSeller] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleBestSellerChange = (e) => {
    setBestSeller(e.target.value === 'true');
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginToken = localStorage.getItem('loginToken');
      const firmId = localStorage.getItem('firmId');

      if (!loginToken || !firmId) {
        console.error("User not authenticated");
        return;
      }

      const formData = new FormData();
      formData.append('productname', productname);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('bestSeller', bestSeller);
      if (file) formData.append('image', file);
      category.forEach(cat => formData.append('category', cat));

      const response = await fetch(`${API_URL}/product/add-product/${firmId}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added successfully");
      }
        setProductName("");
        setPrice("");
        setCategory([]);
        setBestSeller(false);
        setDescription("");
        setFile(null);
        
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  return (
    <div className="firmSection">
      <form className="tableform" onSubmit={handleSubmit}>
        <h2>Add Products</h2>

        <label>Product Name</label>
        <input type="text" value={productname} onChange={e => setProductName(e.target.value)} />

        <label>Price</label>
        <input type="text" value={price} onChange={e => setPrice(e.target.value)} />

        <label>Category</label>
        <div className="inputsContainer">
          <label>
            <input type="checkbox" value="veg" checked={category.includes("veg")} onChange={handleCategoryChange} /> Veg
          </label>
          <label>
            <input type="checkbox" value="non-veg" checked={category.includes("non-veg")} onChange={handleCategoryChange} /> Non-Veg
          </label>
        </div>

        <label>Best Seller</label>
        <div className="inputsContainer">
          <label>
            <input type="radio" value="true" checked={bestSeller === true} onChange={handleBestSellerChange} /> Yes
          </label>
          <label>
            <input type="radio" value="false" checked={bestSeller === false} onChange={handleBestSellerChange} /> No
          </label>
        </div>

        <label>Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} />

        <label>Product Image</label>
        <input type="file" onChange={handleFileUpload} />

        <div className="submitButton">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
