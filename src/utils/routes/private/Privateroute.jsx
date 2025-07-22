import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/Authcontext'
import { useEffect } from 'react'

const PrivateRoutes = () => {
    const { userInfo } = useAuth()
    const navigate = useNavigate()

    return userInfo ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoutes