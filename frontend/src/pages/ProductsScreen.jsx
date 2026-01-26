import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import { FaArrowLeft, FaFilter } from 'react-icons/fa';

const ProductsScreen = () => {
  const { pageNumber, keyword } = useParams();
  const navigate = useNavigate();
  const [sortType, setSortType] = useState('newest');

  const { data, isLoading, error } = useGetProductsQuery({ 
    keyword, 
    pageNumber: pageNumber || 1 
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNumber, keyword]);

  const sortedProducts = useMemo(() => {
    if (!data?.products) return [];
    let products = [...data.products];
    
    if (sortType === 'newest') {
      // Default sort
    } else if (sortType === 'low-high') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortType === 'high-low') {
      products.sort((a, b) => b.price - a.price);
    }
    
    return products;
  }, [data, sortType]);

  return (
    <div className="bg-[#F0F8FF] min-h-screen py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-6 md:mb-8 mt-2">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 bg-transparent border-2 border-[#002147] text-[#002147] px-4 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-xs md:text-sm hover:bg-[#002147] hover:text-white transition-all duration-300"
            >
              <FaArrowLeft /> <span className="hidden md:inline">Back Home</span><span className="md:hidden">Back</span>
            </button>
            
            <span className="text-gray-500 text-[10px] md:text-xs font-bold bg-gray-200 px-3 py-1 rounded-full">
              {data?.products?.length || 0} Products
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#002147] tracking-tight">
                {keyword ? `Results: "${keyword}"` : 'All Products'}
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                {keyword ? 'Browse search results' : 'Latest collection & best deals'}
              </p>
            </div>

            <div className="relative group self-end md:self-auto">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm text-[#002147] group-hover:border-[#FF6F00] group-hover:text-[#FF6F00] group-hover:scale-105 transition-all duration-300 cursor-pointer">
                <FaFilter size={16} className="md:text-lg" />
              </div>
              <select 
                value={sortType} 
                onChange={(e) => setSortType(e.target.value)}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="newest">Sort by: Default</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- PRODUCT GRID (View System Matched) --- */}
        {/* Mobile: grid-cols-2 & gap-3 (12px) | Desktop: grid-cols-4 & gap-6 (24px) */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {sortedProducts.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>

            <div className="mt-8 md:mt-12 flex justify-center">
              <Paginate 
                pages={data.pages} 
                page={data.page} 
                keyword={keyword ? keyword : ''} 
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ProductsScreen;