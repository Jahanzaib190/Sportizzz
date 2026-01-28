import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  const imageSrc = product.colors?.[0]?.images?.[0] || product.image;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
      {/* 1. Image Section (Mobile: 150px, Desktop: 220px) */}
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="w-full h-[150px] md:h-[220px] bg-white border-b border-gray-50 flex justify-center items-center p-2 md:p-4 overflow-hidden">
          <img
            src={imageSrc}
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
          <Link to={`/product/${product._id}`}>
            <h3 className="text-[13px] md:text-base font-bold text-[#002147] mb-1 leading-snug h-[36px] md:h-[42px] overflow-hidden line-clamp-2 hover:text-[#FF6F00] transition-colors">
              {product.name}
            </h3>
          </Link>

          <h3 className="text-base md:text-lg font-extrabold text-[#FF6F00] mb-1">
            Rs {product.price?.toLocaleString()}
          </h3>

          <p className={`text-[10px] md:text-[11px] font-bold mt-1 ${product.countInStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
      </div>

      {/* 3. Button Section */}
      <div className="px-3 pb-3 md:px-4 md:pb-4">
        <Link
          to={`/product/${product._id}`}
          className={`w-full py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 ${
            product.countInStock > 0
              ? 'bg-[#002147] text-white hover:bg-[#001532] hover:shadow-lg cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
          }`}
        >
          {product.countInStock > 0 ? 'View Product' : 'Sold Out'}
        </Link>
      </div>
    </div>
  );
};

export default Product;