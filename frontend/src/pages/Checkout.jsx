import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/orderApi';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address,  setAddress]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const items = cart.map(i => ({ variant_id: i.variant_id, quantity: i.quantity }));
      const { data } = await placeOrder(address, items);
      clearCart();
      navigate(`/orders`, { state: { newOrderId: data.order_id } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32, marginBottom: 40,
        }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40 }}>

          {/* Shipping Form */}
          <div className="fade-up">
            <div style={{
              background: 'var(--white)',
              borderRadius: 8, padding: 32,
              border: '1px solid var(--light)',
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, marginBottom: 24,
              }}>
                Shipping Details
              </h2>

              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  color: 'var(--danger)', borderRadius: 6,
                  padding: '10px 14px', fontSize: 13, marginBottom: 20,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, City, Province, Postal Code"
                    rows={4} required
                    style={{
                      padding: '12px 14px',
                      border: '1px solid var(--light)',
                      borderRadius: 6, fontSize: 14, resize: 'vertical',
                      fontFamily: "'DM Sans', sans-serif",
                      color: 'var(--dark)', background: 'var(--white)', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--light)'}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  background: loading ? 'var(--mid)' : 'var(--dark)',
                  color: 'white', border: 'none',
                  padding: '14px', borderRadius: 6,
                  fontSize: 14, fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {loading ? 'Placing Order…' : `CONFIRM ORDER — $${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 8, padding: 24,
            border: '1px solid var(--light)',
            height: 'fit-content',
            position: 'sticky', top: 80,
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, marginBottom: 20,
            }}>
              Your Order
            </h3>
            {cart.map(item => (
              <div key={item.variant_id} style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 12, gap: 12,
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{item.product_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--mid)' }}>
                    {item.size} · {item.color} · ×{item.quantity}
                  </p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            <div style={{
              borderTop: '1px solid var(--light)',
              marginTop: 16, paddingTop: 16,
              display: 'flex', justifyContent: 'space-between',
              fontWeight: 700, fontSize: 16,
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--gold)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--mid)',
};