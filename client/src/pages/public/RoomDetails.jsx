import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import {
  MapPin,
  Star,
  Wifi,
  Snowflake,
  Tv,
  CarFront,
  BedDouble,
  Users,
  CheckCircle2,
  ChevronRight,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import {
    hotels
} from '../../constants/room.constants'

function RoomDetails() {
  const { id } = useParams()
  const hotel = hotels.find((item) => String(item.id) === String(id))

  const [activeImage, setActiveImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  const today = new Date().toISOString().split('T')[0]

  if (!hotel) {
    return (
      <main className="container py-5 text-center">
        <h2 className="fw-bold">Hotel not found</h2>
        <p className="text-secondary">
          The hotel you are looking for does not exist.
        </p>
        <Link to="/rooms" className="btn btn-dark">
          Browse Hotels
        </Link>
      </main>
    )
  }

  const facilityIcons = {
    WIFI: <Wifi size={19} />,
    AC: <Snowflake size={19} />,
    TV: <Tv size={19} />,
    Parking: <CarFront size={19} />,
    'Single bed': <BedDouble size={19} />,
  }

  const images = hotel.images || []
  const roomPrice = hotel.price || 0

  const handleBooking = (event) => {
    event.preventDefault()

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates.')
      return
    }

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date.')
      return
    }

    const bookingDetails = new URLSearchParams({
      hotelId: String(hotel.id),
      checkIn,
      checkOut,
      guests: String(guests),
    })

    window.location.href = `/booking/${hotel.id}?${bookingDetails.toString()}`
  }

  return (
    <>
    {/* Navigation */}
    <Navbar/>
    <main className="container-fluid px-3 px-lg-5 py-4">

    {/* Breadcrumb */}
    <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
        <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-secondary">
            Home
            </Link>
        </li>
        <li className="breadcrumb-item">
            <Link
            to="/rooms"
            className="text-decoration-none text-secondary"
            >
            Hotels
            </Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
            {hotel.name}
        </li>
        </ol>
    </nav>

    {/* Hotel heading */}
    <section className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
        <h1 className="fw-bold mb-2">{hotel.name}</h1>

        <p className="text-secondary mb-2">
            <MapPin size={17} className="me-2" />
            {hotel.address || hotel.location}
        </p>

        <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="badge text-bg-success py-2">
            <Star size={14} fill="currentColor" className="me-1" />
            {hotel.rating} / 5
            </span>

            <span className="text-secondary small">
            {hotel.reviews} guest reviews
            </span>

            <span className="badge text-bg-light border">
            {hotel.category}
            </span>
        </div>
        </div>

        <button
        type="button"
        className="btn btn-outline-dark rounded-pill"
        onClick={() => setIsFavorite(!isFavorite)}
        >
        <Heart
            size={17}
            className="me-2"
            fill={isFavorite ? 'currentColor' : 'none'}
        />
        {isFavorite ? 'Saved' : 'Save Hotel'}
        </button>
    </section>

    {/* Image gallery */}
    <section className="mb-5">
        <div className="row g-3">
        <div className="col-12 col-lg-8">
            <div className="rounded-4 overflow-hidden bg-light">
            {images.length > 0 ? (
                <img
                src={images[activeImage] || images[0]}
                alt={hotel.name}
                className="w-100"
                style={{
                    height: '420px',
                    objectFit: 'cover',
                }}
                />
            ) : (
                <div
                className="d-flex align-items-center justify-content-center text-secondary"
                style={{ height: '420px' }}
                >
                No hotel images available
                </div>
            )}
            </div>
        </div>

        <div className="col-12 col-lg-4">
            <div className="row g-3">
            {images.slice(0, 4).map((image, index) => (
                <div className="col-6" key={`${image}-${index}`}>
                <button
                    type="button"
                    className={`p-0 w-100 border rounded-3 overflow-hidden ${
                    activeImage === index ? 'border-dark border-2' : ''
                    }`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View hotel image ${index + 1}`}
                >
                    <img
                    src={image}
                    alt={`${hotel.name} view ${index + 1}`}
                    className="w-100"
                    style={{
                        height: '195px',
                        objectFit: 'cover',
                    }}
                    />
                </button>
                </div>
            ))}
            </div>
        </div>
        </div>
    </section>

    <div className="row g-4">
        {/* Details */}
        <div className="col-12 col-lg-8">
        <section className="border-bottom pb-4 mb-4">
            <h3 className="fw-bold mb-3">About this hotel</h3>
            <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            Welcome to {hotel.name}, located in {hotel.location}. Enjoy a
            comfortable stay with convenient access to nearby attractions.
            Choose the room that suits your needs and plan your stay with
            ease.
            </p>
            <p className="text-secondary mb-0">
            The hotel offers {hotel.category?.toLowerCase()} and a{' '}
            {hotel.type?.toLowerCase()} accommodation option.
            </p>
        </section>

        {/* Facilities */}
        <section className="border-bottom pb-4 mb-4">
            <h3 className="fw-bold mb-4">Hotel facilities</h3>

            <div className="row g-3">
            {(hotel.facilities || []).map((facility) => (
                <div className="col-6 col-md-4" key={facility}>
                <div className="d-flex align-items-center gap-2">
                    {facilityIcons[facility] || <CheckCircle2 size={19} />}
                    <span>{facility}</span>
                </div>
                </div>
            ))}
            </div>
        </section>

        {/* Room information */}
        <section className="border-bottom pb-4 mb-4">
            <h3 className="fw-bold mb-3">Room information</h3>

            <div className="card border rounded-4">
            <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                    <h5 className="fw-bold mb-2">{hotel.category}</h5>
                    <p className="text-secondary mb-3">
                    {hotel.type} accommodation
                    </p>

                    <div className="d-flex flex-wrap gap-3 small text-secondary">
                    <span>
                        <BedDouble size={16} className="me-1" />
                        Comfortable bedding
                    </span>
                    <span>
                        <Users size={16} className="me-1" />
                        Guest-friendly stay
                    </span>
                    </div>
                </div>

                <div className="text-lg-end">
                    <h4 className="fw-bold mb-1">
                    ₹{roomPrice.toLocaleString('en-IN')}
                    </h4>
                    <small className="text-secondary">per night</small>
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* Reviews */}
        <section className="pb-4">
            <h3 className="fw-bold mb-3">Guest reviews</h3>

            <div className="card border-0 bg-light rounded-4">
            <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                <div className="bg-white rounded-3 p-3">
                    <Star size={28} fill="#ffc107" color="#ffc107" />
                </div>
                <div>
                    <h4 className="fw-bold mb-1">
                    {hotel.rating} / 5
                    </h4>
                    <p className="text-secondary mb-0">
                    Based on {hotel.reviews} reviews
                    </p>
                </div>
                </div>
                <p className="text-secondary mt-3 mb-0">
                Guest review details will appear here when review data is
                connected.
                </p>
            </div>
            </div>
        </section>
        </div>

        {/* Booking card */}
        <aside className="col-12 col-lg-4">
        <div
            className="card border rounded-4 shadow-sm"
            style={{
            position: 'sticky',
            top: '100px',
            }}
        >
            <div className="card-body p-4">
            <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0">
                ₹{roomPrice.toLocaleString('en-IN')}
                </h3>
                <span className="text-secondary">/ night</span>
            </div>

            <p className="text-secondary small mb-4">
                Final amount may vary based on dates and taxes.
            </p>

            <form onSubmit={handleBooking}>
                <div className="mb-3">
                <label htmlFor="detailsCheckIn" className="form-label fw-semibold">
                    Check-in
                </label>
                <input
                    id="detailsCheckIn"
                    type="date"
                    className="form-control"
                    min={today}
                    value={checkIn}
                    required
                    onChange={(event) => setCheckIn(event.target.value)}
                />
                </div>

                <div className="mb-3">
                <label htmlFor="detailsCheckOut" className="form-label fw-semibold">
                    Check-out
                </label>
                <input
                    id="detailsCheckOut"
                    type="date"
                    className="form-control"
                    min={checkIn || today}
                    value={checkOut}
                    required
                    onChange={(event) => setCheckOut(event.target.value)}
                />
                </div>

                <div className="mb-4">
                <label htmlFor="detailsGuests" className="form-label fw-semibold">
                    Guests
                </label>
                <select
                    id="detailsGuests"
                    className="form-select"
                    value={guests}
                    onChange={(event) => setGuests(Number(event.target.value))}
                >
                    {[1, 2, 3, 4, 5, 6].map((number) => (
                    <option key={number} value={number}>
                        {number} {number === 1 ? 'Guest' : 'Guests'}
                    </option>
                    ))}
                </select>
                </div>

                <button type="submit" className="btn btn-dark btn-lg w-100">
                Book Now
                <ChevronRight size={18} className="ms-2" />
                </button>
            </form>

            <div className="d-flex align-items-center justify-content-center gap-2 text-secondary small mt-3">
                <ShieldCheck size={17} />
                Review your booking before confirming
            </div>
            </div>
        </div>
        </aside>
    </div>
    </main>
    {/* Footer */}
    <Footer/>
    </>
  )
}

export default RoomDetails
