
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../assets/css/home.css'
import Footer from '../../components/common/Footer'
import RoomCard from '../../components/public/RoomCard'
import Navbar from '../../components/common/Navbar'



function Home() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const today = new Date().toLocaleDateString('en-CA')

  function handleSearch(event) {
    event.preventDefault()

    const params = new URLSearchParams()

    if (location.trim()) params.set('location', location.trim())
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)

    navigate(`/rooms?${params.toString()}`)
  }

  return (
    <div className="hotel-home">
      {/* Navigation */}
     <Navbar/>

      {/* Hero and search */}
      <section className="hotel-hero">
        <div className="hotel-hero-overlay" />

        <div className="container hotel-hero-content">
          <span className="hotel-eyebrow">WELCOME TO HOTEL PALACE</span>

          <h1>
            Find Your Perfect
            <br />
            <span>Place to Stay</span>
          </h1>

          <p>
            Discover comfort, exceptional hospitality and memorable stays.
            Your next getaway starts here.
          </p>

          <form className="hotel-search" onSubmit={handleSearch}>
            <div className="hotel-search-field">
              <label htmlFor="hotel-location">Destination</label>
              <input
                id="hotel-location"
                className="form-control"
                type="text"
                placeholder="Enter city or location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>

            <div className="hotel-search-field">
              <label htmlFor="hotel-checkin">Check-in</label>
              <input
                id="hotel-checkin"
                className="form-control"
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </div>

            <div className="hotel-search-field">
              <label htmlFor="hotel-checkout">Check-out</label>
              <input
                id="hotel-checkout"
                className="form-control"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>

            <button className="btn hotel-search-btn" type="submit">
              <i className="bi bi-search me-2" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Introduction */}
      <section className="container hotel-section">
        <div className="text-center hotel-section-heading">
          <span className="hotel-eyebrow">DISCOVER HOTEL PALACE</span>
          <h2>Hospitality That Feels Like Home</h2>
          <p>
            Every stay should be comfortable, convenient and memorable.
            Let us help you find the right room for your journey.
          </p>
        </div>

        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="hotel-intro-content">
              <span className="hotel-eyebrow">YOUR COMFORT, OUR PRIORITY</span>
              <h3>A Better Way to Plan Your Stay</h3>
              <p>
                Explore accommodation options, compare room types and find
                a stay that suits your travel plans. Hotel Palace makes
                discovering your next stay simple and convenient.
              </p>

              <ul className="hotel-benefits list-unstyled">
                <li>
                  <i className="bi bi-check-circle-fill" />
                  Comfortable room options
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" />
                  Simple booking experience
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" />
                  A welcoming hospitality experience
                </li>
              </ul>

              <Link to="/rooms" className="btn hotel-primary-btn">
                Explore Rooms <i className="bi bi-arrow-right ms-2" />
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <img
              src="/public/img/lights-the-evening-netherlands-holland-zaandam-hd-wallpaper-preview.jpg"
              className="img-fluid hotel-feature-image"
              alt="Beautiful destination at dusk"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Rooms */}
      <RoomCard/>

      {/* Experience */}
      <section className="container hotel-section">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <img
              src="/public/img/Jeffrey-Beers-International-Park-Hyatts-Manhattan-Sky-Suite-1.jpg"
              className="img-fluid hotel-feature-image"
              alt="Elegant hotel suite interior"
              loading="lazy"
            />
          </div>

          <div className="col-lg-6">
            <div className="hotel-intro-content ps-lg-4">
              <span className="hotel-eyebrow">MAKE IT MEMORABLE</span>
              <h2>More Than Just a Place to Sleep</h2>
              <p>
                Whether you are travelling for business or leisure, discover
                room options designed to make your stay comfortable.
              </p>
              <Link to="/booking" className="btn hotel-primary-btn">
                Plan Your Stay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    
    </div>
  )
}

export default Home
