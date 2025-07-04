import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/Authcontext'

const PrivateRoutes = () => {
    const { userInfo } = useAuth()

    return userInfo ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoutes