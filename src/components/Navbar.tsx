import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          <Link2 size={24} />
          <span>ShortLink</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated && user ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}
              >
                <UserIcon size={16} />
                <span>{user.email}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 0.85rem' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};