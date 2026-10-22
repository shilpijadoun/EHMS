
import { useState } from 'react'
import { Search, UserCheck, CalendarDays, DoorOpen } from 'lucide-react'

const reservationsData = [
  {
    id: 'BK-1001',
    guest: 'Rahul Sharma',
    room: '101',
    checkIn: '2026-10-23',
    guests: 2,
    status: 'Confirmed',
  },
  {
    id: 'BK-1002',
    guest: 'Priya Verma',
    room: '205',
    checkIn: '2026-10-23',
    guests: 1,
    status: 'Confirmed',
  },
  {
    id: 'BK-1003',
    guest: 'Amit Kumar',
    room: '302',
    checkIn: '2026-10-23',
    guests: 3,
    status: 'Checked-in',
  },
]

function CheckIn() {
  const [reservations, setReservations] = useState(reservationsData)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  const filteredReservations = reservations.filter((reservation) =>
    `${reservation.id} ${reservation.guest} ${reservation.room}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const handleCheckIn = (id) => {
    setReservations((previous) =>
      previous.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status: 'Checked-in' }
          : reservation
      )
    )

    setMessage(`Reservation ${id} checked in successfully.`)
  }

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-heading">
        <div>
          <h2>Guest Check-in</h2>
          <p>Verify reservations and check guests into their rooms.</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex justify-content-between">
          {message}
          <button
            className="btn-close"
            onClick={() => setMessage('')}
            aria-label="Close"
          />
        </div>
      )}

      <div className="staff-panel">
        <div className="staff-section-header">
          <div>
            <h5>Today's Reservations</h5>
            <p>Search and check in arriving guests.</p>
          </div>
          <span className="badge text-bg-primary">
            {filteredReservations.length} reservations
          </span>
        </div>

        <div className="staff-reservation-toolbar">
          <div className="staff-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search guest, booking ID or room..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table staff-table align-middle">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in Date</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <strong>{reservation.id}</strong>
                  </td>

                  <td>{reservation.guest}</td>

                  <td>
                    <span className="d-inline-flex align-items-center gap-1">
                      <DoorOpen size={16} />
                      {reservation.room}
                    </span>
                  </td>

                  <td>
                    <span className="d-inline-flex align-items-center gap-1">
                      <CalendarDays size={16} />
                      {reservation.checkIn}
                    </span>
                  </td>

                  <td>{reservation.guests}</td>

                  <td>
                    <span
                      className={`staff-status ${
                        reservation.status === 'Checked-in'
                          ? 'checked-in'
                          : 'confirmed'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={reservation.status === 'Checked-in'}
                      onClick={() => handleCheckIn(reservation.id)}
                    >
                      <UserCheck size={15} className="me-1" />
                      {reservation.status === 'Checked-in'
                        ? 'Completed'
                        : 'Check-in'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CheckIn
