import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import ChatPage from './pages/chat/ChatPage'
import ProfilePage from './pages/chat/Profile'
import CustomerChat from './pages/support/CustomerChat'
import useAuthStore from '../store/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retryOnMount: true,
    },
  },
});

const App = () => {
  const { userInfo } = useAuthStore();

  useEffect(() => {
    Notification.requestPermission((result) => {
      console.log(result);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ChatPage />} />
          {/* Keep /chat as alias for backward compat */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/support/chat" element={<CustomerChat />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-6">Page not found</p>
                <a href="/" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-violet-700 transition">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App