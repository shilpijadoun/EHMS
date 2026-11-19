
import { useEffect, useState } from 'react'
import DataTable from '../../components/common/DataTable.jsx'
import { getRooms } from '../../services/roomService.js'

function ManageRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getRooms()

      setRooms(response.data || [])
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load rooms'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
      .then((response) => setRooms(response.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load rooms'))
      .finally(() => setLoading(false))
  }, [])

  const rows = rooms.map((room) => ({
    id: room.roomNumber,
    type: room.roomType,
    floor: room.floor,
    capacity: room.capacity,
    rate: `₹${room.pricePerNight.toLocaleString('en-IN')}`,
    status: room.status,
  }))

  const columns = [
    { key: 'id', label: 'Room no.', width: 140 },
    { key: 'type', label: 'Room type', width: 200 },
    { key: 'floor', label: 'Floor', width: 120 },
    {
      key: 'capacity',
      label: 'Capacity',
      width: 140,
      render: (value) => `${value} guests`,
    },
    { key: 'rate', label: 'Rate per night', width: 160 },
    { key: 'status', label: 'Status', width: 160 },
  ]

  return (
    <>
      <div className="page-breadcrumb">
        Manage <span>/</span> Rooms
      </div>

      <div className="admin-list-toolbar">
        <h1>Manage Rooms</h1>
      </div>

      {loading && <p>Loading rooms...</p>}

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={fetchRooms}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          searchPlaceholder="Search room number, type, or status..."
          pageSize={8}
        />
      )}
    </>
  )
}

export default ManageRooms
