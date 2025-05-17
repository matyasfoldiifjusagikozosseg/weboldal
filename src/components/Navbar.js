import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, CalendarDaysIcon, InformationCircleIcon } from '../utils'; // Import icons

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", text: "Főoldal", icon: <HomeIcon className="w-5 h-5 mr-2" /> },
    { to: "/events", text: "Események", icon: <CalendarDaysIcon className="w-5 h-5 mr-2" /> },
    { to: "/about", text: "Rólunk", icon: <InformationCircleIcon className="w-5 h-5 mr-2" /> }
  ];

  return (
    <nav className="bg-mik-dark-blue shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-mik-white">
              <img className="h-12 w-auto mr-3" src={process.env.PUBLIC_URL + '/MIK_logo.png'} alt="MIK Logo" />
              <span className="font-bold text-xl tracking-tight">Mátyásföldi Ifjúsági Közösség</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-mik-light-blue hover:bg-mik-gold hover:text-mik-dark-blue px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center"
                >
                  {link.icon}
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} type="button" className="bg-mik-gold inline-flex items-center justify-center p-2 rounded-md text-mik-dark-blue hover:text-mik-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-mik-dark-blue focus:ring-mik-white transition-all duration-300" aria-controls="mobile-menu" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-mik-dark-blue bg-opacity-95`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)} // Close menu on link click
              className="text-mik-light-blue hover:bg-mik-gold hover:text-mik-dark-blue block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 flex items-center"
            >
              {link.icon}
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
