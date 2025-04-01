import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import ChatModel from './components/Chat-model/ChatModel';
import VectorEmbedding from "./components/vector-embedding/VectorEmb";
import LoginForm from './components/Login-page/LoginForm';
import { useEffect, useState } from 'react';
import SignUpForm from './components/SignUp-page/SignUpForm';

const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
           </div>;
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
          path = "/signup"
          element ={<SignUpForm/>}
        />

        <Route 
          path="/vector" 
          element={isAuthenticated ? <VectorEmbedding /> : <LoginForm />} />
        
        {/* Fallback route */}
        <Route path="*" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;