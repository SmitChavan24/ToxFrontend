import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Captureface from './pages/register/Captureface'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/captureface" element={<Captureface />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App