import { Link, useNavigate } from 'react-router-dom'
function Footer() {
  return (
      <footer className="hotel-footer">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-6">
              <Link to="/" className="hotel-footer-brand">
                HOTEL PALACE
              </Link>
              <p className="mt-3 mb-0">
                Comfort, hospitality and memorable stays.
              </p>
            </div>

            <div className="col-md-3">
              <h6>Explore</h6>
              <Link to="/">Home</Link>
              <Link to="/rooms">Our Rooms</Link>
              <Link to="/booking">Booking</Link>
            </div>

            <div className="col-md-3">
              <h6>Account</h6>
              <Link to="/login">Login</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </div>

          <hr className="border-secondary my-4" />

          <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
            <small>© {new Date().getFullYear()} Hotel Palace. All rights reserved.</small>
            <small>Comfort in every stay.</small>
          </div>
        </div>
      </footer>
  )
}

export default Footer