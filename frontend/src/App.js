// frontend/src/App.js
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import VendorTree from './pages/VendorTree';
import { getToken, getUser } from './utils/auth';
import Navbar from './components/Navbar';
import SupervendorDashboard from './pages/SupervendorDashboard';
import SubvendorDashboard from './pages/SubvendorDashboard';


function Protected({ children, role }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" />;
  const user = getUser();
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  const { pathname } = useLocation();
  // hide navbar on these two paths
  const hideNavOn = ['/login', '/signup'];
  const showNavbar = !hideNavOn.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <Protected>
            <VendorTree />
          </Protected>
        } />
        <Route path="/admin" element={
          <Protected adminOnly>
            <AdminDashboard />
          </Protected>
        } />
        <Route path="/supervendor" element={
          <Protected role="supervendor">
            <SupervendorDashboard />
          </Protected>
        } />
        <Route path="/subvendor" element={
          <Protected role="subvendor">
            <SubvendorDashboard />
          </Protected>
        } />



        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Optionally: catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
