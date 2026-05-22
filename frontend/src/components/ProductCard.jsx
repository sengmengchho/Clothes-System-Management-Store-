import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const price    = product.from_price ?? product.base_price;

  return (
    <div
      className="fade-up"
      onClick={() => navigate(`/product/${product.product_id}`)}
      style={{
        cursor: 'pointer',
        background: 'var(--white)',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--light)',
        transition: 'transform 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translateY(-4px)';
        e.currentTarget.style.boxShadow   = '0 12px 32px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translateY(0)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      {/* Image */}
      <div style={{
        height: 260,
        background: '#F0EFE9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {product.image_url ? (
          <img
            src={`http://localhost:8000${product.image_url}`}
            alt={product.product_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.3 }}>👔</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 20px' }}>
        <p style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontWeight: 600,
          marginBottom: 6,
        }}>
          {product.category_name}
        </p>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 17,
          fontWeight: 500,
          color: 'var(--dark)',
          marginBottom: 10,
          lineHeight: 1.3,
        }}>
          {product.product_name}
        </h3>
        <p style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--dark)',
        }}>
          ${parseFloat(price).toFixed(2)}
        </p>
      </div>
    </div>
  );
}