import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import ChatModel from './components/Chat-model/ChatModel';
import VectorEmbedding from "./components/vector-embedding/VectorEmb";
import LoginForm from './components/Login-page/LoginForm';

const App = () => {
  

  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<LoginForm/>}/>
        <Route path = "/home" element = {<ChatModel/>} / >
        <Route path = "/vector" element = {<VectorEmbedding/>} / >
      </Routes>
    </Router>
  );
}

export default App;