import Fib from './Fib';
import OtherPage from './otherPage';
import ChatComponent from './ChatComponent';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import './App.css'

function App() {
  return (
    <Router>
      <div>
        <Link to="/" style={{ padding: '10px' }}>Home</Link>
        <Link to="/other" style={{ padding: '10px' }}>Other Page</Link>
        <Link to="/chat" style={{ padding: '10px' }}>AI Chat</Link>
      </div>
        <Routes>
          <Route path="/" exact element={<Fib />} />
          <Route path="/other" element={<OtherPage />} />
          <Route path="/chat" element={<ChatComponent />} />
        </Routes>

    </Router>
  );
}



export default App
