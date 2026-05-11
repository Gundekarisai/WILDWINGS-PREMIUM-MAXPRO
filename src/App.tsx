import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import DiningPage from './pages/DiningPage';
import FacilitiesPage from './pages/FacilitiesPage';
import ContactPage from './pages/ContactPage';
import ManagerLogin from './pages/ManagerLogin';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/dining" element={<DiningPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
