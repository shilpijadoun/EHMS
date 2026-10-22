
import { useMemo, useState } from 'react'
import { Search, CalendarDays, Eye, RotateCcw } from 'lucide-react'

const initialReservations = [
  {
    id: 'BK-1001',
    guest: 'Amit Sharma',
    phone: '+91 98765 43210',
    room: '101',
    checkIn: '2026-10-23',
    checkOut: '2026-10-25',
    status: 'Confirmed',
  },
  {
    id: 'BK-1002',
    guest: 'Priya Mehta',
    phone: '+91 98765 43211',
    room: '102',
    checkIn: '2026-10-23',
    checkOut: '2026-10-26',
    status: 'Checked In',
  },
  {
    id: 'BK-1003',
    guest: 'Rahul Verma',
    phone: '+91 98765 43212',
    room: '203',
    checkIn: '2026-10-24',
    checkOut: '2026-10-27',
    status: 'Pending',
  },
  {
    id: 'BK-1004',
    guest: 'Sneha Iyer',
    phone: '+91 98765 43213',
    room: '205',
    checkIn: '2026-10-22',
    checkOut: '2026-10-23',
    status: 'Checked Out',
  },
  {
    id: 'BK-1005',
    guest: 'Vikram Singh',
    phone: '+91 98765 43214',
    room: '301',
    checkIn: '2026-10-25',
    checkOut: '2026-10-28',
    status: 'Confirmed',
  },
]

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Reservations() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedReservation, setSelectedReservation] = useState(null)

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return initialReservations.filter((reservation) => {
      const matchesSearch = [
        reservation.id,
        reservation.guest,
        reservation.phone,
        reservation.room,
      ].some((value) => value.toLowerCase().includes(query))

      const matchesStatus =
        statusFilter === 'All' || reservation.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('All')
  }

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-heading">
        <div>
          <span className="staff-eyebrow">STAFF WORKSPACE</span>
          <h1>Reservations</h1>
          <p>Search and review hotel guest reservations.</p>
        </div>

        <div className="staff-date-chip">
          <CalendarDays size={17} />
          {filteredReservations.length} reservations
        </div>
      </div>

      <section className="staff-panel">
        <div className="staff-reservation-toolbar">
          <div className="staff-search-box">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, booking ID, phone or room..."
              aria-label="Search reservations"
            />
          </div>

          <select
            className="staff-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by reservation status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          <button
            type="button"
            className="staff-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="staff-table-wrapper">
          <table className="staff-table staff-reservations-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="staff-guest-name">{reservation.id}</td>
                  <td>
                    <div className="staff-reservation-guest">
                      <strong>{reservation.guest}</strong>
                      <small>{reservation.phone}</small>
                    </div>
                  </td>
                  <td>{reservation.room}</td>
                  <td>{formatDate(reservation.checkIn)}</td>
                  <td>{formatDate(reservation.checkOut)}</td>
                  <td>
                    <span
                      className={`staff-status ${
                        reservation.status === 'Confirmed'
                          ? 'confirmed'
                          : reservation.status === 'Pending'
                            ? 'pending'
                            : reservation.status === 'Checked In'
                              ? 'occupied'
                              : 'checked-out'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="staff-action-icon"
                      title={`View ${reservation.id}`}
                      aria-label={`View ${reservation.id}`}
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan="7" className="staff-empty-state">
                    No reservations found. Try another search or reset filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedReservation && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setSelectedReservation(null)}
        >
          <section
            className="staff-reservation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-section-header">
              <div className="staff-section-title">
                <CalendarDays size={20} />
                <h3 id="reservation-modal-title">Reservation Details</h3>
              </div>

              <button
                type="button"
                className="staff-action-icon"
                aria-label="Close details"
                onClick={() => setSelectedReservation(null)}
              >
                ×
              </button>
            </div>

            <dl className="staff-reservation-details">
              <dt>Booking ID</dt>
              <dd>{selectedReservation.id}</dd>

              <dt>Guest Name</dt>
              <dd>{selectedReservation.guest}</dd>

              <dt>Phone</dt>
              <dd>{selectedReservation.phone}</dd>

              <dt>Room Number</dt>
              <dd>{selectedReservation.room}</dd>

              <dt>Check-in</dt>
              <dd>{formatDate(selectedReservation.checkIn)}</dd>

              <dt>Check-out</dt>
              <dd>{formatDate(selectedReservation.checkOut)}</dd>

              <dt>Status</dt>
              <dd>{selectedReservation.status}</dd>
            </dl>

            <button
              type="button"
              className="staff-modal-close"
              onClick={() => setSelectedReservation(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default Reservations
