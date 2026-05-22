import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { itemCount }     = useCart();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--light)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--dark)',
            letterSpacing: '0.03em',
          }}>
            CLOTH<span style={{ color: 'var(--gold)' }}>STORE</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <NavLink to="/" active={isActive('/')}>Shop</NavLink>

          {user?.role === 'Customer' && (
            <>
              <NavLink to="/orders" active={isActive('/orders')}>Orders</NavLink>
              <Link to="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
                <span style={{
                  fontSize: 20,
                  color: isActive('/cart') ? 'var(--gold)' : 'var(--dark)',
                }}>🛍</span>
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    background: 'var(--gold)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user?.role === 'Admin' && (
            <NavLink to="/admin" active={isActive('/admin')}>Dashboard</NavLink>
          )}

          {user?.role === 'Sale' && (
            <NavLink to="/sale" active={isActive('/sale')}>Dashboard</NavLink>
          )}

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                fontSize: 13,
                color: 'var(--mid)',
                fontWeight: 500,
              }}>
                {user.name}
              </span>
              <button onClick={handleLogout} style={{
                background: 'none',
                border: '1px solid var(--light)',
                padding: '6px 16px',
                borderRadius: 4,
                fontSize: 13,
                cursor: 'pointer',
                color: 'var(--mid)',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--dark)'; e.target.style.color = 'var(--dark)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--light)'; e.target.style.color = 'var(--mid)'; }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={{
              background: 'var(--dark)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.03em',
              transition: 'background 0.2s',
            }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: active ? 'var(--gold)' : 'var(--dark)',
      borderBottom: active ? '1px solid var(--gold)' : '1px solid transparent',
      paddingBottom: 2,
      transition: 'color 0.2s',
    }}>
      {children}
    </Link>
  );
}