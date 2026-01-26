import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBox = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();
  const [keyword, setKeyword] = useState(urlKeyword || '');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setKeyword('');
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex items-center w-full bg-white rounded-full overflow-hidden px-1 py-1 shadow-inner">
      <input
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder="Search Products..."
        className="w-full bg-transparent text-gray-700 px-4 py-1.5 border-none focus:outline-none placeholder-gray-400"
      />
      <button 
        type="submit" 
        className="bg-sport-blue text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-opacity-90 transition transform hover:scale-105"
      >
        <FaSearch size={14} />
      </button>
    </form>
  );
};

export default SearchBox;