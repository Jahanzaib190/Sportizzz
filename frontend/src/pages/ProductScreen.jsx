import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductDetailsQuery, useCreateReviewMutation } from '../slices/productsApiSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';

// ✅ EXACT STYLES (No Changes Needed Here)
const CSS_OVERRIDES = `
  .main-img-wrapper:hover img { transform: scale(1.1); }
  .main-img-wrapper img { transition: transform 0.5s ease; }
  .thumb-wrapper:hover { transform: scale(1.05); border-color: #FF6F00 !important; }
  .thumb-wrapper { transition: all 0.2s ease; }
  .cart-btn:hover { background-color: #003366 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 33, 71, 0.3); }
  .buy-btn:hover { background-color: #e65c00 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 111, 0, 0.4); }
  .size-btn:hover { border-color: #002147 !important; color: #002147 !important; }
  .review-card:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.05); }
  .fade-in { animation: fadeIn 0.5s ease-in-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 768px) {
    .prod-container { flex-direction: column !important; gap: 30px !important; }
    .img-section, .info-section { width: 100% !important; min-width: 100% !important; flex: none !important; }
    .main-img-wrapper { height: 350px !important; }
    .thumbnail-grid { justify-content: flex-start !important; padding-bottom: 15px !important; }
    .prod-title { font-size: 24px !important; }
    .prod-price { font-size: 26px !important; margin-bottom: 15px !important; }
    .action-section {
        position: fixed !important; bottom: 0 !important; left: 0 !important; width: 100% !important;
        background: white !important; padding: 15px 20px !important;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1) !important; z-index: 1000 !important;
        margin: 0 !important; gap: 10px !important;
    }
    .cart-btn, .buy-btn { padding: 12px !important; font-size: 14px !important; border-radius: 8px !important; }
    .main-container { padding-bottom: 80px !important; }
    .review-grid { flex-direction: column !important; gap: 30px !important; }
    .review-form-box { width: 100% !important; }
  }
`;

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux
  const { userInfo } = useSelector((state) => state.auth);
  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  // Local State
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setMainImage(product.colors[0].images[0]); 
        setSelectedColorIdx(0);
      } else {
        setMainImage(product.image);
      }
    }
  }, [product]);

  // ✅ UPDATED ADD TO CART HANDLER
  const addToCartHandler = () => {
    // 1. Check Size
    if (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) {
        return toast.error("Please select a size!");
    }

    // 2. Determine Color Name
    const colorName = product.colors?.length > 0 
        ? product.colors[selectedColorIdx].colorName 
        : '';

    // 3. ✅ GENERATE UNIQUE ID (Product ID + Color + Size)
    // Isse Red aur Blue shirt alag alag items ban jayengi cart mein
    let uniqueId = product._id;
    if (colorName) uniqueId += `-${colorName}`;
    if (selectedSize) uniqueId += `-${selectedSize}`;

    dispatch(addToCart({ 
        ...product, 
        qty: 1,
        _id: uniqueId,          // New Unique ID
        productId: product._id, // Original ID (Link ke liye)
        selectedSize: selectedSize || null,
        selectedColor: colorName || null,
        selectedImage: mainImage || product.image, // ✅ Jo image screen par hai wahi jayegi
        image: mainImage // Fallback
    }));
    toast.success("Added to Cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if(rating === 0) return toast.error("Please select a rating");
    try {
      await createReview({ productId, rating, comment }).unwrap();
      toast.success('Review Submitted');
      setRating(0);
      setComment('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  // Gallery Logic
  const galleryImages = product.colors && product.colors.length > 0 
      ? product.colors[selectedColorIdx].images 
      : [product.image];

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>
      
      <div className="main-container fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <Link to="/" className="btn btn-light mb-4 text-gray-500 hover:text-[#002147] font-bold inline-block">
           &larr; Back to Products
        </Link>

        <div style={STYLES.container} className="prod-container">
          
          {/* --- LEFT: IMAGE GALLERY --- */}
          <div style={STYLES.imageSection} className="img-section">
            <div style={STYLES.mainImgWrapper} className="main-img-wrapper">
               <img src={mainImage} alt={product.name} style={STYLES.mainImg} />
            </div>
            
            <div style={STYLES.thumbnailGrid} className="thumbnail-grid">
              {galleryImages.map((img, i) => (
                <div 
                  key={i} 
                  className="thumb-wrapper"
                  style={{
                    ...STYLES.thumbWrapper, 
                    borderColor: mainImage === img ? '#FF6F00' : '#eef2f7', 
                    boxShadow: mainImage === img ? '0 0 0 2px #FF6F00' : 'none'
                  }} 
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt="thumbnail" style={STYLES.thumbImg} />
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: INFO SECTION --- */}
          <div style={STYLES.infoSection} className="info-section">
            <span style={STYLES.categoryBadge}>{product.category}</span>
            <h1 style={STYLES.title} className="prod-title">{product.name}</h1>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <span style={{color: '#FF6F00', fontSize: '18px'}}> 
                  {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
                </span>
                <span style={{color: '#007600', fontSize: '14px', fontWeight: '600'}}>{product.rating || 0}</span>
              </div>
              <span style={{width: '1px', height: '15px', background: '#ccc'}}></span>
              <span style={{color: '#565959', fontSize: '14px'}}>{product.numReviews || 0} Reviews</span>
            </div>

            <h2 style={STYLES.price} className="prod-price">Rs {product.price.toLocaleString()}</h2>

            {/* --- COLOR OPTIONS --- */}
            {product.colors && product.colors.length > 0 && (
              <div style={{margin: '30px 0'}}>
                <h4 style={STYLES.sectionTitle}>Color: <span style={{color: '#002147', fontWeight: 'bold'}}>{product.colors[selectedColorIdx].colorName}</span></h4>
                <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                  {product.colors.map((c, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { 
                          setSelectedColorIdx(idx); 
                          setMainImage(c.images[0]); 
                      }}
                      style={{
                        ...STYLES.variantBtn, 
                        borderColor: selectedColorIdx === idx ? '#FF6F00' : '#ddd',
                        backgroundColor: selectedColorIdx === idx ? '#fff5e6' : '#fff' 
                      }}
                    >
                      {c.colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- SIZE OPTIONS --- */}
            {product.availableSizes && product.availableSizes.length > 0 && (
                <div style={{margin: '30px 0'}}>
                  <h4 style={STYLES.sectionTitle}>Size: <span style={{color: '#002147', fontWeight: 'bold'}}>{selectedSize || 'Select Size'}</span></h4>
                  <div style={STYLES.sizeButtons}>
                    {product.availableSizes.map(size => (
                      <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)}
                        className="size-btn"
                        style={{
                          ...STYLES.sizeBtn, 
                          backgroundColor: selectedSize === size ? '#002147' : '#fff', 
                          color: selectedSize === size ? '#fff' : '#555',
                          borderColor: selectedSize === size ? '#002147' : '#ddd'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
            )}

            <div style={STYLES.descriptionBox}>
              <p style={STYLES.descText}>{product.description}</p>
            </div>

            {/* ACTION BUTTONS */}
            {product.countInStock > 0 ? (
                <div style={STYLES.actionSection} className="action-section">
                  <button className="cart-btn" style={STYLES.cartBtn} onClick={addToCartHandler}>
                    Add to Cart
                  </button>
                  <button 
                    className="buy-btn"
                    style={STYLES.buyBtn} 
                    onClick={() => {
                       addToCartHandler();
                       navigate('/cart');
                    }}
                  >
                    Buy Now
                  </button>
                </div>
            ) : (
                <div style={{marginTop: '30px', padding: '15px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center'}}>
                    OUT OF STOCK
                </div>
            )}
          </div>
        </div>

        <div style={{height: '1px', background: '#e1e4e8', margin: '60px 0'}}></div>

        {/* --- REVIEW SECTION --- */}
        <div style={STYLES.reviewGrid} className="review-grid">
          
          <div style={{flex: 1.5}}>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: '#002147', marginBottom: '25px'}}>Customer Reviews</h2>
            {product.reviews.length === 0 ? (
              <div style={STYLES.emptyReview}>
                <p style={{color: '#888'}}>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {product.reviews.map((rev, i) => (
                  <div key={i} style={STYLES.reviewCard} className="review-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={STYLES.reviewAvatar}>{rev.name.charAt(0)}</div>
                        <strong style={{fontSize: '15px', color: '#002147'}}>{rev.name}</strong>
                      </div>
                      <span style={{color: '#FF6F00', fontSize: '14px'}}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                    <p style={{color: '#444', lineHeight: '1.5', fontSize: '14px', marginBottom: '10px'}}>{rev.comment}</p>
                    <small style={{color: '#999', fontSize: '12px'}}>{rev.createdAt.substring(0, 10)}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={STYLES.reviewFormBox} className="review-form-box">
            <h3 style={{fontSize: '20px', fontWeight: '700', color: '#002147', marginBottom: '20px'}}>Write a Review</h3>
            {userInfo ? (
                <form onSubmit={submitHandler} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div>
                    <label style={STYLES.formLabel}>Rating</label>
                    <div style={{display: 'flex', gap: '5px'}}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                        key={star}
                        style={{
                            fontSize: '32px',
                            cursor: 'pointer',
                            color: (hoverRating || rating) >= star ? '#FF6F00' : '#e0e0e0',
                            transition: '0.2s'
                        }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        >
                        ★
                        </span>
                    ))}
                    </div>
                </div>
                <div>
                    <label style={STYLES.formLabel}>Comment</label>
                    <textarea 
                    placeholder="Share your thoughts..." 
                    style={STYLES.revInput} 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    required 
                    />
                </div>
                <button type="submit" className="buy-btn" style={STYLES.submitRevBtn} disabled={loadingProductReview}>
                    {loadingProductReview ? 'Submitting...' : 'Submit Review'}
                </button>
                </form>
            ) : (
                <div style={{...STYLES.emptyReview, textAlign: 'center', color: '#666'}}>
                  <p style={{marginBottom: '15px', fontSize: '15px'}}>Please <Link to='/login' style={{color: '#002147', fontWeight: '700', textDecoration: 'underline'}}>sign in</Link> to write a review</p>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ✅ EXACT STYLES (No Changes Here)
const STYLES = {
  container: { display: 'flex', gap: '60px', flexWrap: 'wrap', alignItems: 'flex-start' },
  imageSection: { flex: '1.2', minWidth: '350px' },
  mainImgWrapper: { width: '100%', height: '550px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  mainImg: { width: '90%', height: '90%', objectFit: 'contain' },
  thumbnailGrid: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' },
  thumbWrapper: { width: '90px', height: '90px', borderRadius: '12px', border: '2px solid transparent', overflow: 'hidden', cursor: 'pointer', background: '#fff', padding: '5px' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain' },
  infoSection: { flex: '1', minWidth: '350px' },
  categoryBadge: { display: 'inline-block', padding: '6px 14px', backgroundColor: '#F0F8FF', color: '#002147', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '15px', textTransform: 'uppercase' }, 
  title: { fontSize: '36px', fontWeight: '800', lineHeight: '1.2', color: '#002147', marginBottom: '10px' },
  price: { color: '#B12704', fontSize: '32px', fontWeight: '700', marginBottom: '20px' },
  descriptionBox: { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  descText: { lineHeight: '1.7', color: '#565959', fontSize: '15px' },
  sectionTitle: { fontSize: '14px', color: '#777', fontWeight: 'normal', marginBottom: '10px' },
  variantBtn: { padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', border: '2px solid', fontSize: '13px', fontWeight: '600', transition: '0.2s', minWidth: '80px' },
  sizeButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' },
  sizeBtn: { width: '50px', height: '50px', border: '1px solid #ddd', borderRadius: '50%', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: '0.2s', background: '#fff' },
  actionSection: { display: 'flex', gap: '20px', marginTop: '40px' },
  cartBtn: { flex: '1', padding: '18px', background: '#002147', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#fff', transition: '0.3s' }, 
  buyBtn: { flex: '1', padding: '18px', background: '#FF6F00', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#fff', transition: '0.3s' }, 
  reviewGrid: { display: 'flex', gap: '50px', flexWrap: 'wrap' },
  reviewCard: { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '15px' },
  reviewAvatar: { width: '35px', height: '35px', background: '#F0F8FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#002147', fontSize: '14px' },
  emptyReview: { textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px dashed #ddd' },
  reviewFormBox: { flex: 1, background: '#fff', padding: '35px', borderRadius: '16px', height: 'fit-content', border: '1px solid #e1e4e8', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  formLabel: { fontSize: '14px', fontWeight: '600', color: '#002147', display: 'block', marginBottom: '8px' },
  revInput: { padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', width: '100%', height: '120px', resize: 'none', outline: 'none', fontFamily: 'inherit' },
  submitRevBtn: { width: '100%', padding: '14px', background: '#FF6F00', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', transition: '0.3s', color: '#fff' }
};

export default ProductScreen;