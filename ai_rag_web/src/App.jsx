import './App.css';
import ChatModel from './components/Chat-model/ChatModel';
// import VectorEmbedding from "./components/vecto/r-embedding/VectorEmb";

const App = () => {
  

  return (
    <div className='app-root'>
      <ChatModel/>
      {/* <VectorEmbedding/> */}
    </div>
  );
}

export default App;