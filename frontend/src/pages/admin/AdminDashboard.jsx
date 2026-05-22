import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  getDashboardSummary, getLowStock,
  getRecentOrders, getSalesByCategory,
  getAllOrders, updateOrderStatus,
} from '../../api/orderApi';
import {
  getProducts, createProduct,
  updateProduct, deleteProduct,
  getCategories, createVariant,
} from '../../api/productApi';
import { getAllUsers, updateUserRole } from '../../api/authApi';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>
            Administrator
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32 }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--light)',
          marginBottom: 36, flexWrap: 'wrap' }}>
          {['overview', 'orders', 'products', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 24px', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--dark)' : '2px solid transparent',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'capitalize', cursor: 'pointer',
              color: tab === t ? 'var(--dark)' : 'var(--mid)',
              fontFamily: "'DM Sans', sans-serif", marginBottom: -1,
            }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview'  && <OverviewTab />}
        {tab === 'orders'    && <OrdersTab />}
        {tab === 'products'  && <ProductsTab />}
        {tab === 'users'     && <UsersTab />}
      </div>
    </div>
  );
}

/* ── OVERVIEW ── */
function OverviewTab() {
  const [summary,    setSummary]    = useState(null);
  const [lowStock,   setLowStock]   = useState([]);
  const [recentOrders, setRecent]   = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getLowStock(10),
      getRecentOrders(5),
      getSalesByCategory(),
    ]).then(([s, l, r, c]) => {
      setSummary(s.data);
      setLowStock(l.data.variants);
      setRecent(r.data);
      setByCategory(c.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { label: 'Total Revenue',  value: `$${parseFloat(summary?.revenue?.total_delivered || 0).toFixed(2)}`, color: 'var(--gold)' },
    { label: 'Total Orders',   value: summary?.orders?.total || 0, color: 'var(--dark)' },
    { label: 'Customers',      value: summary?.users?.total_customers || 0, color: 'var(--dark)' },
    { label: 'Active Products',value: summary?.products?.total_active || 0, color: 'var(--dark)' },
    { label: 'Out of Stock',   value: summary?.products?.out_of_stock || 0, color: 'var(--danger)' },
    { label: 'Sale Staff',     value: summary?.users?.total_sale_staff || 0, color: 'var(--dark)' },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="stagger" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {stats.map(s => (
          <div key={s.label} className="fade-up" style={{
            background: 'var(--white)', borderRadius: 8,
            border: '1px solid var(--light)', padding: '22px 20px',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--mid)', marginBottom: 10 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent orders */}
        <div style={{ background: 'var(--white)', borderRadius: 8,
          border: '1px solid var(--light)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>
            Recent Orders
          </h3>
          {recentOrders.map(o => (
            <div key={o.order_id} style={{
              display: 'flex', justifyContent: 'space-between',
              borderBottom: '1px solid var(--light)', paddingBottom: 12, marginBottom: 12,
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>#{o.order_id} · {o.customer_name}</p>
                <p style={{ fontSize: 12, color: 'var(--mid)' }}>{o.status}</p>
              </div>
              <p style={{ fontWeight: 600 }}>${parseFloat(o.total_price).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Sales by category */}
        <div style={{ background: 'var(--white)', borderRadius: 8,
          border: '1px solid var(--light)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>
            Sales by Category
          </h3>
          {byCategory.map(c => {
            const maxRevenue = Math.max(...byCategory.map(x => x.total_revenue));
            const pct = maxRevenue > 0 ? (c.total_revenue / maxRevenue) * 100 : 0;
            return (
              <div key={c.category} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{c.category}</span>
                  <span style={{ color: 'var(--mid)' }}>${parseFloat(c.total_revenue).toFixed(2)}</span>
                </div>
                <div style={{ background: 'var(--light)', borderRadius: 4, height: 6 }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'var(--gold)', borderRadius: 4,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ marginTop: 24, background: '#FFFBEB',
          border: '1px solid #FBD38D', borderRadius: 8, padding: 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, color: '#B7791F' }}>
            ⚡ {lowStock.length} variant{lowStock.length !== 1 ? 's' : ''} low on stock
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lowStock.slice(0, 8).map(v => (
              <span key={v.variant_id} style={{
                background: 'white', border: '1px solid #FBD38D',
                borderRadius: 4, padding: '4px 10px',
                fontSize: 12, color: '#B7791F', fontWeight: 500,
              }}>
                {v.product_name} {v.size}/{v.color}: {v.stock} left
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ORDERS TAB ── */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getAllOrders(statusFilter ? { status: statusFilter } : {})
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const NEXT = { Pending: ['Paid','Cancelled'], Paid: ['Processing','Cancelled'],
    Processing: ['Shipped','Cancelled'], Shipped: ['Delivered'] };

  const handleStatus = async (id, s) => {
    await updateOrderStatus(id, s);
    setOrders(prev => prev.map(o => o.order_id === id ? { ...o, status: s } : o));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['', 'Pending','Paid','Processing','Shipped','Delivered','Cancelled'].map(s => (
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

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--white)', borderRadius: 8,
          border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--mid)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.order_id} style={{ borderBottom: '1px solid var(--light)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{o.order_id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: 500 }}>{o.customer_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--mid)' }}>{o.customer_email}</p>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--mid)' }}>{o.item_count}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>${parseFloat(o.total_price).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: '#F7FAFC', padding: '3px 10px',
                      borderRadius: 12, fontSize: 12, fontWeight: 600,
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--mid)' }}>
                    {new Date(o.ordered_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(NEXT[o.status] || []).map(next => (
                        <button key={next} onClick={() => handleStatus(o.order_id, next)} style={{
                          padding: '4px 10px',
                          background: next === 'Cancelled' ? '#FFF5F5' : 'var(--dark)',
                          color: next === 'Cancelled' ? 'var(--danger)' : 'white',
                          border: next === 'Cancelled' ? '1px solid #FECACA' : 'none',
                          borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>{next}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── PRODUCTS TAB ── */
function ProductsTab() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form, setForm] = useState({
    category: '', product_name: '', description: '',
    base_price: '', image_url: '', is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const cat = categories.find(c => c.name === form.category);
      if (!cat) {
        setError('Please select a valid category.');
        setSaving(false);
        return;
      }
      const payload = {
        category:     cat.category_id,
        product_name: form.product_name,
        description:  form.description,
        base_price:   form.base_price,
        image_url:    form.image_url,
        is_active:    form.is_active,
      };
      const { data } = await createProduct(payload);
      setProducts(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ category: '', product_name: '', description: '',
        base_price: '', image_url: '', is_active: true });
    } catch (err) {
      // Show the real Django error
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const messages = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(messages);
      } else {
        setError(errData || 'Failed to save product.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.product_id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ color: 'var(--mid)', fontSize: 14 }}>{products.length} products</p>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'var(--dark)', color: 'white',
          border: 'none', padding: '10px 20px', borderRadius: 6,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--white)', borderRadius: 8,
          border: '1px solid var(--light)', padding: 28, marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>
            New Product
          </h3>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA',
              color: 'var(--danger)', borderRadius: 6, padding: '10px 14px',
              fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={lblStyle}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                required style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.category_id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <AdminInput label="Product Name" value={form.product_name}
              onChange={v => setForm(p => ({ ...p, product_name: v }))} required />
            <AdminInput label="Base Price ($)" type="number" value={form.base_price}
              onChange={v => setForm(p => ({ ...p, base_price: v }))} required />
            <AdminInput label="Image URL" value={form.image_url}
              onChange={v => setForm(p => ({ ...p, image_url: v }))} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={lblStyle}>Description</label>
              <textarea value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="submit" disabled={saving} style={{
                background: 'var(--dark)', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: 6, fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {saving ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--white)', borderRadius: 8,
          border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['Product', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--mid)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id} style={{ borderBottom: '1px solid var(--light)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.product_name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--mid)' }}>{p.category_name}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>${parseFloat(p.base_price).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: p.is_active ? '#F0FFF4' : '#FFF5F5',
                      color: p.is_active ? '#276749' : 'var(--danger)',
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    }}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(p.product_id)} style={{
                      background: '#FFF5F5', color: 'var(--danger)',
                      border: '1px solid #FECACA', padding: '4px 12px',
                      borderRadius: 4, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── USERS TAB ── */
function UsersTab() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    getAllUsers(roleFilter ? { role: roleFilter } : {})
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, { role });
    setUsers(prev => prev.map(u => u.user_id === id ? { ...u, role } : u));
  };

  const handleStatusChange = async (id, status) => {
    await updateUserRole(id, { status });
    setUsers(prev => prev.map(u => u.user_id === id ? { ...u, status } : u));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['', 'Admin', 'Sale', 'Customer'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: '6px 14px', borderRadius: 20,
            border: roleFilter === r ? '1px solid var(--dark)' : '1px solid var(--light)',
            background: roleFilter === r ? 'var(--dark)' : 'var(--white)',
            color: roleFilter === r ? 'white' : 'var(--mid)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ background: 'var(--white)', borderRadius: 8,
          border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--mid)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--light)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--mid)', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--mid)' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select value={u.role}
                      onChange={e => handleRoleChange(u.user_id, e.target.value)}
                      style={{ border: '1px solid var(--light)', borderRadius: 4,
                        padding: '4px 8px', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                        background: 'var(--white)', cursor: 'pointer' }}>
                      <option>Admin</option>
                      <option>Sale</option>
                      <option>Customer</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: u.status === 'Active' ? '#F0FFF4' : '#FFF5F5',
                      color: u.status === 'Active' ? '#276749' : 'var(--danger)',
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleStatusChange(u.user_id,
                        u.status === 'Active' ? 'Inactive' : 'Active')}
                      style={{
                        background: u.status === 'Active' ? '#FFF5F5' : '#F0FFF4',
                        color: u.status === 'Active' ? 'var(--danger)' : '#276749',
                        border: `1px solid ${u.status === 'Active' ? '#FECACA' : '#9AE6B4'}`,
                        padding: '4px 12px', borderRadius: 4,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Helpers
const lblStyle = {
  fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--mid)',
};
const inputStyle = {
  padding: '10px 12px', border: '1px solid var(--light)',
  borderRadius: 6, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  background: 'var(--white)', color: 'var(--dark)', outline: 'none',
};

function AdminInput({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={lblStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
    </div>
  );
}