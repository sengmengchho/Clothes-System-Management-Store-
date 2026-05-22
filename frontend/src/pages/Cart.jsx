import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 24px' }}>
          <p style={{ fontSize: 48, marginBottom: 20 }}>🛍</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28, marginBottom: 12,
          }}>
            Your cart is empty
          </h2>
          <p style={{ color: 'var(--mid)', marginBottom: 32 }}>
            Discover something you love
          </p>
          <button onClick={() => navigate('/')} style={btnDark}>
            BROWSE COLLECTION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32, marginBottom: 36,
        }}>
          Shopping Cart
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cart.map(item => (
              <div key={item.variant_id} className="fade-up" style={{
                background: 'var(--white)',
                borderRadius: 8,
                padding: 20,
                border: '1px solid var(--light)',
                display: 'flex',
                gap: 20,
                alignItems: 'center',
              }}>
                {/* Image placeholder */}
                <div style={{
                  width: 80, height: 80,
                  background: '#F0EFE9',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 28, opacity: 0.3 }}>👔</span>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16, fontWeight: 500, marginBottom: 4,
                  }}>
                    {item.product_name}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 12 }}>
                    {item.size} · {item.color}
                    {item.sku && <span style={{ marginLeft: 8 }}>#{item.sku}</span>}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Qty */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: '1px solid var(--light)', borderRadius: 4,
                    }}>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        style={qtyBtnStyle}>−</button>
                      <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        style={qtyBtnStyle}>+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--mid)', fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        textDecoration: 'underline',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p style={{ fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div style={{
              background: 'var(--white)',
              borderRadius: 8,
              padding: 28,
              border: '1px solid var(--light)',
              position: 'sticky',
              top: 80,
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, marginBottom: 24,
              }}>
                Order Summary
              </h3>

              {cart.map(item => (
                <div key={item.variant_id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: 10, fontSize: 14,
                }}>
                  <span style={{ color: 'var(--mid)' }}>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div style={{
                borderTop: '1px solid var(--light)',
                marginTop: 16, paddingTop: 16,
                display: 'flex', justifyContent: 'space-between',
                fontSize: 18, fontWeight: 700,
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)' }}>${total.toFixed(2)}</span>
              </div>

              <button onClick={() => navigate('/checkout')} style={{ ...btnDark, marginTop: 24, width: '100%' }}>
                PROCEED TO CHECKOUT
              </button>
              <button onClick={() => navigate('/')} style={{
                marginTop: 12, width: '100%',
                background: 'none', border: '1px solid var(--light)',
                padding: '12px', borderRadius: 6,
                fontSize: 13, fontWeight: 600,
                letterSpacing: '0.05em', cursor: 'pointer',
                color: 'var(--mid)',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnDark = {
  background: 'var(--dark)', color: 'white',
  border: 'none', padding: '14px 28px',
  borderRadius: 6, fontSize: 13,
  fontWeight: 600, letterSpacing: '0.05em',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};

const qtyBtnStyle = {
  width: 32, height: 34,
  background: 'none', border: 'none',
  fontSize: 16, cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  color: 'var(--dark)',
};