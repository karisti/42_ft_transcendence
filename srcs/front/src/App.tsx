import React, { useState, ReactElement, useEffect } from 'react';
import './assets/css/index.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Homepage';
import Options from './pages/Options';
import GameSelector from './pages/GameSelector';
import PongPage from './pages/Pong';
import Register from './pages/Register';
import PreRegister from './pages/PreRegister';
import { getUserProfile } from './requests/User.Service';
import PermissionDenied from './pages/PermissionDenied';
import Administration from './pages/Administration';
import Perfil from './pages/Perfil';
import Leaderboard from './pages/Leaderboard';

import { SocketProvider1, SocketProvider2 } from './SocketContext';
import GameFriends from './pages/GameDuel';
import Verify2FA from './pages/Verify2fa';


const useAuth = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const userProfile = await getUserProfile();
        console.log(userProfile.siteAdmin);
        setIsAdmin(userProfile.siteAdmin);
        setIsLoading(false);
      } catch (error) {
        console.log("error");
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    fetchAdminStatus();
  }, []);

  return { isAdmin, isLoading };
};

function ProtectedComponent({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuth();
  return isAuthenticated ? children : <PermissionDenied />;
}

function GuestComponent({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuth();
  return !isAuthenticated ? children : <Navigate to="/homepage" replace />;
}

function AdminComponent({ children }: { children: React.ReactElement }) {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/homepage" replace />;
}
function App() {
  return (
    <BrowserRouter>
      <SocketProvider1>
        <SocketProvider2>
          <div style={{
            backgroundColor: '#0E1625',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
          }}></div>
          <Routes>
            <Route path="/" element={<GuestComponent><PreRegister /></GuestComponent>} />
            <Route path="/verify2fa" element={<GuestComponent><Verify2FA /></GuestComponent>} />
            
            <Route path="/register" element={<GuestComponent><Register /></GuestComponent>} /> 
            <Route path="/denied" element={<GuestComponent><PermissionDenied /></GuestComponent>} />

            <Route path="/homepage" element={<ProtectedComponent><Home /></ProtectedComponent>} />
            <Route path="/settings" element={<ProtectedComponent><Options /></ProtectedComponent>} />
            
            <Route path="/pong" element={<ProtectedComponent><PongPage gameType={true}/></ProtectedComponent>} />
            <Route path="/pong/:gameUserId" element={<ProtectedComponent><PongPage gameType={true}/></ProtectedComponent>} />
            <Route path="/pong-alter" element={<ProtectedComponent><PongPage gameType={false}/></ProtectedComponent>} />
            <Route path="/pong-alter/:gameUserId" element={<ProtectedComponent><PongPage gameType={false}/></ProtectedComponent>} />
            
            <Route path="/pong/spectate/:spectateUserId" element={<ProtectedComponent><PongPage gameType={true}/></ProtectedComponent>} />
            <Route path="/pong-alter/spectate/:spectateUserId" element={<ProtectedComponent><PongPage gameType={false}/></ProtectedComponent>} />

            <Route path="/game-selector" element={<ProtectedComponent><GameSelector /></ProtectedComponent>} />
            <Route path="/game-friends" element={<ProtectedComponent><GameFriends /></ProtectedComponent>} />
            <Route path="/leaderboard" element={<ProtectedComponent><Leaderboard /></ProtectedComponent>} />
            <Route path="/perfil" element={<ProtectedComponent><Perfil /></ProtectedComponent>} />
            <Route path="/perfil/:username" element={<ProtectedComponent><Perfil /></ProtectedComponent>} />
            
            <Route path="/administration" element={<AdminComponent><Administration /></AdminComponent>} />
          </Routes>
        </SocketProvider2>
      </SocketProvider1>
    </BrowserRouter>
  );
}

export default App;
