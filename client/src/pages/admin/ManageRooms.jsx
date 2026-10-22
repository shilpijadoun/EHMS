import DataTable from '../../components/common/DataTable.jsx'

const rows = [
  { id: '101', type: 'Deluxe Room', floor: '1', capacity: 2, rate: '₹2,499', status: 'Available' },
  { id: '102', type: 'Premium Room', floor: '1', capacity: 2, rate: '₹3,499', status: 'Occupied' },
  { id: '201', type: 'Luxury Suite', floor: '2', capacity: 4, rate: '₹4,999', status: 'Available' },
  { id: '202', type: 'Deluxe Room', floor: '2', capacity: 2, rate: '₹2,499', status: 'Cleaning' },
  { id: '301', type: 'Premium Room', floor: '3', capacity: 3, rate: '₹3,499', status: 'Maintenance' },
]

const columns = [
  { key: 'id', label: 'Room no.', width: 140 },
  { key: 'type', label: 'Room type', width: 200 },
  { key: 'floor', label: 'Floor', width: 120 },
  { key: 'capacity', label: 'Capacity', width: 140, render: (value) => `${value} guests` },
  { key: 'rate', label: 'Rate per night', width: 160 },
  { key: 'status', label: 'Status', width: 160 },
]

function ManageRooms() {
  return (
    <>
      <div className="page-breadcrumb">Manage <span>/</span> Rooms</div>
      <div className="admin-list-toolbar"><h1>Manage Rooms</h1></div>
      <DataTable columns={columns} rows={rows} rowKey="id" searchPlaceholder="Search room number, type, or status..." pageSize={8} />
    </>
  )
}

export default ManageRooms
