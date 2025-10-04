import React from 'react'
import {Link} from 'react-router-dom'
const PageNotFound = () => {
  return (
    <div className='page-not-found'>
      <p>Page Not Found</p>
      <Link to="/">Go to Home</Link>
    </div>
  )
}

export default PageNotFound