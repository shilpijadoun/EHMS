
import {
  Users,
  LogIn,
  LogOut,
  BedDouble,
  CalendarCheck,
  Clock,
  ArrowRight,
  DoorOpen,
  ClipboardCheck,
} from 'lucide-react'

const summaryCards = [
  {
    title: "Today's Arrivals",
    value: '08',
    icon: Users,
    color: 'blue',
  },
  {
    title: "Today's Departures",
    value: '05',
    icon: LogOut,
    color: 'green',
  },
  {
    title: 'Occupied Rooms',
    value: '12',
    icon: BedDouble,
    color: 'orange',
  },
  {
    title: 'Pending Check-ins',
    value: '03',
    icon: ClipboardCheck,
    color: 'red',
  },
]

const reservations = [
  { id: 'BK101', guest: 'Amit Sharma', room: '101', time: '10:00 AM', status: 'Confirmed' },
  { id: 'BK102', guest: 'Priya Mehta', room: '102', time: '11:30 AM', status: 'Confirmed' },
  { id: 'BK103', guest: 'Rahul Verma', room: '203', time: '12:00 PM', status: 'Pending' },
  { id: 'BK104', guest: 'Sneha Iyer', room: '205', time: '01:30 PM', status: 'Confirmed' },
  { id: 'BK105', guest: 'Vikram Singh', room: '301', time: '02:00 PM', status: 'Pending' },
]

const rooms = [
  { number: '101', type: 'Deluxe', status: 'Available' },
  { number: '102', type: 'Standard', status: 'Occupied' },
  { number: '103', type: 'Deluxe', status: 'Available' },
  { number: '104', type: 'Suite', status: 'Occupied' },
  { number: '105', type: 'Standard', status: 'Available' },
]

const activities = [
  { title: 'Room 102 checked-in', detail: 'Guest: Priya Mehta', time: '10:15 AM', color: 'blue' },
  { title: 'New reservation', detail: 'Guest: Amit Sharma (Room 101)', time: '09:30 AM', color: 'green' },
  { title: 'Room 201 checked-out', detail: 'Guest: Rohan Kapoor', time: '08:45 AM', color: 'orange' },
]

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="staff-section-header">
      <div className="staff-section-title">
        <Icon size={20} />
        <h3>{title}</h3>
      </div>
      {action && (
        <button type="button" className="staff-view-button" onClick={action}>
          View all <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

function StaffDashboard() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-heading">
        <div>
          <span className="staff-eyebrow">STAFF DASHBOARD</span>
          <h1>Good morning, Staff!</h1>
          <p>Here's what's happening at Hotel Palace today.</p>
        </div>

        <div className="staff-date-chip">
          <CalendarCheck size={17} />
          {today}
        </div>
      </div>

      <div className="staff-summary-grid">
        {summaryCards.map(({ title, value, icon: Icon, color }) => (
          <div className={`staff-summary-card ${color}`} key={title}>
            <div className="staff-summary-icon">
              <Icon size={25} />
            </div>
            <div>
              <strong>{value}</strong>
              <span>{title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="staff-dashboard-grid">
        <section className="staff-panel staff-reservations-panel">
          <SectionHeader
            icon={CalendarCheck}
            title="Today's Reservations"
          />

          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest Name</th>
                  <th>Room</th>
                  <th>Arrival</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td className="staff-guest-name">{booking.guest}</td>
                    <td>{booking.room}</td>
                    <td>{booking.time}</td>
                    <td>
                      <span
                        className={`staff-status ${
                          booking.status === 'Confirmed' ? 'confirmed' : 'pending'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="staff-panel">
          <SectionHeader icon={DoorOpen} title="Room Status" />

          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.number}>
                    <td>{room.number}</td>
                    <td>{room.type}</td>
                    <td>
                      <span
                        className={`staff-status ${
                          room.status === 'Available' ? 'confirmed' : 'occupied'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="staff-panel">
          <SectionHeader icon={Clock} title="Recent Activities" />

          <div className="staff-activity-list">
            {activities.map((activity) => (
              <div className="staff-activity-item" key={activity.title}>
                <span className={`staff-activity-dot ${activity.color}`} />
                <div className="staff-activity-content">
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>
                <time>{activity.time}</time>
              </div>
            ))}
          </div>
        </section>

        <section className="staff-panel">
          <SectionHeader icon={ClipboardCheck} title="Quick Actions" />

          <div className="staff-quick-actions">
            <a className="staff-quick-action blue" href="/staff/reservations">
              <CalendarCheck size={21} />
              <span>Reservations</span>
              <ArrowRight size={15} />
            </a>

            <a className="staff-quick-action green" href="/staff/check-in">
              <LogIn size={21} />
              <span>Guest Check-in</span>
              <ArrowRight size={15} />
            </a>

            <a className="staff-quick-action orange" href="/staff/check-out">
              <LogOut size={21} />
              <span>Guest Check-out</span>
              <ArrowRight size={15} />
            </a>

            <a className="staff-quick-action red" href="/staff/rooms">
              <BedDouble size={21} />
              <span>Room Status</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StaffDashboard
