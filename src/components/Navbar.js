import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="navbar">
    <Link to="/" className="nav-link">
      Home
    </Link>
    <Link to="/printit" className="nav-link">
      PrintIt
    </Link>
    <Link to="/privacy" className="nav-link">
      Privacy Policy
    </Link>
    <Link to="/contact" className="nav-link">
      Contact
    </Link>
  </nav>
);

export default Navbar;
