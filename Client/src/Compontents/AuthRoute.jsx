import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { Context } from '../main.jsx'

const AuthRoute = () => {

  const { isAuthenticated } = useContext(Context)

  if (!isAuthenticated) {
    console.log("NOT Authenticated....");
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}

export default AuthRoute