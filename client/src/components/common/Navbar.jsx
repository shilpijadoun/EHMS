import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const getNavClass = ({ isActive }) =>
    `nav-link${isActive ? ' active' : ''}`

  return (
    <nav className="navbar navbar-expand-lg bg-white sticky-top hotel-navbar">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/"
        >
          <span className="hotel-logo">HP</span>
          <span className="hotel-brand-name">HOTEL PALACE</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#hotelNavbar"
          aria-controls="hotelNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="hotelNavbar">
          <div className="navbar-nav mx-auto">
            <NavLink to="/" end className={getNavClass}>
              Home
            </NavLink>

            <NavLink to="/rooms" className={getNavClass}>
              Our Rooms
            </NavLink>

            <NavLink to="/booking" className={getNavClass}>
              Booking
            </NavLink>
          </div>

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `btn hotel-outline-btn${isActive ? ' active' : ''}`
            }
          >
            Login
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar