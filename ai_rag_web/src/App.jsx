import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import ChatModel from './components/Chat-model/ChatModel';
import VectorEmbedding from "./components/vector-embedding/VectorEmb";
import LoginForm from './components/Login-page/LoginForm';
import { useEffect, useState } from 'react';

const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, []);

  // Don't render anything until we've checked authentication
  if (!authChecked) {
    return null; // or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Public route - no redirection */}
        <Route path="/" element={<LoginForm />} />
        
        {/* Protected routes */}
        <Route 
          path="/home" 
          element={isAuthenticated ? <ChatModel /> : <LoginForm />} 
        />
        <Route 
          path="/vector" 
          element={isAuthenticated ? <VectorEmbedding /> : <LoginForm />} 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;