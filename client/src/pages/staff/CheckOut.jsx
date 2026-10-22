
import { useState } from 'react'
import {
  Search,
  LogOut,
  Receipt,
  DoorOpen,
  CalendarDays,
  IndianRupee,
  X,
} from 'lucide-react'

const initialGuests = [
  {
    id: 'BK-1001',
    guest: 'Rahul Sharma',
    room: '101',
    checkIn: '2026-10-21',
    checkOut: '2026-10-23',
    nights: 2,
    roomCharge: 4000,
    extraCharges: 500,
    status: 'Checked-in',
  },
  {
    id: 'BK-1002',
    guest: 'Priya Verma',
    room: '205',
    checkIn: '2026-10-22',
    checkOut: '2026-10-23',
    nights: 1,
    roomCharge: 2500,
    extraCharges: 0,
    status: 'Checked-in',
  },
]

const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

function CheckOut() {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [message, setMessage] = useState('')

  const filteredGuests = guests.filter((guest) =>
    `${guest.id} ${guest.guest} ${guest.room}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const completeCheckout = () => {
    if (!selectedGuest) return

    setGuests((previous) =>
      previous.map((guest) =>
        guest.id === selectedGuest.id
          ? { ...guest, status: 'Checked-out' }
          : guest
      )
    )

    setMessage(`${selectedGuest.guest} checked out successfully.`)
    setSelectedGuest(null)
  }

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-heading">
        <div>
          <h2>Guest Check-out</h2>
          <p>Review guest bills and complete room check-outs.</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex justify-content-between">
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage('')}
            aria-label="Close"
          />
        </div>
      )}

      <div className="staff-panel">
        <div className="staff-section-header">
          <div>
            <h5>Guests Staying at Hotel</h5>
            <p>Review the bill before completing check-out.</p>
          </div>
          <span className="badge text-bg-primary">
            {guests.filter((guest) => guest.status === 'Checked-in').length}
            {' '}staying
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
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Bill</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredGuests.map((guest) => {
                const total = guest.roomCharge + guest.extraCharges

                return (
                  <tr key={guest.id}>
                    <td><strong>{guest.id}</strong></td>
                    <td>{guest.guest}</td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1">
                        <DoorOpen size={16} />
                        {guest.room}
                      </span>
                    </td>
                    <td>{guest.checkIn}</td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1">
                        <CalendarDays size={16} />
                        {guest.checkOut}
                      </span>
                    </td>
                    <td><strong>{currency(total)}</strong></td>
                    <td>
                      <span
                        className={`staff-status ${
                          guest.status === 'Checked-out'
                            ? 'checked-out'
                            : 'checked-in'
                        }`}
                      >
                        {guest.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={guest.status !== 'Checked-in'}
                        onClick={() => {
                          setMessage('')
                          setSelectedGuest(guest)
                        }}
                      >
                        <Receipt size={15} className="me-1" />
                        View Bill
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGuest && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setSelectedGuest(null)}
        >
          <div
            className="staff-reservation-modal staff-checkout-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="staff-modal-header">
              <div>
                <h4 id="checkout-title">Checkout Bill</h4>
                <p>Booking ID: {selectedGuest.id}</p>
              </div>
              <button
                type="button"
                className="staff-modal-close"
                onClick={() => setSelectedGuest(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="staff-checkout-guest">
              <div className="staff-avatar">
                {selectedGuest.guest
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div>
                <h5>{selectedGuest.guest}</h5>
                <p>Room {selectedGuest.room}</p>
              </div>
            </div>

            <div className="staff-checkout-bill">
              <div>
                <span>Room charges ({selectedGuest.nights} nights)</span>
                <strong>{currency(selectedGuest.roomCharge)}</strong>
              </div>
              <div>
                <span>Additional charges</span>
                <strong>{currency(selectedGuest.extraCharges)}</strong>
              </div>
              <div className="staff-checkout-total">
                <span>Total payable</span>
                <strong>
                  {currency(
                    selectedGuest.roomCharge + selectedGuest.extraCharges
                  )}
                </strong>
              </div>
            </div>

            <p className="staff-checkout-note">
              Confirm that payment has been received before completing
              check-out.
            </p>

            <div className="staff-checkout-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setSelectedGuest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={completeCheckout}
              >
                <LogOut size={16} className="me-1" />
                Complete Check-out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckOut
