import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  SlidersHorizontal,
  Star,
  Wifi,
  Snowflake,
  Tv,
  CarFront,
  BedDouble,
  ArrowUpDown,
  Heart,
  ChevronRight,
} from 'lucide-react'


import {
    hotels,
    categories,
    accommodationTypes,
    facilities,
} from '../../constants/room.constants'


const facilityIcons = {
  WIFI: <Wifi size={15} />,
  TV: <Tv size={15} />,
  AC: <Snowflake size={15} />,
  'Single bed': <BedDouble size={15} />,
  Parking: <CarFront size={15} />,
}

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN').format(price)

function Rooms() {
  const [location, setLocation] = useState('Ayodhya')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [sortBy, setSortBy] = useState('recommended')
  const [searchTerm, setSearchTerm] = useState('')
  const [guestMenuOpen, setGuestMenuOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchApplied, setSearchApplied] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [activeImages, setActiveImages] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  const roomsPerPage = 4

  const toggleSelection = (value, selected, setter) => {
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedCategories([])
    setSelectedTypes([])
    setSelectedFacilities([])
    setSearchTerm('')
    setSortBy('recommended')
    setCurrentPage(1)
  }

  const filteredHotels = useMemo(() => {
    let result = hotels.filter((hotel) => {
      const matchesMin =
        minPrice === '' || hotel.price >= Number(minPrice)

      const matchesMax =
        maxPrice === '' || hotel.price <= Number(maxPrice)

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(hotel.category)

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(hotel.type)

      const matchesFacilities = selectedFacilities.every((facility) =>
        hotel.facilities.includes(facility),
      )

      const query = searchTerm.trim().toLowerCase()

      const matchesSearch =
        !query ||
        hotel.name.toLowerCase().includes(query) ||
        hotel.location.toLowerCase().includes(query) ||
        hotel.address.toLowerCase().includes(query)

      const matchesLocation =
        !searchApplied ||
        !location.trim() ||
        hotel.location.toLowerCase().includes(location.trim().toLowerCase())

      return (
        matchesMin &&
        matchesMax &&
        matchesCategory &&
        matchesType &&
        matchesFacilities &&
        matchesSearch &&
        matchesLocation
      )
    })

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.reviews - a.reviews)
    }

    return result
  }, [
    minPrice,
    maxPrice,
    selectedCategories,
    selectedTypes,
    selectedFacilities,
    searchTerm,
    sortBy,
    location,
    searchApplied,
  ])

  const totalPages = Math.ceil(filteredHotels.length / roomsPerPage)
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage,
  )

  const toggleFavorite = (id) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    )
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setSearchApplied(true)
    setCurrentPage(1)
  }

  const renderCheckboxes = (items, selected, setter, prefix) =>
    items.map((item) => (
      <div className="form-check mb-2" key={`${prefix}-${item}`}>
        <input
          className="form-check-input"
          type="checkbox"
          id={`${prefix}-${item}`}
          checked={selected.includes(item)}
          onChange={() => toggleSelection(item, selected, setter)}
        />
        <label
          className="form-check-label"
          htmlFor={`${prefix}-${item}`}
        >
          {item}
        </label>
      </div>
    ))

  const FiltersPanel = () => (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">Filters</h5>
        <button
          type="button"
          className="btn btn-link text-danger text-decoration-none p-0"
          onClick={clearFilters}
        >
          Clear All
        </button>
      </div>

      <div className="mb-4">
        <h6 className="fw-semibold mb-3">Price per night (₹)</h6>
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small" htmlFor="minPrice">
              Minimum
            </label>
            <input
              id="minPrice"
              type="number"
              min="0"
              className="form-control"
              placeholder="₹ Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="col-6">
            <label className="form-label small" htmlFor="maxPrice">
              Maximum
            </label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              className="form-control"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
      </div>

      <hr />

      <div className="mb-4">
        <h6 className="fw-semibold mb-3">Categories</h6>
        {renderCheckboxes(
          categories,
          selectedCategories,
          setSelectedCategories,
          'category',
        )}
      </div>

      <hr />

      <div className="mb-4">
        <h6 className="fw-semibold mb-3">Accommodation Type</h6>
        {renderCheckboxes(
          accommodationTypes,
          selectedTypes,
          setSelectedTypes,
          'type',
        )}
      </div>

      <hr />

      <div className="mb-3">
        <h6 className="fw-semibold mb-3">Hotel Facilities</h6>
        {renderCheckboxes(
          facilities,
          selectedFacilities,
          setSelectedFacilities,
          'facility',
        )}
      </div>
    </div>
  )

  return (
    <>
    {/* Navigation */}
    <Navbar/>
    <main className="container-fluid px-3 px-lg-4">
       {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-secondary">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Hotels
          </li>
        </ol>
      </nav>
      {/* Search */}
      <form
        className="rooms-search-bar bg-white border rounded-4 shadow-sm p-3 p-lg-4 my-4"
        onSubmit={handleSearch}
      >
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-semibold">Destination</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <MapPin size={18} />
              </span>
              <input
                className="form-control"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label fw-semibold">Check-in</label>
            <input
              type="date"
              className="form-control"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label fw-semibold">Check-out</label>
            <input
              type="date"
              className="form-control"
              value={checkOut}
              min={checkIn || new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3 position-relative">
            <label className="form-label fw-semibold">Guests</label>
            <button
              type="button"
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between"
              onClick={() => setGuestMenuOpen(!guestMenuOpen)}
            >
              <span>
                <Users size={17} className="me-2" />
                {adults + children} Guests
              </span>
              <ChevronRight
                size={17}
                className={guestMenuOpen ? 'rotate-90' : ''}
              />
            </button>

            {guestMenuOpen && (
              <div className="position-absolute top-100 start-0 mt-2 bg-white border rounded-3 shadow p-3 w-100 guest-menu">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold">Adults</div>
                    <small className="text-muted">Age 13+</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={adults <= 1}
                      onClick={() => setAdults((n) => Math.max(1, n - 1))}
                    >
                      −
                    </button>
                    {adults}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={adults >= 10}
                      onClick={() => setAdults((n) => Math.min(10, n + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold">Children</div>
                    <small className="text-muted">Age 0–12</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={children <= 0}
                      onClick={() => setChildren((n) => Math.max(0, n - 1))}
                    >
                      −
                    </button>
                    {children}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={children >= 10}
                      onClick={() => setChildren((n) => Math.min(10, n + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-dark w-100"
                  onClick={() => setGuestMenuOpen(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <button type="submit" className="btn btn-dark w-100 py-2">
              <Search size={17} className="me-2" />
              Search
            </button>
          </div>
        </div>

        {checkIn && checkOut && checkOut <= checkIn && (
          <p className="text-danger small mb-0 mt-2">
            Check-out date must be after check-in date.
          </p>
        )}
      </form>

      {/* Page heading */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Explore Hotels</h2>
        <p className="text-secondary mb-0">
          Find a comfortable stay for your next journey.
        </p>
      </div>

      <div className="row g-4">
        {/* Desktop filters */}
        <aside className="col-lg-3 d-none d-lg-block">
          <div className="rooms-filter-sticky border rounded-4 bg-white shadow-sm">
            <FiltersPanel />
          </div>
        </aside>

        {/* Hotels */}
        <section className="col-12 col-lg-9">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                {filteredHotels.length} hotels found
              </h5>
              <span className="text-secondary small">
                {searchApplied && location
                  ? `Showing results for ${location}`
                  : 'Discover your perfect stay'}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-dark d-lg-none"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} className="me-2" />
                Filters
              </button>

              <div className="input-group" style={{ width: 'auto' }}>
                <span className="input-group-text bg-white">
                  <ArrowUpDown size={16} />
                </span>
                <select
                  className="form-select"
                  aria-label="Sort hotels"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="recommended">Recommended</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {paginatedHotels.length === 0 ? (
            <div className="border rounded-4 text-center p-5">
              <Search size={36} className="text-secondary mb-3" />
              <h5>No hotels found</h5>
              <p className="text-secondary">
                Try changing your search or clearing some filters.
              </p>
              <button
                type="button"
                className="btn btn-dark"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {paginatedHotels.map((hotel) => {
                const activeImage =
                  activeImages[hotel.id] || hotel.images[0]

                return (
                  <article
                    className="card border-0 shadow-sm rounded-4 overflow-hidden"
                    key={hotel.id}
                  >
                    <div className="row g-0">
                      {/* Image gallery */}
                      <div className="col-12 col-xl-6 p-3">
                        <div className="room-gallery">
                          <img
                            src={activeImage}
                            alt={hotel.name}
                            className="room-main-image"
                          />

                          <button
                            type="button"
                            className="btn btn-light rounded-circle favorite-button shadow-sm"
                            aria-label={
                              favorites.includes(hotel.id)
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }
                            onClick={() => toggleFavorite(hotel.id)}
                          >
                            <Heart
                              size={20}
                              fill={
                                favorites.includes(hotel.id)
                                  ? 'currentColor'
                                  : 'none'
                              }
                              color={
                                favorites.includes(hotel.id)
                                  ? '#dc3545'
                                  : 'currentColor'
                              }
                            />
                          </button>
                        </div>

                        <div className="d-flex gap-2 mt-2">
                          {hotel.images.map((image, index) => (
                            <button
                              type="button"
                              key={`${hotel.id}-${image}-${index}`}
                              className={`room-thumbnail ${
                                activeImage === image
                                  ? 'room-thumbnail-active'
                                  : ''
                              }`}
                              onClick={() =>
                                setActiveImages((previous) => ({
                                  ...previous,
                                  [hotel.id]: image,
                                }))
                              }
                              aria-label={`View hotel image ${index + 1}`}
                            >
                              <img src={image} alt="" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hotel details */}
                      <div className="col-12 col-xl-6">
                        <div className="d-flex flex-column h-100 p-3 p-lg-4">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <span className="badge text-bg-light border">
                              {hotel.category}
                            </span>
                            <span className="badge text-bg-success">
                              <Star
                                size={13}
                                fill="currentColor"
                                className="me-1"
                              />
                              {hotel.rating}
                            </span>
                          </div>

                          <h4 className="fw-bold mb-2">{hotel.name}</h4>

                          <p className="text-secondary small mb-2">
                            <MapPin size={15} className="me-1" />
                            {hotel.address}
                          </p>

                          <p className="text-secondary small mb-3">
                            {hotel.location}
                          </p>

                          <div className="d-flex flex-wrap gap-3 mb-3">
                            {hotel.facilities.map((facility) => (
                              <span
                                className="d-inline-flex align-items-center gap-1 small text-secondary"
                                key={facility}
                              >
                                {facilityIcons[facility]}
                                {facility}
                              </span>
                            ))}
                          </div>

                          <div className="text-secondary small mb-3">
                            {hotel.reviews} guest reviews
                            <span className="mx-2">•</span>
                            {hotel.type}
                          </div>

                          <div className="mt-auto pt-3 border-top">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                              <div>
                                <h4 className="fw-bold mb-0">
                                  ₹{formatPrice(hotel.price)}
                                </h4>
                                <small className="text-secondary">
                                  per night
                                </small>
                              </div>
                              <span className="small text-secondary">
                                Taxes may apply
                              </span>
                            </div>

                            <div className="d-flex gap-2">
                              <Link
                                to={`/rooms/${hotel.id}`}
                                className="btn btn-outline-dark flex-fill"
                              >
                                View Details
                              </Link>
                              <Link
                                to={`/booking/${hotel.id}`}
                                className="btn btn-dark flex-fill"
                              >
                                Book Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="d-flex justify-content-center mt-4"
              aria-label="Hotel pages"
            >
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <li
                      className={`page-item ${
                        currentPage === page ? 'active' : ''
                      }`}
                      key={page}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ),
                )}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? 'disabled' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1),
                      )
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </section>
      </div>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1060 }}
          onClick={() => setMobileFiltersOpen(false)}
          role="presentation"
        >
          <div
            className="position-absolute top-0 end-0 h-100 bg-white overflow-auto"
            style={{ width: 'min(90%, 380px)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Hotel filters"
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="fw-bold mb-0">Filter Hotels</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
              />
            </div>

            <FiltersPanel />

            <div className="sticky-bottom bg-white border-top p-3">
              <button
                type="button"
                className="btn btn-dark w-100"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {filteredHotels.length} Hotels
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
    {/* Footer */}
    <Footer/>
    </>
  )
}

export default Rooms