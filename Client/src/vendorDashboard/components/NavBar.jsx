import React from 'react'

const NavBar = ({showLoginHandler,showRegisterHandler,showLogout,logoutHandler}) => {
  return (
    <div className="navSection">
        <div className="company">
            Vendor DashBoard
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