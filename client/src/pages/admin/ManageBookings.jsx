import DataTable from '../../components/common/DataTable.jsx'

const rows = [
  { id: 'BK-1008', guest: 'Aarav Mehta', room: 'Deluxe Room', checkIn: '2026-10-12', checkOut: '2026-10-15', status: 'Confirmed' },
  { id: 'BK-1007', guest: 'Mia Johnson', room: 'Premium Room', checkIn: '2026-10-13', checkOut: '2026-10-16', status: 'Checked in' },
  { id: 'BK-1006', guest: 'Noah Williams', room: 'Luxury Suite', checkIn: '2026-10-14', checkOut: '2026-10-18', status: 'Pending' },
  { id: 'BK-1005', guest: 'Isha Patel', room: 'Deluxe Room', checkIn: '2026-10-15', checkOut: '2026-10-17', status: 'Confirmed' },
  { id: 'BK-1004', guest: 'Oliver Brown', room: 'Premium Room', checkIn: '2026-10-16', checkOut: '2026-10-19', status: 'Confirmed' },
]

const columns = [
  { key: 'id', label: 'Booking ID', width: 150 },
  { key: 'guest', label: 'Guest', width: 200 },
  { key: 'room', label: 'Room type', width: 180 },
  { key: 'checkIn', label: 'Check-in', width: 150 },
  { key: 'checkOut', label: 'Check-out', width: 150 },
  { key: 'status', label: 'Status', width: 150 },
]

function ManageBookings() {
  return (
    <>
      <div className="page-breadcrumb">Manage <span>/</span> Bookings</div>
      <div className="admin-list-toolbar"><h1>Manage Bookings</h1></div>
      <DataTable columns={columns} rows={rows} rowKey="id" searchPlaceholder="Search booking, guest, room, or status..." pageSize={8} />
    </>
  )
}

export default ManageBookings
