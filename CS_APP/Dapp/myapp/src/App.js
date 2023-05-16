
import Header from './Components/Header';
import './App.css';
import Home from './Components/Home';
import ListNFT from './Components/Listing';
import MyNFT from './Components/MyNFT';
import MyProfile from './Components/MyProfile';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Upload" element={<ListNFT/>} />
        <Route path="/MyNFT" element={<MyNFT/>}/>
        <Route path="/MyProfile" element={<MyProfile/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
