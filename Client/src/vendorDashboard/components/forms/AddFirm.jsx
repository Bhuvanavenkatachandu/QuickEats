import React,{useState} from 'react';
import { API_URL } from '../../data/apiPath';

const AddFirm = () => {
  const [firmName,setFirmName]=useState("");
  const [area,setArea]=useState("");
  const [category,setCategory]=useState([]);
  const [region,setRegion]=useState([]);
  const [offer,setOffer]=useState("");
  const [file,setfile]=useState(null);

  const handleCategoryChange=(e)=>{
    const value=e.target.value;
    if(category.includes(value)){
      setCategory(category.filter((item)=>item!==value));
    }else{
      setCategory([...category,value]);
    }
  };

  const handleRegionChange=(e)=>{
    const value=e.target.value;
    if(region.includes(value)){
      setRegion(region.filter((item)=>item!==value));
    }else{
      setRegion([...region,value]);
    }
  };

  const handleImageUpload=(e)=>{
    const selectedFile=e.target.files[0];
    setfile(selectedFile);
  };

  const handleFirmSubmit=async(e)=>{
    e.preventDefault();
    try{
      const loginToken=localStorage.getItem('loginToken');
      if(!loginToken){
        console.error("User is not authenticated");
        return;
      }
      const formData=new FormData();
      formData.append('firmname',firmName);
      formData.append('area',area);
      formData.append('offer',offer);
      category.forEach((val)=>{formData.append('category',val)});
      region.forEach((val)=>{formData.append('region',val)});
      if(file){formData.append('image',file)}

      const response=await fetch(`${API_URL}/firm/add-firm`,{
        method:'POST',
        headers:{
          'token':loginToken
        },
        body:formData
      });
      const data=await response.json();
      if(response.ok){
        console.log(data);
        setFirmName("");
        setArea("");
        setCategory([]);
        setRegion([]);
        setOffer("");
        setfile(null);
        alert("Firm added successfully");
      }else if(data.message === "vendor can have only one firm"){
              alert("Firm Exists 🥗. Only 1 firm can be added  ")
          } else{
              alert('Failed to add Firm')
          }
          const firmId = data.firmId;
          localStorage.setItem('firmId', firmId);
          window.location.reload();
    }catch(error){
      console.error("Error submitting form:",error);
      alert("Failed to submit form");
    }
  };

  return(
    <div className="firmSection">
      <form className="tableform" onSubmit={handleFirmSubmit}>
        <h2>Add Firm</h2>
        <label>Firm Name</label>
        <input type="text" value={firmName} onChange={(e)=>setFirmName(e.target.value)} />

        <label>Area</label>
        <input type="text" value={area} onChange={(e)=>setArea(e.target.value)} />

        <div className="checkInp">
          <label>Category</label>
          <div className="inputsContainer">
            <div className="checkboxContainer">
              <label>Veg</label>
              <input type="checkbox" checked={category.includes("veg")} value="veg" onChange={handleCategoryChange}/>
            </div>
            <div className="checkboxContainer">
              <label>Non-Veg</label>
              <input type="checkbox" checked={category.includes("non-veg")} value="non-veg" onChange={handleCategoryChange}/>
            </div>
          </div>
        </div>

        <div className="check-Inp">
          <label>Region</label>
          <div className="inputs-Container">
            <div className="checkbox-Container">
              <label>North-Indian</label>
              <input type="checkbox" checked={region.includes("North-Indian")} value="North-Indian" onChange={handleRegionChange}/>
            </div>
            <div className="checkbox-Container">
              <label>South-Indian</label>
              <input type="checkbox" checked={region.includes("South-Indian")} value="South-Indian" onChange={handleRegionChange}/>
            </div>
            <div className="checkbox-Container">
              <label>Chinese</label>
              <input type="checkbox" checked={region.includes("Chinese")} value="Chinese" onChange={handleRegionChange}/>
            </div>
            <div className="checkbox-Container">
              <label>Bakery</label>
              <input type="checkbox" checked={region.includes("Bakery")} value="Bakery" onChange={handleRegionChange}/>
            </div>
          </div>
        </div>

        <label>Offers</label>
        <input type="text" value={offer} onChange={(e)=>setOffer(e.target.value)} placeholder="Enter offer (e.g., 50% off)"/>

        <label>Firm Image</label>
        <input type="file" onChange={handleImageUpload}/>
        <br/>

        <div className="submitButton">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddFirm;
