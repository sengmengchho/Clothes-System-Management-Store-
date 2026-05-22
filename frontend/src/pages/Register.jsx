import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser(form);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      const data = err.response?.data;
      if (data?.email)    setError(data.email[0]);
      else if (data?.error) setError(data.error);
      else                setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      padding: 24,
    }}>
      <div className="fade-up" style={{
        background: 'var(--white)',
        borderRadius: 12,
        padding: 48,
        width: '100%',
        maxWidth: 480,
        border: '1px solid var(--light)',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--dark)',
            marginBottom: 32,
          }}>
            CLOTH<span style={{ color: 'var(--gold)' }}>STORE</span>
          </p>
        </Link>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          marginBottom: 6,
          color: 'var(--dark)',
        }}>
          Create account
        </h2>
        <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 32 }}>
          Join us for a curated shopping experience
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: 'var(--danger)', borderRadius: 6,
            padding: '10px 14px', fontSize: 13, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Full Name"  name="name"  type="text"  value={form.name}  onChange={handleChange} placeholder="Your name" />
            <Field label="Phone"      name="phone" type="tel"   value={form.phone} onChange={handleChange} placeholder="+855..." required={false} />
          </div>
          <Field label="Email"    name="email"    type="email"    value={form.email}    onChange={handleChange} placeholder="you@email.com" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--mid)' }}>
              Address <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              name="address" value={form.address} onChange={handleChange}
              placeholder="Your delivery address"
              rows={2}
              style={{
                padding: '11px 14px', border: '1px solid var(--light)',
                borderRadius: 6, fontSize: 14, resize: 'vertical',
                fontFamily: "'DM Sans', sans-serif", color: 'var(--dark)',
                background: 'var(--white)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e  => e.target.style.borderColor = 'var(--light)'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: 8,
            background: loading ? 'var(--mid)' : 'var(--dark)',
            color: 'white', border: 'none',
            padding: '14px', borderRadius: 6,
            fontSize: 14, fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {loading ? 'Creating account…' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mid)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder, required = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--mid)' }}>
        {label}
      </label>
      <input
        name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder} required={required}
        style={{
          padding: '11px 14px', border: '1px solid var(--light)',
          borderRadius: 6, fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          background: 'var(--white)', color: 'var(--dark)', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e  => e.target.style.borderColor = 'var(--light)'}
      />
    </div>
  );
}