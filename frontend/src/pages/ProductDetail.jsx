import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProductDetail } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { addToCart }   = useCart();
  const { user }        = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added,    setAdded]    = useState(false);

  useEffect(() => {
    getProductDetail(id)
      .then(r => {
        setProduct(r.data);
        if (r.data.variants?.length > 0) setSelectedVariant(r.data.variants[0]);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user) return navigate('/login');
    if (!selectedVariant) return;

    addToCart({
      variant_id:   selectedVariant.variant_id,
      product_name: product.product_name,
      size:         selectedVariant.size,
      color:        selectedVariant.color,
      sku:          selectedVariant.sku,
      price:        parseFloat(selectedVariant.effective_price),
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <><Navbar /><LoadingSpinner /></>;
  if (!product) return null;

  const price = selectedVariant?.effective_price ?? product.base_price;

  // Group variants by color
  const colors = [...new Set(product.variants.map(v => v.color))];
  const selectedColor = selectedVariant?.color;
  const sizesForColor = product.variants.filter(v => v.color === selectedColor);

  const handleColorSelect = (color) => {
    const first = product.variants.find(v => v.color === color);
    setSelectedVariant(first);
    setQuantity(1);
  };

  const handleSizeSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 32 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Shop</span>
          {' / '}
          <span style={{ color: 'var(--dark)' }}>{product.product_name}</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          {/* Image */}
          <div className="fade-up" style={{
            background: '#F0EFE9',
            borderRadius: 12,
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {product.image_url ? (
              <img src={`http://localhost:8000${product.image_url}`} alt={product.product_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 80, opacity: 0.25 }}>👔</span>
            )}
          </div>

          {/* Info */}
          <div className="fade-up" style={{ paddingTop: 8 }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--gold)',
              fontWeight: 600, marginBottom: 10,
            }}>
              {product.category?.name}
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36, fontWeight: 500,
              marginBottom: 16, color: 'var(--dark)',
            }}>
              {product.product_name}
            </h1>
            <p style={{
              fontSize: 28, fontWeight: 600,
              color: 'var(--dark)', marginBottom: 24,
            }}>
              ${parseFloat(price).toFixed(2)}
            </p>

            {product.description && (
              <p style={{
                color: 'var(--mid)', fontSize: 15,
                lineHeight: 1.7, marginBottom: 32,
              }}>
                {product.description}
              </p>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={labelStyle}>Color — <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{selectedColor}</span></p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {colors.map(color => (
                    <button key={color} onClick={() => handleColorSelect(color)} style={{
                      padding: '7px 16px',
                      border: selectedColor === color
                        ? '2px solid var(--dark)'
                        : '1px solid var(--light)',
                      borderRadius: 4,
                      background: selectedColor === color ? 'var(--dark)' : 'var(--white)',
                      color: selectedColor === color ? 'white' : 'var(--dark)',
                      fontSize: 13, fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.15s',
                    }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizesForColor.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={labelStyle}>Size</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {sizesForColor.map(v => (
                    <button key={v.variant_id} onClick={() => handleSizeSelect(v)}
                      disabled={v.stock === 0}
                      style={{
                        width: 52, height: 52,
                        border: selectedVariant?.variant_id === v.variant_id
                          ? '2px solid var(--dark)'
                          : '1px solid var(--light)',
                        borderRadius: 4,
                        background: v.stock === 0 ? '#F5F5F5'
                          : selectedVariant?.variant_id === v.variant_id ? 'var(--dark)' : 'var(--white)',
                        color: v.stock === 0 ? 'var(--light)'
                          : selectedVariant?.variant_id === v.variant_id ? 'white' : 'var(--dark)',
                        fontSize: 13, fontWeight: 600,
                        cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        textDecoration: v.stock === 0 ? 'line-through' : 'none',
                        transition: 'all 0.15s',
                      }}>
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {selectedVariant && (
              <p style={{ fontSize: 13, color: selectedVariant.stock < 5 ? '#E07B39' : 'var(--mid)', marginBottom: 24 }}>
                {selectedVariant.stock === 0
                  ? '✗ Out of stock'
                  : selectedVariant.stock < 5
                  ? `⚡ Only ${selectedVariant.stock} left`
                  : `✓ In stock (${selectedVariant.stock} available)`}
              </p>
            )}

            {/* Quantity + Add to Cart */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Qty */}
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1px solid var(--light)', borderRadius: 6,
                overflow: 'hidden',
              }}>
                <QtyBtn onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</QtyBtn>
                <span style={{
                  width: 44, textAlign: 'center',
                  fontSize: 15, fontWeight: 600,
                }}>
                  {quantity}
                </span>
                <QtyBtn onClick={() => setQuantity(q => Math.min(selectedVariant?.stock ?? 1, q + 1))}>+</QtyBtn>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: added ? 'var(--success)'
                    : !selectedVariant || selectedVariant.stock === 0 ? 'var(--light)'
                    : 'var(--dark)',
                  color: !selectedVariant || selectedVariant.stock === 0 ? 'var(--mid)' : 'white',
                  border: 'none', borderRadius: 6,
                  fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.06em',
                  cursor: !selectedVariant || selectedVariant.stock === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'background 0.3s',
                }}
              >
                {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 11, fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--mid)', marginBottom: 10,
};

function QtyBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 44,
      background: 'none', border: 'none',
      fontSize: 18, cursor: 'pointer',
      color: 'var(--dark)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </button>
  );
}