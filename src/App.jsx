import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Captureface from './pages/register/Captureface'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import ChatPage from './pages/chat/ChatPage'
import FaceCapture from './pages/landing/FaceCapture'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retryOnMount: true,
    },
  },
});

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/captureface" element={<Captureface />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/facecapture" element={<FaceCapture />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App