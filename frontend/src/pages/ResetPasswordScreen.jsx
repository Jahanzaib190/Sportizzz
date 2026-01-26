import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { useResetPasswordMutation } from '../slices/usersApiSlice';
import { FaLock, FaCheckCircle, FaArrowLeft, FaKey } from 'react-icons/fa';

const ResetPasswordScreen = () => {
  const [otp, setOtp] = useState(''); // <--- State for OTP
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!otp) {
        toast.error('Please enter the OTP sent to your email');
        return;
    }

    try {
      // Send OTP (as token) and new password to backend
      await resetPassword({ token: otp, password }).unwrap();
      
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
       <Link 
        to='/login' 
        className='inline-flex items-center text-gray-400 hover:text-lime-400 transition mb-6 font-medium'
      >
        <FaArrowLeft className="mr-2" /> Back to Login
      </Link>

      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 border-b border-gray-700 text-center">
            <div className="mx-auto bg-lime-500/10 w-16 h-16 rounded-full flex items-center justify-center text-lime-400 mb-3">
                <FaCheckCircle size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white m-0">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-2">
                Enter the OTP from your email and a new password.
            </p>
        </div>

        <div className="p-8">
          <Form onSubmit={submitHandler} className="flex flex-col gap-5">
            
            {/* OTP Input - NEW FIELD */}
            <div>
               <label className="text-gray-300 font-medium mb-1 block text-sm">OTP Code</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-gray-500" />
                  </div>
                  <Form.Control
                    type='text'
                    placeholder='Enter 6-digit OTP'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 bg-slate-700 border-gray-600 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 py-3 rounded-lg font-mono tracking-widest"
                  />
               </div>
            </div>

            {/* New Password */}
            <div>
               <label className="text-gray-300 font-medium mb-1 block text-sm">New Password</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-500" />
                  </div>
                  <Form.Control
                    type='password'
                    placeholder='Enter new password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700 border-gray-600 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 py-3 rounded-lg"
                  />
               </div>
            </div>

            {/* Confirm Password */}
            <div>
               <label className="text-gray-300 font-medium mb-1 block text-sm">Confirm Password</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-500" />
                  </div>
                  <Form.Control
                    type='password'
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-slate-700 border-gray-600 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 py-3 rounded-lg"
                  />
               </div>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-3 rounded-lg transition-all border-none mt-2'
            >
              {isLoading ? <Loader /> : 'Change Password'}
            </Button>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;