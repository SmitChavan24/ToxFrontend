import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'

const PublicRoutes = ({ children }) => {
    const { userInfo } = useAuth()

    return userInfo ? <Navigate to="/chat" /> : children
}

export default PublicRoutes