import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMyOrders } from '../api/orderApi';

const STATUS_COLORS = {
  Pending:    { bg: '#FEF9EC', color: '#B7791F' },
  Paid:       { bg: '#EBF8FF', color: '#2B6CB0' },
  Processing: { bg: '#EBF8FF', color: '#2B6CB0' },
  Shipped:    { bg: '#F0FFF4', color: '#276749' },
  Delivered:  { bg: '#F0FFF4', color: '#276749' },
  Cancelled:  { bg: '#FFF5F5', color: '#C53030' },
};

export default function OrderHistory() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();

  const newOrderId = location.state?.newOrderId;

  useEffect(() => {
    getMyOrders()
      .then(r => {
        setOrders(r.data);
        if (newOrderId) setExpanded(newOrderId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32, marginBottom: 10,
        }}>
          My Orders
        </h1>
        <p style={{ color: 'var(--mid)', marginBottom: 36, fontSize: 14 }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>

        {newOrderId && (
          <div style={{
            background: '#F0FFF4', border: '1px solid #9AE6B4',
            borderRadius: 8, padding: '14px 20px',
            fontSize: 14, color: '#276749',
            marginBottom: 24, fontWeight: 500,
          }}>
            ✓ Order #{newOrderId} placed successfully!
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading your orders…" />
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📦</p>
            <p style={{ color: 'var(--mid)', fontSize: 16 }}>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => {
              const statusStyle = STATUS_COLORS[order.status] || { bg: '#F7FAFC', color: '#4A5568' };
              const isOpen = expanded === order.order_id;

              return (
                <div key={order.order_id} className="fade-up" style={{
                  background: 'var(--white)',
                  borderRadius: 8,
                  border: isOpen ? '1px solid var(--gold)' : '1px solid var(--light)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}>
                  {/* Header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : order.order_id)}
                    style={{
                      padding: '18px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>
                        Order #{order.order_id}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--mid)' }}>
                        {new Date(order.ordered_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{
                        background: statusStyle.bg, color: statusStyle.color,
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {order.status}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>
                        ${parseFloat(order.total_price).toFixed(2)}
                      </span>
                      <span style={{ color: 'var(--mid)', fontSize: 18 }}>
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isOpen && (
                    <div style={{
                      borderTop: '1px solid var(--light)',
                      padding: '20px 24px',
                      background: 'var(--cream)',
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--mid)', marginBottom: 14 }}>
                        Items
                      </p>
                      {order.items?.map(item => (
                        <div key={item.item_id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginBottom: 10, fontSize: 14,
                        }}>
                          <span>
                            {item.product_name} — {item.size} / {item.color} × {item.quantity}
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            ${parseFloat(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <p style={{
                        marginTop: 14, fontSize: 13,
                        color: 'var(--mid)', fontStyle: 'italic',
                      }}>
                        Ship to: {order.shipping_address}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}