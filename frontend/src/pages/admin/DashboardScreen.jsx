import { useState, useRef, useMemo, useEffect } from 'react';
import { FaChartLine, FaShoppingBag, FaCalendarDay, FaPrint, FaFilter, FaSort, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { useGetOrderStatsQuery } from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const DashboardScreen = () => {
  // ✅ DATA FETCHING (Using New Endpoint)
  const { data: statsData, isLoading, error } = useGetOrderStatsQuery();
  
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [sortType, setSortType] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filterRef = useRef(null);

  // --- DERIVED STATE ---
  const allStats = useMemo(() => statsData?.data || [], [statsData]);

  // --- SORTING LOGIC ---
  const finalProcessedData = useMemo(() => {
    let processed = [...allStats];
    if (sortType === 'date') {
       processed.sort((a, b) => new Date(b._id) - new Date(a._id)); // Newest first
    } else if (sortType === 'max') {
       processed.sort((a, b) => b.dailySales - a.dailySales);
    } else if (sortType === 'min') {
       processed.sort((a, b) => a.dailySales - b.dailySales);
    }
    return processed;
  }, [allStats, sortType]);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = finalProcessedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(finalProcessedData.length / itemsPerPage);

  // --- TOTALS ---
  const totalRevenue = allStats.reduce((acc, curr) => acc + curr.dailySales, 0);
  const totalOrders = allStats.reduce((acc, curr) => acc + curr.count, 0);

  const handlePrint = () => window.print();

  // Close filter on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message || 'Failed to load finance data. Check Backend!'}</Message>;

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-extrabold text-sport-blue tracking-tight">Finance Dashboard</h1>
             <p className="text-gray-500 text-sm mt-1">Overview of your store's performance</p>
          </div>
          <button 
            onClick={handlePrint} 
            className="hidden md:flex items-center gap-2 bg-white border-2 border-sport-blue text-sport-blue px-6 py-2.5 rounded-full font-bold hover:bg-sport-blue hover:text-white transition-all shadow-sm print:hidden"
          >
            <FaPrint /> Print Report
          </button>
        </div>

        {/* --- SUMMARY CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:grid-cols-3">
          
          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-[#B12704] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
             <div className="flex justify-between items-center relative z-10">
                <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
                   <h2 className="text-3xl font-extrabold text-[#B12704]">PKR {totalRevenue.toLocaleString()}</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#B12704]/10 flex items-center justify-center text-[#B12704] text-xl group-hover:scale-110 transition-transform">
                   <FaChartLine />
                </div>
             </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-[#007600] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
                   <h2 className="text-3xl font-extrabold text-sport-blue">{totalOrders}</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#007600]/10 flex items-center justify-center text-[#007600] text-xl group-hover:scale-110 transition-transform">
                   <FaShoppingBag />
                </div>
             </div>
          </div>

          {/* Active Days */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-sport-blue hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Days</p>
                   <h2 className="text-3xl font-extrabold text-sport-blue">{allStats.length} Days</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-sport-blue/10 flex items-center justify-center text-sport-blue text-xl group-hover:scale-110 transition-transform">
                   <FaCalendarDay />
                </div>
             </div>
          </div>
        </div>

        {/* --- LEDGER TABLE SECTION --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <h3 className="text-xl font-bold text-sport-blue">Daily Breakdown Ledger</h3>
             
             <div className="flex gap-2 relative print:hidden" ref={filterRef}>
                <button 
                   onClick={() => setSortType(prev => prev === 'date' ? 'max' : prev === 'max' ? 'min' : 'date')} 
                   className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${sortType !== 'date' ? 'bg-orange-50 border-sport-orange text-sport-orange' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                   title="Sort Data"
                >
                   {sortType === 'date' ? <FaSort /> : sortType === 'max' ? <FaArrowDown /> : <FaArrowUp />}
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px] hidden md:table">
                <thead className="bg-gray-50 text-gray-500">
                   <tr>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider">Orders Count</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider">Daily Revenue</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {currentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                         <td className="p-4 text-sm font-medium text-gray-700">{item._id}</td>
                         <td className="p-4 text-sm text-gray-600">{item.count} Orders</td>
                         <td className="p-4 text-sm font-bold text-sport-blue">PKR {item.dailySales.toLocaleString()}</td>
                         <td className="p-4">
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Recorded</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>

             {/* MOBILE VIEW (Cards) */}
             <div className="md:hidden p-4 space-y-4">
                {currentItems.map((item, index) => (
                   <div key={index} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-gray-700">{item._id}</span>
                         <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Recorded</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-xs text-gray-500">Orders</p>
                            <p className="font-bold text-sport-blue">{item.count}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-gray-500">Revenue</p>
                            <p className="font-bold text-[#B12704] text-lg">PKR {item.dailySales.toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
             <div className="p-6 border-t border-gray-100 flex justify-center items-center gap-4 print:hidden">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Prev</button>
                <span className="text-sm font-bold text-sport-blue">Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Next</button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;