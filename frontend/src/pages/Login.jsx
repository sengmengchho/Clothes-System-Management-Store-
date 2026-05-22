import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if      (user.role === 'Admin')    navigate('/admin');
      else if (user.role === 'Sale')     navigate('/sale');
      else                               navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--cream)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        background: 'var(--dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 48,
          color: 'var(--white)',
          lineHeight: 1.15,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          Dressed<br />
          <em style={{ color: 'var(--gold)' }}>to impress.</em>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 15,
          textAlign: 'center',
          maxWidth: 280,
        }}>
          Premium clothing for every occasion. Sign in to explore the collection.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30,
            marginBottom: 8,
            color: 'var(--dark)',
          }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 36 }}>
            Sign in to your account
          </p>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: 'var(--danger)',
              borderRadius: 6,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Email" name="email" type="email"
              value={form.email} onChange={handleChange} placeholder="you@email.com" />
            <Field label="Password" name="password" type="password"
              value={form.password} onChange={handleChange} placeholder="••••••••" />

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                background: loading ? 'var(--mid)' : 'var(--dark)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'SIGN IN'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mid)', textAlign: 'center' }}>
            New customer?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--mid)' }}>
        {label}
      </label>
      <input
        name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder} required
        style={{
          padding: '11px 14px',
          border: '1px solid var(--light)',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          background: 'var(--white)',
          color: 'var(--dark)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e  => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e   => e.target.style.borderColor = 'var(--light)'}
      />
    </div>
  );
}