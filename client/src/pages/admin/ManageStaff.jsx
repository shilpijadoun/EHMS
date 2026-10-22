import DataTable from '../../components/common/DataTable.jsx'

const rows = [
  { id: 'ST-01', name: 'Ananya Rao', role: 'Front desk', shift: 'Morning', phone: '+91 98765 43210', status: 'On duty' },
  { id: 'ST-02', name: 'Kabir Shah', role: 'Housekeeping', shift: 'Morning', phone: '+91 98765 43211', status: 'On duty' },
  { id: 'ST-03', name: 'Sara Khan', role: 'Front desk', shift: 'Evening', phone: '+91 98765 43212', status: 'Off duty' },
  { id: 'ST-04', name: 'Dev Patel', role: 'Maintenance', shift: 'Day', phone: '+91 98765 43213', status: 'On duty' },
]

const columns = [
  { key: 'id', label: 'Staff ID', width: 140 },
  { key: 'name', label: 'Name', width: 200 },
  { key: 'role', label: 'Role', width: 180 },
  { key: 'shift', label: 'Shift', width: 150 },
  { key: 'phone', label: 'Phone', width: 190 },
  { key: 'status', label: 'Status', width: 150 },
]

function ManageStaff() {
  return (
    <>
      <div className="page-breadcrumb">Manage <span>/</span> Staff</div>
      <div className="admin-list-toolbar"><h1>Manage Staff</h1></div>
      <DataTable columns={columns} rows={rows} rowKey="id" searchPlaceholder="Search staff name, role, or status..." pageSize={8} />
    </>
  )
}

export default ManageStaff
