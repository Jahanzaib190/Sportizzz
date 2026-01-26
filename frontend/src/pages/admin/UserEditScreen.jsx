import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetUserDetailsQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

// ✅ PROFESSIONAL STYLES (Matching Product/Category Edit Pages)
const CSS_OVERRIDES = `
  .user-edit-container { background: #f4f7f9; min-height: 100vh; padding: 40px 20px; font-family: 'Poppins', sans-serif; }
  .form-card { background: #fff; padding: 40px; borderRadius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #fff; max-width: 600px; margin: 0 auto; }
  
  .stylish-input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: 0.2s; background: #fff; color: #333; }
  .stylish-input:focus { border-color: #FF6F00; box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.1); }
  
  .update-btn { width: 100%; padding: 14px; background: #FF6F00; color: #fff; border: none; border-radius: 50px; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.3s; margin-top: 20px; }
  .update-btn:hover:not(:disabled) { background: #e65c00; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(230, 92, 0, 0.3); }
  
  .back-btn { background: transparent; border: 2px solid #002147; color: #002147; padding: 8px 20px; border-radius: 30px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; margin-bottom: 20px; }
  .back-btn:hover { background: #002147; color: #fff; }

  /* Checkbox Style */
  .checkbox-wrapper { display: flex; align-items: center; gap: 10px; margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; cursor: pointer; transition: 0.2s; }
  .checkbox-wrapper:hover { border-color: #FF6F00; background: #fffbf5; }
  .custom-checkbox { accent-color: #FF6F00; width: 18px; height: 18px; cursor: pointer; }
`;

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data
  const { data: user, isLoading, refetch, error } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, isAdmin }).unwrap(); // .unwrap() handles error automatically
      toast.success('User updated successfully');
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="user-edit-container fade-up">
      <style>{CSS_OVERRIDES}</style>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <button onClick={() => navigate('/admin/userlist')} className="back-btn">
           &larr; Go Back
        </button>

        <div className="form-card">
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#002147', marginBottom: '30px', textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            Edit User
          </h1>

          {loadingUpdate && <Loader />}

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error?.data?.message || error.error}</Message>
          ) : (
            <form onSubmit={submitHandler}>
              
              {/* Name Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#002147', marginBottom: '8px' }}>Full Name</label>
                <input
                  type='text'
                  placeholder='Enter name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="stylish-input"
                />
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#002147', marginBottom: '8px' }}>Email Address</label>
                <input
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="stylish-input"
                />
              </div>

              {/* Is Admin Checkbox */}
              <label className="checkbox-wrapper">
                <input
                  type='checkbox'
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="custom-checkbox"
                />
                <div>
                    <span style={{ display: 'block', fontWeight: '700', color: '#002147', fontSize: '14px' }}>Admin Privileges</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>Grant full access to this user</span>
                </div>
              </label>

              <button type='submit' className="update-btn" disabled={loadingUpdate}>
                {loadingUpdate ? 'Updating...' : 'Update User'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEditScreen;