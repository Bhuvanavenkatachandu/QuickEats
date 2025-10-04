import React from 'react'
import LandingPage from './vendorDashboard/pages/LandingPage'
import "./App.css";
import {Routes,Route} from 'react-router-dom';
import Login from './vendorDashboard/components/forms/Login';
import PageNotFound from './vendorDashboard/components/forms/PageNotFound';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/*' element={<PageNotFound/>}/>
      </Routes>
    </div>
  )
}

export default App