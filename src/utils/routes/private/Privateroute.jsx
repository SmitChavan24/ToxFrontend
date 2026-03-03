import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../../../../store/store'

const PrivateRoutes = () => {
    const { userInfo, loadFromLocalStorage } = useAuthStore()
    const [isRestoring, setIsRestoring] = useState(!userInfo && !!localStorage.getItem('UserInfo'))

    useEffect(() => {
        if (!userInfo && localStorage.getItem('UserInfo')) {
            loadFromLocalStorage()
        }
        setIsRestoring(false)
    }, [])

    if (isRestoring) return null

    return userInfo ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoutes