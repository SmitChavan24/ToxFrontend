import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import { AuthProvider } from './context/Authcontext'
import Captureface from './pages/register/Captureface'
import PrivateRoutes from './utils/routes/private/Privateroute'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import ChatPage from './pages/chat/ChatPage'
import FaceCapture from './pages/landing/FaceCapture'
import PublicRoutes from './utils/routes/Publicroute'
import useAuthStore from '../store/store'
// navigator.serviceWorker.register("sw.js");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retryOnMount: true,
    },
  },
});

const App = () => {
  // const loadFromLocalStorage = useAuthStore(state => state.loadFromLocalStorage);
  const { userInfo, history } = useAuthStore();
  useEffect(() => {
    Notification.requestPermission((result) => {
      console.log(result);
    });
    // loadFromLocalStorage();
    // console.log(userInfo, "adfafafss", history)
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      {/* <AuthProvider> */}
      <BrowserRouter>
        <Routes>
          {/* <Route element={<PublicRoutes />}> */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<h1>Page not found</h1>} />
          {/* </Route> */}


          <Route path="/chat" element={<ChatPage />} />
          <Route path="/captureface" element={<Captureface />} />
          <Route path="/facecapture" element={<FaceCapture />} />
          {/* <Route element={<PrivateRoutes />}> */}
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
      {/* </AuthProvider> */}
    </QueryClientProvider>
  )
}

export default App