import React,{useEffect, useState} from 'react'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import Login from '../components/forms/Login'
import Register from '../components/forms/Register'
import AddFirm from '../components/forms/AddFirm'
import AddProducts from '../components/forms/AddProducts'
import Welcome from '../components/Welcome'
import AllProducts from '../components/AllProducts'

const LandingPage = () => {

  const[showLogin,setShowLogin]=useState(false);
  const[showRegister,setShowRegister]=useState(false);
  const[showAddFirm,setShowAddFirm]=useState(false);
  const[showAddProducts,setShowAddProducts]=useState(false);
  const[showWelcome,setShowWelcome]=useState(true);
  const[showAllProducts, setShowAllProducts]=useState(false);
  const[showLogout,setShowLogout]=useState(false);
  const[showFirmTitle,setShowFirmTitle]=useState(true);

  useEffect(()=>{
    const firmName = localStorage.getItem('firmName');
    if(firmName){
        setShowFirmTitle(false);
    }
  },[]);

  useEffect(()=>{
    const loginToken = localStorage.getItem('loginToken');
    if(loginToken){
        setShowLogout(true);
    }
  },[]);

  const logoutHandler = () => {
    confirm("Are you sure you want to logout?");
    localStorage.removeItem('loginToken');
    localStorage.removeItem('firmId');
    localStorage.removeItem('firmName');
    setShowLogout(false);
    setShowFirmTitle(true);
  }


  const showAddProductsHandller =()=>{
    if(showLogout){
    setShowAddProducts(true);
    setShowAddFirm(false);
    setShowRegister(false);
    setShowLogin(false);
    setShowWelcome(false);
    setShowAllProducts(false);
    }else{
        alert('Please login to add products');
        setShowLogin(true);
    }
  }
  const showAddFirmHandler =()=>{
    if(showLogout){
    setShowAddFirm(true);
    setShowAddProducts(false);
    setShowRegister(false);
    setShowLogin(false);
    setShowWelcome(false);
    setShowAllProducts(false);
    }else{
        alert('Please login to add firm');
        setShowLogin(true);
    }
  }

  const showLoginHandler =()=>{
    setShowLogin(true);
    setShowAddProducts(false);
    setShowAddFirm(false);
    setShowRegister(false);
    setShowWelcome(false);
    setShowAllProducts(false);
  }

  const showWelcomeHandler =()=>{
    setShowLogin(false);
    setShowAddProducts(false);
    setShowAddFirm(false);
    setShowRegister(false);
    setShowWelcome(true);
    setShowAllProducts(true);
  }

  const showRegisterHandler =()=>{
    setShowRegister(true);
    setShowAddProducts(false);
    setShowAddFirm(false);
    setShowLogin(false);
    setShowWelcome(false);
    setShowAllProducts(false);
  }

  const showAllProductsHandler = () => {
    if(showLogout){
    setShowRegister(false);
    setShowLogin(false);
    setShowAddFirm(false);
    setShowAddProducts(false);
    setShowWelcome(false);
    setShowAllProducts(true);
    }else{
        alert('Please login to view products');
        setShowLogin(true);
    }
  };


  return (
    <>
    <section className="landing-section">
        <NavBar showLoginHandler = {showLoginHandler} showRegisterHandler={showRegisterHandler} showLogout={showLogout} 
        logoutHandler={logoutHandler} />
        <div className="collectionSection">
        <SideBar showAddFirmHandler={showAddFirmHandler} showAddProductsHandller={showAddProductsHandller} showAllProductsHandler={showAllProductsHandler} 
        showFirmTitle={showFirmTitle} />
        {showLogin && <Login showWelcomeHandler={showWelcomeHandler}/>}
        {showRegister && <Register showLoginHandler={showLoginHandler}/>}
        {showAddFirm && showLogout && <AddFirm />}
        {showAddProducts && showLogout && <AddProducts />}
        {showWelcome && <Welcome />}
        {showAllProducts && showLogout && <AllProducts />}
        </div>
    </section>
    </>
  )
}

export default LandingPage