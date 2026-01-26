import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { toast } from 'react-toastify'; 

// ✅ PERFORMANCE: Static Styles Moved Outside (Exact Old Project Styles)
const CSS_OVERRIDES = `
  /* --- DESKTOP DEFAULTS --- */
  .cart-grid {
    display: grid; grid-template-columns: 2.5fr 1fr; gap: 30px;
    max-width: 1200px; margin: 0 auto;
  }
  .cart-card { transition: all 0.3s ease; }
  .cart-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0, 33, 71, 0.1) !important; }
  .qty-btn:hover { background-color: #F0F8FF !important; color: #FF6F00 !important; }
  .action-btn:hover { color: #d00 !important; text-decoration: underline; }
  .checkout-btn:hover { background-color: #e65c00 !important; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 111, 0, 0.3); }

  /* Default Visibility */
  .desktop-checkout-box { display: block; }
  .mobile-checkout-bar { display: none; }

  /* =========================================
      📱 MOBILE RESPONSIVE TWEAKS 
      ========================================= */
  @media (max-width: 900px) {
    .cart-grid { 
        display: block !important; 
        padding-bottom: 100px !important; 
    }
    .desktop-checkout-box { display: none !important; }

    .mobile-checkout-bar { 
        display: flex !important; 
        position: fixed; bottom: 0; left: 0; width: 100%;
        background: white; padding: 15px 20px;
        box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
        justify-content: space-between; align-items: center;
        z-index: 1000;
    }

    .cart-card {
        padding: 15px !important;
        gap: 15px !important;
        border-radius: 12px !important;
    }
    .img-wrapper-mobile {
        width: 90px !important; height: 90px !important; 
    }
    .item-title-mobile { font-size: 16px !important; margin-bottom: 5px !important; }
    .item-price-mobile { font-size: 18px !important; }
    
    .action-row-mobile {
        margin-top: 10px !important;
        justify-content: space-between !important;
        width: 100% !important;
    }
    .qty-box-mobile { height: 35px !important; }
    .qty-btn { padding: 0 10px !important; font-size: 14px !important; }
  }
`;

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ REDUX: Get Items
  const { cartItems } = useSelector((state) => state.cart);

  // ✅ MEMOIZATION: Calculate Subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  }, [cartItems]);

  // ✅ HANDLERS
  const addToCartHandler = async (product, newQty) => {
    // Note: We pass the whole product object to keep color/size data intact
    // The Redux Slice will handle the update logic
    dispatch(addToCart({ ...product, qty: newQty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
    toast.error("Item removed from cart");
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* CSS Styling */}
      <style>{CSS_OVERRIDES}</style>

      <div className="cart-grid">
        
        {/* --- LEFT SIDE: CART ITEMS --- */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#002147', marginBottom: '25px', borderBottom: '2px solid #e1e4e8', paddingBottom: '15px' }}>
            Shopping Cart <span style={{fontSize: '16px', fontWeight: 'normal', color: '#565959'}}>({cartItems.length} items)</span>
          </h1>
          
          {cartItems.length === 0 ? (
            <div style={{ background: 'white', padding: '50px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: '40px', color: '#ddd', marginBottom: '15px' }}></i>
              <p style={{ fontSize: '18px', color: '#565959' }}>Your cart is currently empty.</p>
              <button onClick={() => navigate('/')} style={{ ...STYLES.checkoutBtn, width: 'auto', padding: '10px 30px', marginTop: '15px' }} className="checkout-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} style={STYLES.cartItem} className="cart-card">
                
                {/* Product Image */}
                <div style={STYLES.imageWrapper} className="img-wrapper-mobile">
                  <img 
                    // ✅ PICTURE LOGIC: Check 'selectedImage' first, fallback to 'image'
                    src={item.selectedImage || item.image} 
                    alt={item.name} 
                    style={STYLES.itemImage} 
                  />
                </div>
                
                {/* Product Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link to={`/product/${item.productId || item._id}`} style={{ textDecoration: 'none' }}>
                       <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#002147', margin: '0 0 8px 0', lineHeight: '1.4' }} className="item-title-mobile">{item.name}</h3>
                    </Link>
                  </div>
                  
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#FF6F00', margin: '0 0 10px 0' }} className="item-price-mobile">
                      Rs {(item.price * item.qty).toLocaleString()}
                  </p>

                  {/* Variant Badges */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    {item.selectedColor && (
                      <span style={STYLES.variantBadge}>Color: {item.selectedColor}</span>
                    )}
                    {item.selectedSize && (
                      <span style={STYLES.variantBadge}>Size: {item.selectedSize}</span>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: '#007600', fontWeight: '600', marginBottom: '15px' }}>
                    <i className="fa-solid fa-check"></i> In Stock
                  </p>
                  
                  {/* Actions Row */}
                  <div style={STYLES.actionRow} className="action-row-mobile">
                    
                    {/* Quantity Box */}
                    <div style={STYLES.qtyBox} className="qty-box-mobile">
                      <button 
                        onClick={() => addToCartHandler(item, Number(item.qty) - 1)}
                        disabled={item.qty === 1} 
                        style={STYLES.qtyBtn} 
                        className="qty-btn"
                      >−</button>
                      
                      <span style={{ padding: '0 12px', fontWeight: '700', color: '#002147' }}>{item.qty}</span>
                      
                      <button 
                        onClick={() => addToCartHandler(item, Number(item.qty) + 1)}
                        disabled={item.qty >= item.countInStock}
                        style={STYLES.qtyBtn} 
                        className="qty-btn"
                      >+</button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <button onClick={() => removeFromCartHandler(item._id)} style={STYLES.actionLink} className="action-btn">
                        <i className="fa-regular fa-trash-can" style={{marginRight: '5px'}}></i> Remove
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* --- RIGHT SIDE: CHECKOUT BOX (Desktop Only) --- */}
        {cartItems.length > 0 && (
          <div style={STYLES.checkoutBox} className="desktop-checkout-box">
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', color: '#007600', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-check"></i> Your order qualifies for FREE Shipping.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', color: '#565959' }}>Subtotal:</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#002147' }}>Rs {subtotal.toLocaleString()}</span>
            </div>

            <button 
              className="checkout-btn"
              style={STYLES.checkoutBtn}
              onClick={checkoutHandler}
            >
              Proceed to Checkout
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', color: '#565959', fontSize: '12px' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> Secure Transaction
            </div>
          </div>
        )}

      </div>

      {/* ✅ MOBILE STICKY CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="mobile-checkout-bar">
            <div>
                <span style={{fontSize: '12px', color: '#555', display: 'block'}}>Total Amount:</span>
                <span style={{fontSize: '20px', fontWeight: '800', color: '#002147'}}>Rs {subtotal.toLocaleString()}</span>
            </div>
            <button 
                onClick={checkoutHandler}
                style={{
                    background: '#FF6F00', color: 'white', padding: '12px 25px', 
                    borderRadius: '30px', border: 'none', fontWeight: 'bold', fontSize: '14px'
                }}
            >
                Checkout <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>
      )}

    </div>
  );
}

// ✅ STATIC STYLES
const STYLES = {
  cartItem: { 
    display: 'flex', gap: '20px', background: '#ffffff', padding: '20px', 
    borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.02)', alignItems: 'center'
  },
  imageWrapper: {
    width: '140px', height: '140px', background: '#f9f9f9', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  itemImage: { 
    width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' 
  },
  variantBadge: { 
    fontSize: '12px', color: '#002147', background: '#F0F8FF', 
    padding: '5px 12px', borderRadius: '20px', fontWeight: '600' 
  },
  actionRow: { display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' },
  qtyBox: { 
    display: 'flex', alignItems: 'center', border: '1px solid #FF6F00', 
    borderRadius: '30px', overflow: 'hidden', background: '#fff' 
  },
  qtyBtn: { 
    border: 'none', padding: '5px 15px', cursor: 'pointer', background: 'white', 
    fontSize: '16px', fontWeight: 'bold', color: '#002147', transition: '0.2s'
  },
  actionLink: { 
    background: 'none', border: 'none', color: '#565959', cursor: 'pointer', 
    fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', transition: '0.2s'
  },
  checkoutBox: { 
    background: 'white', padding: '30px', borderRadius: '16px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: 'fit-content', 
    position: 'sticky', top: '20px', border: '1px solid rgba(0,0,0,0.02)'
  },
  checkoutBtn: {
    width: '100%', background: '#FF6F00', color: '#F0F8FF', border: 'none',
    padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold',
    fontSize: '16px', transition: '0.3s ease', textTransform: 'uppercase', letterSpacing: '0.5px'
  }
};

export default CartScreen;