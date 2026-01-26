import { Outlet } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify'; // ✅ Removed
// import 'react-toastify/dist/ReactToastify.css'; // ✅ Removed
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <>
      {/* LAYOUT CHANGE: 
         1. bg-[#F0F8FF] -> Sets light background globally.
         2. min-h-screen & flex-col -> Makes sure footer pushes to bottom.
      */}
      <div className="flex flex-col min-h-screen bg-[#F0F8FF]">
        
        <Header />
        
        {/* flex-grow pushes the Footer down if content is short */}
        <main className="flex-grow w-full"> 
            {/* Removed 'container' here because HomeScreen handles its own width now */}
            <Outlet />
        </main>
        
        <Footer />
        
      </div>
      
      {/* <ToastContainer /> */} {/* ✅ Notification system removed */}
    </>
  );
};

export default App;