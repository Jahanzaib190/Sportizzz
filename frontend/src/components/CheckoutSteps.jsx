import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  // Helper to style active vs inactive links
  const getLinkClass = (stepActive) => 
    stepActive 
      ? "text-lime-400 font-bold hover:text-lime-300" 
      : "text-gray-500 cursor-not-allowed";

  return (
    <nav className="flex justify-center mb-8">
      <ul className="flex space-x-8 text-sm md:text-base">
        <li>
          {step1 ? <Link to="/login" className={getLinkClass(true)}>Sign In</Link> : <span className={getLinkClass(false)}>Sign In</span>}
        </li>
        <li>
           {/* We use unicode arrow (→) for separation */}
           <span className="text-gray-600 mx-2">→</span>
        </li>
        <li>
          {step2 ? <Link to="/shipping" className={getLinkClass(true)}>Shipping</Link> : <span className={getLinkClass(false)}>Shipping</span>}
        </li>
        <li><span className="text-gray-600 mx-2">→</span></li>
        <li>
          {step3 ? <Link to="/payment" className={getLinkClass(true)}>Payment</Link> : <span className={getLinkClass(false)}>Payment</span>}
        </li>
        <li><span className="text-gray-600 mx-2">→</span></li>
        <li>
          {step4 ? <Link to="/placeorder" className={getLinkClass(true)}>Place Order</Link> : <span className={getLinkClass(false)}>Place Order</span>}
        </li>
      </ul>
    </nav>
  );
};

export default CheckoutSteps;