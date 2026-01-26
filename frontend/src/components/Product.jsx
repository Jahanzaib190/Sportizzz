import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';

const Product = ({ product }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (e) => {
    e.preventDefault();
    if (product.countInStock > 0) {
      dispatch(addToCart({ ...product, qty: 1 }));
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Sorry, Product is Out of Stock');
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
      
      {/* 1. Image Section (Mobile: 150px, Desktop: 220px) */}
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="w-full h-[150px] md:h-[220px] bg-white border-b border-gray-50 flex justify-center items-center p-2 md:p-4 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" 
          />
        </div>
        
        {product.countInStock === 0 && (
           <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded uppercase tracking-wide">
             Sold Out
           </span>
        )}
      </Link>

      {/* 2. Details Section (Mobile: p-3, Desktop: p-4) */}
      <div className="p-3 md:p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Title (Mobile: 13px, Desktop: 16px) */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-[13px] md:text-base font-bold text-[#002147] mb-1 leading-snug h-[36px] md:h-[42px] overflow-hidden line-clamp-2 hover:text-[#FF6F00] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price (Mobile: 16px, Desktop: 18px) */}
          <h3 className="text-base md:text-lg font-extrabold text-[#FF6F00] mb-1">
            Rs {product.price?.toLocaleString()}
          </h3>

          {/* Stock Status (Mobile: 10px, Desktop: 11px) */}
          <p className={`text-[10px] md:text-[11px] font-bold mt-1 ${product.countInStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
      </div>

      {/* 3. Button Section (Mobile: Smaller padding/text) */}
      <div className="px-3 pb-3 md:px-4 md:pb-4">
        <button 
          onClick={addToCartHandler}
          disabled={product.countInStock === 0}
          className={`w-full py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 ${
            product.countInStock > 0 
            ? 'bg-[#FF6F00] text-white hover:bg-[#e65c00] hover:shadow-lg cursor-pointer' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.countInStock > 0 ? (
            <> <FaShoppingCart className="text-xs md:text-sm"/> <span className="md:inline">Add</span><span className="hidden md:inline"> to Cart</span> </>
          ) : (
            'Sold Out'
          )}
        </button>
      </div>
    </div>
  );
};

export default Product;