import { useState, useMemo } from 'react';
import { useGetUsersQuery, useDeleteUserMutation } from '../../slices/usersApiSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { FaTrash, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';

const CSS_OVERRIDES = `
  .user-row:hover { background-color: #f1f6fb; transition: 0.2s ease-in-out; }
  .search-input:focus { border-color: #007185 !important; box-shadow: 0 0 0 3px rgba(0, 113, 133, 0.1); }
  .page-btn:hover:not(:disabled) { background-color: #e2e6ea !important; color: #002147 !important; }
  .mobile-user-card { display: none; }
  @media (max-width: 768px) {
    .user-table { display: none !important; }
    .mobile-user-card { display: block; background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #eee; }
    .header-row { flex-direction: column !important; align-items: flex-start !important; gap: 15px !important; }
    .search-input { width: 100% !important; }
  }
`;

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const deleteHandler = async (id) => {
    if (window.confirm('Delete user?')) {
      try {
        await deleteUser(id);
        toast.success('User deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const { currentUsers, totalPages, filteredCount } = useMemo(() => {
    if (!users) return { currentUsers: [], totalPages: 0, filteredCount: 0 };
    
    const filtered = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filtered.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filtered.length / usersPerPage);

    return { currentUsers, totalPages, filteredCount: filtered.length };
  }, [users, searchTerm, currentPage]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', background: '#f4f7f9', minHeight: '100vh' }}>
      <style>{CSS_OVERRIDES}</style>
      
      {/* HEADER */}
      <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#002147', margin: 0 }}>Users</h1>
            <p style={{ color: '#565959', fontSize: '14px', margin: 0 }}>Manage registered customers</p>
        </div>
        <input 
          type="text" placeholder="Search name or email..." 
          className="search-input"
          style={{ width: '320px', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          
          {/* DESKTOP TABLE */}
          <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '16px', color: '#555' }}>ID</th>
                <th style={{ padding: '16px', color: '#555' }}>NAME</th>
                <th style={{ padding: '16px', color: '#555' }}>EMAIL</th>
                <th style={{ padding: '16px', color: '#555' }}>ADMIN</th>
                <th style={{ padding: '16px', color: '#555' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user._id} className="user-row" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px', color: '#007185', fontWeight: '600' }}>#{user._id.substring(0, 10)}...</td>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: '#002147' }}>{user.name}</td>
                  <td style={{ padding: '16px' }}><a href={`mailto:${user.email}`} style={{color: '#555'}}>{user.email}</a></td>
                  <td style={{ padding: '16px' }}>
                    {user.isAdmin ? <FaCheck style={{ color: 'green' }} /> : <FaTimes style={{ color: 'red' }} />}
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '10px' }}>
                    <Link to={`/admin/user/${user._id}/edit`} style={{color: '#333'}}><FaEdit /></Link>
                    <button onClick={() => deleteHandler(user._id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* MOBILE LIST */}
          <div className="mobile-user-list">
             {currentUsers.map(user => (
               <div key={user._id} className="mobile-user-card">
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <h4 style={{margin: 0, color: '#002147'}}>{user.name}</h4>
                    {user.isAdmin && <span style={{fontSize: '11px', background: '#e6f4ea', color: '#1e7e34', padding: '2px 8px', borderRadius: '12px'}}>ADMIN</span>}
                 </div>
                 <p style={{fontSize: '13px', color: '#555', marginBottom: '10px'}}>{user.email}</p>
                 <div style={{borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                    <Link to={`/admin/user/${user._id}/edit`} style={{color: '#333', textDecoration:'none', fontSize:'13px', fontWeight:'bold'}}>Edit</Link>
                    <button onClick={() => deleteHandler(user._id)} style={{color: 'red', border: 'none', background: 'none', fontSize:'13px', fontWeight:'bold'}}>Delete</button>
                 </div>
               </div>
             ))}
          </div>

          {/* PAGINATION */}
          <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '13px', color: '#666' }}>Showing {currentUsers.length} of {filteredCount}</span>
             {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="page-btn" style={{padding: '6px 14px', border: '1px solid #d5d9d9', background: '#f0f2f2', borderRadius: '6px'}}>Prev</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="page-btn" style={{padding: '6px 14px', border: '1px solid #d5d9d9', background: '#f0f2f2', borderRadius: '6px'}}>Next</button>
                </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
};

export default UserListScreen;