import { Link, useNavigate } from 'react-router-dom'
const rooms = [
  {
    name: 'Deluxe Room',
    image: '/public/img/images.jpeg',
    description: 'Relax in a comfortable room designed for a pleasant stay.',
    price: '₹2,499',
  },
  {
    name: 'Premium Room',
    image: '/public/img/images (1).jpeg',
    description: 'Enjoy extra comfort and a welcoming atmosphere.',
    price: '₹3,499',
  },
  {
    name: 'Luxury Suite',
    image: '/public/img/homestay-hotel.jpg',
    description: 'Experience spacious accommodation with premium comfort.',
    price: '₹4,999',
  },
]


function RoomCard() {
  return (
    <section className="hotel-rooms-section">
        <div className="container hotel-section">
          <div className="text-center hotel-section-heading">
            <span className="hotel-eyebrow">STAY YOUR WAY</span>
            <h2>Explore Our Rooms</h2>
            <p>
              Find the right space for your next relaxing getaway.
            </p>
          </div>

          <div className="row g-4">
            {rooms.map((room) => (
              <div className="col-md-6 col-lg-4" key={room.name}>
                <article className="card hotel-room-card h-100">
                  <img
                    src={room.image}
                    className="card-img-top hotel-room-image"
                    alt={room.name}
                    loading="lazy"
                  />

                  <div className="card-body d-flex flex-column">
                    <h3 className="hotel-room-title">{room.name}</h3>
                    <p className="text-muted">{room.description}</p>

                    <div className="mt-auto pt-3 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="hotel-room-price">{room.price}</span>
                        <small className="d-block text-muted">per night*</small>
                      </div>

                      <Link
                        to="/booking"
                        className="btn hotel-outline-btn"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <Link to="/rooms" className="btn hotel-primary-btn">
              View All Rooms <i className="bi bi-arrow-right ms-2" />
            </Link>
          </div>
        </div>
      </section>
  )
}

export default RoomCard