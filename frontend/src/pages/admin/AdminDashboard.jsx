import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  getDashboardSummary, getLowStock,
  getRecentOrders, getSalesByCategory,
  getAllOrders, updateOrderStatus,
} from '../../api/orderApi';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createVariant, updateVariant, deleteVariant,
  getProductDetail, uploadProductImage,
} from '../../api/productApi';
import { getAllUsers, updateUserRole } from '../../api/authApi';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>Administrator</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32 }}>Admin Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--light)',
          marginBottom: 36, flexWrap: 'wrap' }}>
          {['overview', 'orders', 'products', 'categories', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 24px', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--dark)' : '2px solid transparent',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'capitalize', cursor: 'pointer',
              color: tab === t ? 'var(--dark)' : 'var(--mid)',
              fontFamily: "'DM Sans', sans-serif", marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {tab === 'overview'    && <OverviewTab />}
        {tab === 'orders'      && <OrdersTab />}
        {tab === 'products'    && <ProductsTab />}
        {tab === 'categories'  && <CategoriesTab />}
        {tab === 'users'       && <UsersTab />}
      </div>
    </div>
  );
}

/* ── OVERVIEW ── */
function OverviewTab() {
  const [summary, setSummary]       = useState(null);
  const [lowStock, setLowStock]     = useState([]);
  const [recentOrders, setRecent]   = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getLowStock(10), getRecentOrders(5), getSalesByCategory()])
      .then(([s, l, r, c]) => {
        setSummary(s.data); setLowStock(l.data.variants);
        setRecent(r.data); setByCategory(c.data);
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { label: 'Total Revenue',   value: `$${parseFloat(summary?.revenue?.total_delivered || 0).toFixed(2)}`, color: 'var(--gold)' },
    { label: 'Total Orders',    value: summary?.orders?.total || 0,              color: 'var(--dark)' },
    { label: 'Customers',       value: summary?.users?.total_customers || 0,     color: 'var(--dark)' },
    { label: 'Active Products', value: summary?.products?.total_active || 0,     color: 'var(--dark)' },
    { label: 'Out of Stock',    value: summary?.products?.out_of_stock || 0,     color: 'var(--danger)' },
    { label: 'Sale Staff',      value: summary?.users?.total_sale_staff || 0,    color: 'var(--dark)' },
  ];

  return (
    <div>
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 40 }}>
        {stats.map(s => (
          <div key={s.label} className="fade-up" style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', padding: '22px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: 10 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>Recent Orders</h3>
          {recentOrders.length === 0 ? <p style={{ color: 'var(--mid)', fontSize: 14 }}>No orders yet.</p> :
            recentOrders.map(o => (
              <div key={o.order_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light)', paddingBottom: 12, marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>#{o.order_id} · {o.customer_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--mid)' }}>{o.status}</p>
                </div>
                <p style={{ fontWeight: 600 }}>${parseFloat(o.total_price).toFixed(2)}</p>
              </div>
            ))}
        </div>

        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>Sales by Category</h3>
          {byCategory.length === 0 ? <p style={{ color: 'var(--mid)', fontSize: 14 }}>No sales yet.</p> :
            byCategory.map(c => {
              const maxRevenue = Math.max(...byCategory.map(x => x.total_revenue));
              const pct = maxRevenue > 0 ? (c.total_revenue / maxRevenue) * 100 : 0;
              return (
                <div key={c.category} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{c.category}</span>
                    <span style={{ color: 'var(--mid)' }}>${parseFloat(c.total_revenue).toFixed(2)}</span>
                  </div>
                  <div style={{ background: 'var(--light)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div style={{ marginTop: 24, background: '#FFFBEB', border: '1px solid #FBD38D', borderRadius: 8, padding: 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, color: '#B7791F' }}>⚡ {lowStock.length} variant{lowStock.length !== 1 ? 's' : ''} low on stock</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lowStock.slice(0, 8).map(v => (
              <span key={v.variant_id} style={{ background: 'white', border: '1px solid #FBD38D', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: '#B7791F', fontWeight: 500 }}>
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
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getAllOrders(statusFilter ? { status: statusFilter } : {})
      .then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [statusFilter]);

  const NEXT = { Pending: ['Paid','Cancelled'], Paid: ['Processing','Cancelled'], Processing: ['Shipped','Cancelled'], Shipped: ['Delivered'] };

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
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>{s || 'All'}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--mid)' }}>No orders found.</div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>{h}</th>
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
                    <span style={{ background: '#F7FAFC', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--mid)' }}>{new Date(o.ordered_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(NEXT[o.status] || []).map(next => (
                        <button key={next} onClick={() => handleStatus(o.order_id, next)} style={{
                          padding: '4px 10px',
                          background: next === 'Cancelled' ? '#FFF5F5' : 'var(--dark)',
                          color: next === 'Cancelled' ? 'var(--danger)' : 'white',
                          border: next === 'Cancelled' ? '1px solid #FECACA' : 'none',
                          borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
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
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [expandedId,  setExpandedId]  = useState(null); // which product's variants are open
  const [variantData, setVariantData] = useState({});   // { product_id: [variants] }
  const [editingProduct, setEditingProduct] = useState(null); // product being edited
  const [editForm,       setEditForm]       = useState({});
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  const [form, setForm] = useState({
    category: '', product_name: '', description: '',
    base_price: '', image_url: '', is_active: true,
  });

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  // Load variants for a product when expanding
  const handleExpand = async (productId) => {
    if (expandedId === productId) { setExpandedId(null); return; }
    setExpandedId(productId);
    if (!variantData[productId]) {
      const { data } = await getProductDetail(productId);
      setVariantData(prev => ({ ...prev, [productId]: data.variants || [] }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const cat = categories.find(c => c.name === form.category);
      if (!cat) { setError('Please select a valid category.'); setSaving(false); return; }
      const payload = {
        category: cat.category_id, product_name: form.product_name,
        description: form.description, base_price: form.base_price,
        image_url: form.image_url, is_active: form.is_active,
      };
      const { data } = await createProduct(payload);
      setProducts(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ category: '', product_name: '', description: '', base_price: '', image_url: '', is_active: true });
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        setError(Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '));
      } else { setError(errData || 'Failed to save product.'); }
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Delete this product? If it has no orders it will be permanently deleted. If it has orders it will be hidden from the shop.')) return;
    try {
      const { data } = await deleteProduct(id);
      if (data.type === 'hard_delete') {
        // Permanently removed — remove from list
        setProducts(prev => prev.filter(p => p.product_id !== id));
        alert('Product permanently deleted from database.');
      } else {
        // Soft deleted — just mark inactive in UI
        setProducts(prev => prev.map(p => p.product_id === id ? { ...p, is_active: false } : p));
        alert('Product hidden from shop. Order history is preserved.');
      }
    } catch {
      alert('Failed to delete product.');
    }
  };

  const startEditProduct = (p) => {
    setEditingProduct(p.product_id);
    setEditForm({
      product_name: p.product_name,
      description:  p.description || '',
      base_price:   p.base_price,
      image_url:    p.image_url || '',
      category:     p.category_name,
    });
    setExpandedId(null);
  };

  const handleUpdateProduct = async (e, productId) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const cat = categories.find(c => c.name === editForm.category);
      const payload = {
        product_name: editForm.product_name,
        description:  editForm.description,
        base_price:   editForm.base_price,
        image_url:    editForm.image_url,
        ...(cat ? { category: cat.category_id } : {}),
      };
      await updateProduct(productId, payload);
      setProducts(prev => prev.map(p =>
        p.product_id === productId
          ? { ...p, ...payload, category_name: editForm.category }
          : p
      ));
      setEditingProduct(null);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object'
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : d || 'Failed to update product.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ color: 'var(--mid)', fontSize: 14 }}>{products.length} products</p>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} style={{
          background: 'var(--dark)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 6, fontSize: 13,
          fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>{showForm ? 'Cancel' : '+ Add Product'}</button>
      </div>

      {/* New Product Form */}
      {showForm && (
        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--gold)', padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>New Product</h3>
          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--danger)', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={lblStyle}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.category_id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <AdminInput label="Product Name" value={form.product_name} onChange={v => setForm(p => ({ ...p, product_name: v }))} required />
            <AdminInput label="Base Price ($)" type="number" value={form.base_price} onChange={v => setForm(p => ({ ...p, base_price: v }))} required />
            <ImageUploadField
              imageUrl={form.image_url}
              onUploaded={(url) => setForm(p => ({ ...p, image_url: url }))}
            />
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={lblStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{
                background: saving ? 'var(--mid)' : 'var(--dark)', color: 'white', border: 'none',
                padding: '10px 28px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>{saving ? 'Saving…' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {loading ? <LoadingSpinner /> : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--mid)' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>👔</p>
          <p>No products yet. Click "+ Add Product" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map(p => (
            <div key={p.product_id} style={{
              background: 'var(--white)', borderRadius: 8,
              border: expandedId === p.product_id ? '1px solid var(--gold)' : '1px solid var(--light)',
              overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              {/* Product Row */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
                {/* Image thumbnail */}
                <div style={{ width: 52, height: 52, borderRadius: 6, background: '#F0EFE9', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_url
                    ? <img src={`http://localhost:8000${p.image_url}`} alt={p.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 20, opacity: 0.3 }}>👔</span>}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>{p.product_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--mid)' }}>{p.category_name} · ${parseFloat(p.base_price).toFixed(2)}</p>
                </div>

                {/* Status badge */}
                <span style={{
                  background: p.is_active ? '#F0FFF4' : '#FFF5F5',
                  color: p.is_active ? '#276749' : 'var(--danger)',
                  padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                }}>{p.is_active ? 'Active' : 'Inactive'}</span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleExpand(p.product_id)} style={{
                    background: expandedId === p.product_id ? 'var(--dark)' : 'var(--cream)',
                    color: expandedId === p.product_id ? 'white' : 'var(--dark)',
                    border: '1px solid var(--light)', padding: '6px 14px',
                    borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {expandedId === p.product_id ? '▲ Close' : '▼ Variants'}
                  </button>
                  <button onClick={() => startEditProduct(p)} style={{
                    background: editingProduct === p.product_id ? 'var(--gold)' : 'var(--cream)',
                    color: editingProduct === p.product_id ? 'white' : 'var(--dark)',
                    border: '1px solid var(--light)', padding: '6px 14px',
                    borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {editingProduct === p.product_id ? 'Editing…' : '✏ Edit'}
                  </button>
                  {p.is_active && (
                    <button onClick={() => handleDeactivate(p.product_id)} style={{
                      background: '#FFF5F5', color: 'var(--danger)', border: '1px solid #FECACA',
                      padding: '6px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}>Delete</button>
                  )}
                </div>
              </div>

              {/* Edit Product Panel */}
              {editingProduct === p.product_id && (
                <div style={{ borderTop: '1px solid var(--gold)', background: '#FFFDF7', padding: 24 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, marginBottom: 20, color: 'var(--dark)' }}>
                    Edit Product
                  </h3>
                  {error && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--danger)',
                      borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>
                  )}
                  <form onSubmit={(e) => handleUpdateProduct(e, p.product_id)}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={lblStyle}>Category</label>
                      <select value={editForm.category}
                        onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        style={inputStyle}>
                        {categories.map(c => <option key={c.category_id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={lblStyle}>Product Name</label>
                      <input value={editForm.product_name} required
                        onChange={e => setEditForm(prev => ({ ...prev, product_name: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                        onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={lblStyle}>Base Price ($)</label>
                      <input type="number" step="0.01" value={editForm.base_price} required
                        onChange={e => setEditForm(prev => ({ ...prev, base_price: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                        onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                    </div>
                    <ImageUploadField
                      imageUrl={editForm.image_url}
                      onUploaded={(url) => setEditForm(prev => ({ ...prev, image_url: url }))}
                    />
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={lblStyle}>Description</label>
                      <textarea value={editForm.description} rows={3}
                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add product description..."
                        style={{ ...inputStyle, resize: 'vertical' }}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                        onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <button type="button" onClick={() => { setEditingProduct(null); setError(''); }} style={{
                        background: 'var(--cream)', color: 'var(--mid)',
                        border: '1px solid var(--light)', padding: '10px 20px',
                        borderRadius: 6, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      }}>Cancel</button>
                      <button type="submit" disabled={saving} style={{
                        background: saving ? 'var(--mid)' : 'var(--gold)',
                        color: 'white', border: 'none', padding: '10px 28px',
                        borderRadius: 6, fontSize: 13, fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>{saving ? 'Saving…' : 'Save Changes'}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Variants Panel */}
              {expandedId === p.product_id && (
                <VariantsPanel
                  product={p}
                  variants={variantData[p.product_id]}
                  onVariantsChange={(newVariants) =>
                    setVariantData(prev => ({ ...prev, [p.product_id]: newVariants }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── VARIANTS PANEL ── */
function VariantsPanel({ product, variants = [], onVariantsChange }) {
  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const emptyVariant = { size: 'M', color: '', stock: '', price: '', sku: '' };
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [newVariant,   setNewVariant]   = useState(emptyVariant);
  const [editingId,    setEditingId]    = useState(null);
  const [editForm,     setEditForm]     = useState({});
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        size:  newVariant.size,
        color: newVariant.color,
        stock: parseInt(newVariant.stock),
        price: newVariant.price ? parseFloat(newVariant.price) : null,
        sku:   newVariant.sku || null,
      };
      const { data } = await createVariant(product.product_id, payload);
      onVariantsChange([...variants, data]);
      setNewVariant(emptyVariant);
      setShowAddForm(false);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object'
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : d || 'Failed to add variant.');
    } finally { setSaving(false); }
  };

  const startEdit = (v) => {
    setEditingId(v.variant_id);
    setEditForm({ size: v.size, color: v.color, stock: v.stock, price: v.price || '', sku: v.sku || '' });
  };

  const handleEdit = async (variantId) => {
    setSaving(true); setError('');
    try {
      const payload = {
        size:  editForm.size,
        color: editForm.color,
        stock: parseInt(editForm.stock),
        price: editForm.price ? parseFloat(editForm.price) : null,
        sku:   editForm.sku || null,
      };
      const { data } = await updateVariant(variantId, payload);
      onVariantsChange(variants.map(v => v.variant_id === variantId ? data : v));
      setEditingId(null);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object'
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : d || 'Failed to update variant.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (variantId) => {
    if (!confirm('Delete this variant? This cannot be undone.')) return;
    try {
      await deleteVariant(variantId);
      onVariantsChange(variants.filter(v => v.variant_id !== variantId));
    } catch {
      setError('Cannot delete — this variant may have existing orders.');
    }
  };

  return (
    <div style={{ borderTop: '1px solid var(--light)', background: 'var(--cream)', padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>
          Variants ({variants.length})
        </p>
        <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} style={{
          background: showAddForm ? 'var(--mid)' : 'var(--gold)', color: 'white',
          border: 'none', padding: '6px 16px', borderRadius: 4,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>{showAddForm ? 'Cancel' : '+ Add Variant'}</button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--danger)', borderRadius: 6, padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {/* Add Variant Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} style={{
          background: 'var(--white)', borderRadius: 8, padding: 20,
          border: '1px solid var(--gold)', marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--dark)' }}>New Variant</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
            {/* Size */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={lblStyle}>Size *</label>
              <select value={newVariant.size} onChange={e => setNewVariant(p => ({ ...p, size: e.target.value }))} style={inputStyle} required>
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={lblStyle}>Color *</label>
              <input value={newVariant.color} onChange={e => setNewVariant(p => ({ ...p, color: e.target.value }))}
                placeholder="e.g. Black" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
            </div>
            {/* Stock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={lblStyle}>Stock *</label>
              <input type="number" min="0" value={newVariant.stock} onChange={e => setNewVariant(p => ({ ...p, stock: e.target.value }))}
                placeholder="0" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
            </div>
            {/* Price override */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={lblStyle}>Price ($)</label>
              <input type="number" step="0.01" min="0" value={newVariant.price} onChange={e => setNewVariant(p => ({ ...p, price: e.target.value }))}
                placeholder={`Default: $${product.base_price}`} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
            </div>
            {/* SKU */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={lblStyle}>SKU</label>
              <input value={newVariant.sku} onChange={e => setNewVariant(p => ({ ...p, sku: e.target.value }))}
                placeholder="e.g. SHIRT-BLK-M" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} style={{
              background: saving ? 'var(--mid)' : 'var(--dark)', color: 'white',
              border: 'none', padding: '8px 24px', borderRadius: 4,
              fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>{saving ? 'Adding…' : 'Add Variant'}</button>
          </div>
        </form>
      )}

      {/* Variants Table */}
      {variants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mid)', fontSize: 14 }}>
          No variants yet — click "+ Add Variant" to add sizes and colors.
        </div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['Size', 'Color', 'Stock', 'Price', 'SKU', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.variant_id} style={{ borderBottom: '1px solid var(--light)' }}>
                  {editingId === v.variant_id ? (
                    /* Edit row */
                    <>
                      <td style={{ padding: '8px 14px' }}>
                        <select value={editForm.size} onChange={e => setEditForm(p => ({ ...p, size: e.target.value }))} style={{ ...inputStyle, padding: '6px 8px' }}>
                          {SIZES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <input value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} style={{ ...inputStyle, padding: '6px 8px' }}
                          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                          onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <input type="number" min="0" value={editForm.stock} onChange={e => setEditForm(p => ({ ...p, stock: e.target.value }))} style={{ ...inputStyle, padding: '6px 8px', width: 80 }}
                          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                          onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} placeholder="Default" style={{ ...inputStyle, padding: '6px 8px', width: 90 }}
                          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                          onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <input value={editForm.sku} onChange={e => setEditForm(p => ({ ...p, sku: e.target.value }))} style={{ ...inputStyle, padding: '6px 8px' }}
                          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                          onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleEdit(v.variant_id)} disabled={saving} style={{
                            background: 'var(--dark)', color: 'white', border: 'none',
                            padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}>{saving ? '…' : 'Save'}</button>
                          <button onClick={() => setEditingId(null)} style={{
                            background: 'var(--cream)', color: 'var(--mid)',
                            border: '1px solid var(--light)', padding: '4px 10px',
                            borderRadius: 4, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    /* View row */
                    <>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: 'var(--cream)', padding: '3px 10px', borderRadius: 4, fontWeight: 700, fontSize: 12 }}>{v.size}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{v.color}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          color: v.stock === 0 ? 'var(--danger)' : v.stock <= 5 ? '#B7791F' : 'var(--success)',
                          fontWeight: 600,
                        }}>{v.stock === 0 ? '⚠ Out of stock' : v.stock}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--mid)' }}>
                        {v.price ? `$${parseFloat(v.price).toFixed(2)}` : <span style={{ fontStyle: 'italic', fontSize: 12 }}>Default</span>}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--mid)' }}>{v.sku || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(v)} style={{
                            background: 'var(--cream)', color: 'var(--dark)',
                            border: '1px solid var(--light)', padding: '4px 12px',
                            borderRadius: 4, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}>Edit</button>
                          <button onClick={() => handleDelete(v.variant_id)} style={{
                            background: '#FFF5F5', color: 'var(--danger)',
                            border: '1px solid #FECACA', padding: '4px 12px',
                            borderRadius: 4, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
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
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [roleFilter, setRoleFilter]   = useState('');

  useEffect(() => {
    getAllUsers(roleFilter ? { role: roleFilter } : {})
      .then(r => setUsers(r.data)).finally(() => setLoading(false));
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
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>{r || 'All'}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--mid)' }}>No users found.</div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>{h}</th>
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
                    <select value={u.role} onChange={e => handleRoleChange(u.user_id, e.target.value)}
                      style={{ border: '1px solid var(--light)', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontFamily: "'DM Sans', sans-serif", background: 'var(--white)', cursor: 'pointer' }}>
                      <option>Admin</option><option>Sale</option><option>Customer</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: u.status === 'Active' ? '#F0FFF4' : '#FFF5F5', color: u.status === 'Active' ? '#276749' : 'var(--danger)', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleStatusChange(u.user_id, u.status === 'Active' ? 'Inactive' : 'Active')} style={{
                      background: u.status === 'Active' ? '#FFF5F5' : '#F0FFF4',
                      color: u.status === 'Active' ? 'var(--danger)' : '#276749',
                      border: `1px solid ${u.status === 'Active' ? '#FECACA' : '#9AE6B4'}`,
                      padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
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

// ── Shared helpers ──
const lblStyle = {
  fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--mid)',
};
const inputStyle = {
  padding: '10px 12px', border: '1px solid var(--light)',
  borderRadius: 6, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  background: 'var(--white)', color: 'var(--dark)', outline: 'none', width: '100%',
};

function AdminInput({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={lblStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder} style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e  => e.target.style.borderColor = 'var(--light)'} />
    </div>
  );
}

/* ── IMAGE UPLOAD FIELD ── */
function ImageUploadField({ imageUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const { data } = await uploadProductImage(file);
      onUploaded(data.image_url);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
      e.target.value = '';   // reset input so same file can be re-uploaded
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={lblStyle}>Product Image</label>

      {/* Preview */}
      {imageUrl && (
        <div style={{
          width: '100%', height: 140,
          borderRadius: 6, overflow: 'hidden',
          border: '1px solid var(--light)',
          marginBottom: 8, position: 'relative',
          background: '#F0EFE9',
        }}>
          <img
            src={`http://localhost:8000${imageUrl}`}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={() => onUploaded('')}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.6)', color: 'white',
              border: 'none', borderRadius: '50%',
              width: 28, height: 28, fontSize: 14,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      {/* Upload button */}
      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '10px 16px',
        border: '1px dashed var(--light)', borderRadius: 6,
        cursor: uploading ? 'not-allowed' : 'pointer',
        background: uploading ? '#F9F9F9' : 'var(--white)',
        color: 'var(--mid)', fontSize: 13, fontWeight: 500,
        transition: 'border-color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--light)'}
      >
        <span style={{ fontSize: 18 }}>📁</span>
        {uploading ? 'Uploading…' : imageUrl ? 'Change Image' : 'Click to Upload Image'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>

      {/* Hint */}
      <p style={{ fontSize: 11, color: 'var(--mid)' }}>
        JPEG, PNG, WEBP, GIF — max 5MB
      </p>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  );
}

/* ── CATEGORIES TAB ── */
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [editingId,  setEditingId]  = useState(null);
  const [editName,   setEditName]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data))
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true); setError('');
    try {
      const { data } = await getCategories();
      // Check duplicate
      if (data.find(c => c.name.toLowerCase() === newName.trim().toLowerCase())) {
        setError('Category already exists.');
        setSaving(false);
        return;
      }
      // Use createCategory API
      const res = await import('../../api/productApi').then(m =>
        m.default?.createCategory
          ? m.default.createCategory({ name: newName.trim() })
          : fetch('/api/categories/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access')}`,
              },
              body: JSON.stringify({ name: newName.trim() }),
            }).then(r => r.json())
      );
      // Refresh categories
      const updated = await getCategories();
      setCategories(updated.data);
      setNewName('');
      showSuccess(`Category "${newName.trim()}" added successfully.`);
    } catch (err) {
      setError(err.response?.data?.name?.[0] || err.response?.data?.error || 'Failed to add category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setSaving(true); setError('');
    try {
      await fetch(`/api/categories/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('access')}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      setCategories(prev => prev.map(c =>
        c.category_id === id ? { ...c, name: editName.trim() } : c
      ));
      setEditingId(null);
      showSuccess('Category updated.');
    } catch {
      setError('Failed to update category.');
    } finally {
      setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"? Products in this category must be reassigned first.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('access')}` },
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.category_id !== id));
        showSuccess(`Category "${name}" deleted.`);
      } else {
        const data = await res.json();
        setError(data.error || 'Cannot delete — this category may have products.');
      }
    } catch {
      setError('Failed to delete category.');
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 24 }}>
        Manage Categories
      </h2>

      {/* Success message */}
      {success && (
        <div style={{ background: '#F0FFF4', border: '1px solid #9AE6B4', color: '#276749',
          borderRadius: 6, padding: '10px 16px', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
          ✓ {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--danger)',
          borderRadius: 6, padding: '10px 16px', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Add Category Form */}
      <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, marginBottom: 16 }}>
          Add New Category
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12 }}>
          <input
            value={newName}
            onChange={e => { setNewName(e.target.value); setError(''); }}
            placeholder="e.g. Jacket, Accessories, Dress..."
            required
            style={{
              flex: 1, padding: '10px 14px',
              border: '1px solid var(--light)', borderRadius: 6,
              fontSize: 14, fontFamily: "'DM Sans', sans-serif",
              background: 'var(--white)', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e  => e.target.style.borderColor = 'var(--light)'}
          />
          <button type="submit" disabled={saving || !newName.trim()} style={{
            background: saving || !newName.trim() ? 'var(--mid)' : 'var(--dark)',
            color: 'white', border: 'none', padding: '10px 24px',
            borderRadius: 6, fontSize: 13, fontWeight: 600,
            cursor: saving || !newName.trim() ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
          }}>
            {saving ? 'Adding…' : '+ Add Category'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      {loading ? <LoadingSpinner /> : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--mid)' }}>
          No categories yet. Add one above.
        </div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 8, border: '1px solid var(--light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--light)' }}>
                {['#', 'Category Name', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c.category_id} style={{ borderBottom: '1px solid var(--light)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--mid)', width: 40 }}>{i + 1}</td>
                  <td style={{ padding: '12px 20px' }}>
                    {editingId === c.category_id ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{
                          padding: '7px 12px', border: '1px solid var(--gold)',
                          borderRadius: 6, fontSize: 14,
                          fontFamily: "'DM Sans', sans-serif", outline: 'none',
                          width: 220,
                        }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {editingId === c.category_id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleUpdate(c.category_id)} disabled={saving} style={{
                          background: 'var(--dark)', color: 'white', border: 'none',
                          padding: '6px 16px', borderRadius: 4, fontSize: 12,
                          fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        }}>{saving ? '…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} style={{
                          background: 'var(--cream)', color: 'var(--mid)',
                          border: '1px solid var(--light)', padding: '6px 14px',
                          borderRadius: 4, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditingId(c.category_id); setEditName(c.name); setError(''); }} style={{
                          background: 'var(--cream)', color: 'var(--dark)',
                          border: '1px solid var(--light)', padding: '6px 16px',
                          borderRadius: 4, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        }}>Rename</button>
                        <button onClick={() => handleDelete(c.category_id, c.name)} style={{
                          background: '#FFF5F5', color: 'var(--danger)',
                          border: '1px solid #FECACA', padding: '6px 16px',
                          borderRadius: 4, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        }}>Delete</button>
                      </div>
                    )}
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