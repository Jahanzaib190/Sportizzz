import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import Loader from './Loader';
import Message from './Message';
import { Link } from 'react-router-dom';

const CategorySection = () => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  // Get random 4 categories (or just slice the first 4)
  const displayCategories = categories ? categories.slice(0, 4) : [];

  return (
    <>
      {displayCategories.map((cat) => (
        <Link 
          key={cat._id} 
          to={`/category/${cat.name}`} // We will build this route next
          className="bg-slate-800 hover:bg-slate-700 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center transition group"
        >
          {cat.image ? (
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="w-16 h-16 object-cover rounded-full mb-3 border-2 border-lime-500 group-hover:scale-110 transition"
            />
          ) : (
             // Placeholder if no image
            <div className="w-16 h-16 bg-slate-700 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-gray-400 group-hover:bg-lime-500 group-hover:text-slate-900 transition">
              {cat.name.charAt(0)}
            </div>
          )}
          <h3 className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-lime-400">
            {cat.name}
          </h3>
        </Link>
      ))}
    </>
  );
};

export default CategorySection;