import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-sport-blue text-sport-light pt-16 border-t border-white/10 font-sans mt-auto">
      
      {/* --- Main Content Grid --- */}
      <div className="max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        
        {/* COLUMN 1: Brand Info */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-3xl font-extrabold uppercase tracking-wide mb-4">
            SPORTS<span className="text-sport-orange">GEAR</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            We provide premium quality sports equipment and apparel for champions. 
            Designed for performance, built for durability.
          </p>
        </div>

        {/* COLUMN 2: Quick Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-6 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-sport-orange">
            Quick Links
          </h3>
          <ul className="space-y-3 w-full">
            <li>
              <Link to="/" className="block text-sport-light hover:text-sport-orange hover:translate-x-2 transition-all duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/categories" className="block text-sport-light hover:text-sport-orange hover:translate-x-2 transition-all duration-300">
                Shop Collection
              </Link>
            </li>
            <li>
              <Link to="/my-orders" className="block text-sport-light hover:text-sport-orange hover:translate-x-2 transition-all duration-300">
                My Orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className="block text-sport-light hover:text-sport-orange hover:translate-x-2 transition-all duration-300">
                My Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: Social & Contact */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-6 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-sport-orange">
            Connect With Us
          </h3>
          
          {/* Social Icons */}
          <div className="flex gap-4 mb-6">
            <a 
              href="https://www.facebook.com/jahanzaib.khan.98658" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-[#1877F2] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/40"
            >
              <FaFacebook />
            </a>
            <a 
              href="https://www.instagram.com/jahanzaibkhan1904/" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-[#E1306C] hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/40"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://wa.me/923318309188" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-[#25D366] hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/40"
            >
              <FaWhatsapp />
            </a>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <p className="flex items-center justify-center md:justify-start text-sm text-gray-300">
              <FaPhone className="text-sport-orange mr-3" /> 
              0331 8309188
            </p>
            <p className="flex items-center justify-center md:justify-start text-sm text-gray-300">
              <FaEnvelope className="text-sport-orange mr-3" /> 
              jahanzaib1904@gmail.com
            </p>
          </div>
        </div>

      </div>

      {/* --- Bottom Bar --- */}
      <div className="bg-[#001835] py-6 text-center text-sm text-gray-400 border-t border-white/5">
        <p>© {currentYear} SportsGear. Designed for Champions.</p>
      </div>
    </footer>
  );
};

export default Footer;