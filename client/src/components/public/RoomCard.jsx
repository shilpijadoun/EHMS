import { Link } from "react-router-dom";
import { useData, currency } from "../../api";
export default function RoomCard() {
  const { data, error, loading } = useData("/rooms");
  return (
    <section className="container py-5">
      <h2 className="mb-4">Explore our rooms</h2>
      {loading && <p>Loading rooms…</p>}
      {error && <p role="alert">{error}</p>}
      <div className="row g-4">
        {data?.slice(0, 3).map((room) => (
          <div className="col-md-4" key={room._id}>
            <article className="hp-card p-0 overflow-hidden h-100">
              <img
                className="room-photo"
                src={room.image}
                alt={room.roomType}
              />
              <div className="p-4">
                <h3>{room.roomType}</h3>
                <p>{room.description}</p>
                <strong>{currency(room.pricePerNight)} / night</strong>
                <Link
                  className="btn btn-dark d-block mt-3"
                  to={`/rooms/${room._id}`}
                >
                  View room
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
