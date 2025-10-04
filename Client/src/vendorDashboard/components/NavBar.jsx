import React from 'react'

const NavBar = ({showLoginHandler,showRegisterHandler,showLogout,logoutHandler}) => {

  const firmName = localStorage.getItem('firmName');
  return (
    <div className="navSection">
        <div className="company">
            Vendor DashBoard
        </div>
        <div className="firmName">
          <h4>Firm Name : {firmName}</h4>
        </div>
        <div className="userAuth">
          {!showLogout ? <>
            <span onClick={showLoginHandler}>Login / </span>
            <span onClick={showRegisterHandler}>Register</span>
          </> : <span onClick={logoutHandler}
          className='logout'
          >Logout</span>}
        </div>
    </div>
  )
}

export default NavBar