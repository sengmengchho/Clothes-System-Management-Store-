import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllOrders, updateOrderStatus, getLowStock } from '../../api/orderApi';

const STATUS_COLORS = {
  Pending:    '#B7791F', Paid:       '#2B6CB0',
  Processing: '#2B6CB0', Shipped:    '#276749',
  Delivered:  '#276749', Cancelled:  '#C53030',
};

const NEXT_STATUS = {
  Pending: ['Paid', 'Cancelled'],
  Paid: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
};

export default function SaleDashboard() {
  const [orders,   setOrders]   = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [tab,      setTab]      = useState('orders');
  const [loading,  setLoading]  = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    Promise.all([
      getAllOrders(statusFilter ? { status: statusFilter } : {}),
      getLowStock(10),
    ]).then(([o, l]) => {
      setOrders(o.data);
      setLowStock(l.data.variants);
    }).finally(() => setLoading(false));
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o =>
        o.order_id === orderId ? { ...o, status: newStatus } : o
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>
            Sale Staff
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32 }}>
            Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32,
          borderBottom: '1px solid var(--light)', paddingBottom: 0 }}>
          {['orders', 'low-stock'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 24px',
              background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--dark)' : '2px solid transparent',
              fontSize: 13, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', color: tab === t ? 'var(--dark)' : 'var(--mid)',
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: -1,
            }}>
              {t === 'orders' ? `Orders (${orders.length})` : `Low Stock (${lowStock.length})`}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <>
                {/* Status filter */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  {['', 'Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{
                      padding: '6px 14px', borderRadius: 20,
                      border: statusFilter === s ? '1px solid var(--dark)' : '1px solid var(--light)',
                      background: statusFilter === s ? 'var(--dark)' : 'var(--white)',
                      color: statusFilter === s ? 'white' : 'var(--mid)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {s || 'All'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--mid)', textAlign: 'center', padding: 40 }}>No orders found.</p>
                  ) : orders.map(order => (
                    <div key={order.order_id} style={{
                      background: 'var(--white)', borderRadius: 8,
                      border: '1px solid var(--light)', padding: '18px 24px',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', flexWrap: 'wrap', gap: 12,
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: 2 }}>Order #{order.order_id}</p>
                        <p style={{ fontSize: 13, color: 'var(--mid)' }}>
                          {order.customer_name} · {order.customer_email}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>
                          {new Date(order.ordered_at).toLocaleDateString()} · {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontWeight: 700 }}>
                          ${parseFloat(order.total_price).toFixed(2)}
                        </span>
                        <span style={{
                          background: '#F7FAFC',
                          color: STATUS_COLORS[order.status] || '#4A5568',
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {order.status}
                        </span>

                        {/* Status actions */}
                        {NEXT_STATUS[order.status]?.map(next => (
                          <button key={next}
                            onClick={() => handleStatusUpdate(order.order_id, next)}
                            style={{
                              padding: '6px 14px',
                              background: next === 'Cancelled' ? '#FFF5F5' : 'var(--dark)',
                              color: next === 'Cancelled' ? 'var(--danger)' : 'white',
                              border: next === 'Cancelled' ? '1px solid #FECACA' : 'none',
                              borderRadius: 4, fontSize: 12, fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                            → {next}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* LOW STOCK TAB */}
            {tab === 'low-stock' && (
              <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--light)', background: 'var(--cream)' }}>
                      {['SKU', 'Product', 'Category', 'Size', 'Color', 'Stock'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                          textTransform: 'uppercase', color: 'var(--mid)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map(v => (
                      <tr key={v.variant_id} style={{ borderBottom: '1px solid var(--light)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--mid)', fontFamily: 'monospace', fontSize: 12 }}>{v.sku || '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{v.product_name}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--mid)' }}>{v.category}</td>
                        <td style={{ padding: '12px 16px' }}>{v.size}</td>
                        <td style={{ padding: '12px 16px' }}>{v.color}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: v.stock === 0 ? '#FFF5F5' : '#FFFBEB',
                            color: v.stock === 0 ? 'var(--danger)' : '#B7791F',
                            padding: '3px 10px', borderRadius: 12,
                            fontSize: 12, fontWeight: 700,
                          }}>
                            {v.stock === 0 ? 'Out of stock' : v.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}