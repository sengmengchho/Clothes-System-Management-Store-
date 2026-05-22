import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProducts, getCategories } from '../api/productApi';

export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({ category: '', search: '', min_price: '', max_price: '' });
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory)    params.category  = activeCategory;
    if (filters.search)    params.search    = filters.search;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;

    getProducts(params)
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, filters.search, filters.min_price, filters.max_price]);

  const handleSearch = (e) => {
    setFilters(p => ({ ...p, search: e.target.value }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'var(--dark)',
        color: 'white',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--gold)', fontWeight: 600, marginBottom: 14,
        }}>
          New Collection
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 52,
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Elevate Your Style
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 400, margin: '0 auto' }}>
          Curated pieces for the modern wardrobe
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Search + Price Filters */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap',
        }}>
          <input
            value={filters.search}
            onChange={handleSearch}
            placeholder="Search products…"
            style={{
              flex: 1, minWidth: 220,
              padding: '10px 16px',
              border: '1px solid var(--light)',
              borderRadius: 6, fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              background: 'var(--white)', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e  => e.target.style.borderColor = 'var(--light)'}
          />
          <input
            type="number" placeholder="Min $"
            value={filters.min_price}
            onChange={e => setFilters(p => ({ ...p, min_price: e.target.value }))}
            style={priceInputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e  => e.target.style.borderColor = 'var(--light)'}
          />
          <input
            type="number" placeholder="Max $"
            value={filters.max_price}
            onChange={e => setFilters(p => ({ ...p, max_price: e.target.value }))}
            style={priceInputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e  => e.target.style.borderColor = 'var(--light)'}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
          <CategoryTab label="All" active={activeCategory === ''} onClick={() => setActiveCategory('')} />
          {categories.map(c => (
            <CategoryTab
              key={c.category_id}
              label={c.name}
              active={activeCategory === c.name}
              onClick={() => setActiveCategory(activeCategory === c.name ? '' : c.name)}
            />
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <LoadingSpinner message="Loading products…" />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🛍</p>
            <p style={{ color: 'var(--mid)', fontSize: 16 }}>No products found.</p>
          </div>
        ) : (
          <div className="stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {products.map(p => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const priceInputStyle = {
  width: 100,
  padding: '10px 12px',
  border: '1px solid var(--light)',
  borderRadius: 6, fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  background: 'var(--white)', outline: 'none',
};

function CategoryTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 18px',
      borderRadius: 20,
      border: active ? '1px solid var(--dark)' : '1px solid var(--light)',
      background: active ? 'var(--dark)' : 'var(--white)',
      color: active ? 'white' : 'var(--mid)',
      fontSize: 12, fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );
}