// Hamburgermenu.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Hamburgermenu.css';
import 'font-awesome/css/font-awesome.min.css';
import { useAuth } from './AuthContext';

const Hamburgermenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(null);

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/signin');
  };

  const handleClickLink = () => {
    setMenuOpen(false);
  }

  const checkAdminStatus = async (id) => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/admin/checkAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id
        }),
      });
      const data = await response.json();

      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus(user.User_ID);
    } else {
      setIsAdmin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="hamburger-container">
      <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <i className={menuOpen ? 'fa fa-times' : 'fa fa-bars'}></i>
      </button>
      <div className={`menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/search" onClick={handleClickLink} style={{ color: 'white' }}>Search</Link></li>
          <li><Link to="/history" onClick={handleClickLink} style={{ color: 'white' }}>History</Link></li>
          <li><Link to="/bookmark" onClick={handleClickLink} style={{ color: 'white' }}>Bookmark</Link></li>
          {isAdmin && (<li><Link to="/admin" onClick={handleClickLink} style={{ color: 'white' }}>Admin</Link></li>)}
          <li><Link to="/edituser" onClick={handleClickLink} style={{ color: 'white' }}>Profile</Link></li>
          <li><button onClick={handleLogout} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button></li>
        </ul>
      </div>
    </div>
  );
};

export default Hamburgermenu;
