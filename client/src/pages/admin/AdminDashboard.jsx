function AdminDashboard() {
  return (
    <>
      <h2>Admin Dashboard</h2>

      <div className="row g-3 mt-2">
        {[
          ['Total Rooms', '5'],
          ['Today’s Arrivals', '3'],
          ['Available Rooms', '2'],
          ['Staff on Duty', '3'],
        ].map(([title, value]) => (
          <div className="col-md-3" key={title}>
            <div className="card shadow-sm">
              <div className="card-body">
                <p className="text-muted mb-2">{title}</p>
                <h3>{value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default AdminDashboard
