import Fib from './Fib';
import OtherPage from './otherPage';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import './App.css'

function App() {
  return (
    <Router>
      <div>
        <Link to="/" style={{ padding: '10px' }}>Home</Link>
        <Link to="/other" style={{ padding: '10px' }}>Other Page</Link>
      </div>
        <Routes>
          <Route path="/" exact element={<Fib />} />
          <Route path="/other" element={<OtherPage />} />
        </Routes>

    </Router>
  );
}



export default App
