
import { useMemo, useState } from 'react'
import {
  Search,
  DoorOpen,
  BedDouble,
  Users,
  Wrench,
  Sparkles,
} from 'lucide-react'

const initialRooms = [
  { number: '101', type: 'Deluxe', floor: 1, capacity: 2, status: 'Available' },
  { number: '102', type: 'Standard', floor: 1, capacity: 2, status: 'Occupied' },
  { number: '103', type: 'Suite', floor: 1, capacity: 4, status: 'Cleaning' },
  { number: '201', type: 'Deluxe', floor: 2, capacity: 2, status: 'Available' },
  { number: '202', type: 'Standard', floor: 2, capacity: 2, status: 'Maintenance' },
  { number: '203', type: 'Suite', floor: 2, capacity: 4, status: 'Occupied' },
  { number: '301', type: 'Deluxe', floor: 3, capacity: 2, status: 'Cleaning' },
  { number: '302', type: 'Standard', floor: 3, capacity: 2, status: 'Available' },
]

const statuses = ['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance']

function RoomStatus() {
  const [rooms, setRooms] = useState(initialRooms)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [message, setMessage] = useState('')

  const counts = useMemo(() => ({
    Available: rooms.filter((room) => room.status === 'Available').length,
    Occupied: rooms.filter((room) => room.status === 'Occupied').length,
    Cleaning: rooms.filter((room) => room.status === 'Cleaning').length,
    Maintenance: rooms.filter((room) => room.status === 'Maintenance').length,
  }), [rooms])

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = `${room.number} ${room.type} ${room.floor}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || room.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const updateRoomStatus = (roomNumber, nextStatus) => {
    setRooms((previous) =>
      previous.map((room) =>
        room.number === roomNumber
          ? { ...room, status: nextStatus }
          : room
      )
    )

    setMessage(`Room ${roomNumber} status updated to ${nextStatus}.`)
  }

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-heading">
        <div>
          <h2>Room Status</h2>
          <p>Monitor room availability and housekeeping status.</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>{message}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage('')}
            aria-label="Close"
          />
        </div>
      )}

      <div className="staff-room-summary">
        {[
          { label: 'Available', count: counts.Available, icon: DoorOpen },
          { label: 'Occupied', count: counts.Occupied, icon: Users },
          { label: 'Cleaning', count: counts.Cleaning, icon: Sparkles },
          { label: 'Maintenance', count: counts.Maintenance, icon: Wrench },
        ].map(({ label, count, icon: Icon }) => (
          <div className="staff-room-summary-card" key={label}>
            <span className={`staff-room-summary-icon ${label.toLowerCase()}`}>
              <Icon size={20} />
            </span>
            <div>
              <p>{label}</p>
              <h3>{count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="staff-panel">
        <div className="staff-section-header">
          <div>
            <h5>All Rooms</h5>
            <p>Search rooms and change their current status.</p>
          </div>
          <span className="badge text-bg-primary">
            {filteredRooms.length} rooms
          </span>
        </div>

        <div className="staff-room-toolbar">
          <div className="staff-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search room number, type or floor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="form-select staff-room-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by room status"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="table staff-table align-middle">
            <thead>
              <tr>
                <th>Room</th>
                <th>Room Type</th>
                <th>Floor</th>
                <th>Capacity</th>
                <th>Current Status</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.number}>
                  <td>
                    <span className="staff-room-number">
                      <BedDouble size={17} />
                      {room.number}
                    </span>
                  </td>
                  <td>{room.type}</td>
                  <td>{room.floor}</td>
                  <td>{room.capacity} guests</td>
                  <td>
                    <span className={`staff-room-status ${room.status.toLowerCase()}`}>
                      {room.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm staff-room-status-select"
                      value={room.status}
                      onChange={(event) =>
                        updateRoomStatus(room.number, event.target.value)
                      }
                      aria-label={`Update status for room ${room.number}`}
                    >
                      {statuses.filter((status) => status !== 'All').map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No rooms found.
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

export default RoomStatus
