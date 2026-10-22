
import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'

const navigation = [
  { label: 'Dashboard', icon: 'bi-grid-1x2', to: '/staff', end: true },
  { label: 'Reservations', icon: 'bi-calendar-check', to: '/staff/reservations' },
  { label: 'Check-in', icon: 'bi-box-arrow-in-right', to: '/staff/check-in' },
  { label: 'Check-out', icon: 'bi-box-arrow-right', to: '/staff/check-out' },
  { label: 'Room Status', icon: 'bi-door-open', to: '/staff/rooms' },
]

function StaffLayout() {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)

  return (
    <div className={`staff-shell ${isPinnedOpen ? 'staff-sidebar-open' : 'staff-sidebar-closed'}`}>
      <aside className="staff-sidebar">
        <div className="staff-brand">
          <div className="staff-brand-logo">HP</div>

          {isPinnedOpen && (
            <div className="staff-brand-text">
              <strong>Hotel Palace</strong>
              <small>Staff Panel</small>
            </div>
          )}

          <button
            type="button"
            className="staff-sidebar-toggle"
            onClick={() => setIsPinnedOpen((prev) => !prev)}
            title={isPinnedOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isPinnedOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <i className={`bi ${isPinnedOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`} />
          </button>
        </div>

        <div className="staff-nav-heading">
          {isPinnedOpen ? 'WORKSPACE' : ''}
        </div>

        <nav className="staff-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={!isPinnedOpen ? item.label : undefined}
              className={({ isActive }) =>
                `staff-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${item.icon}`} />
              {isPinnedOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="staff-sidebar-footer">
          <div className="staff-avatar">ST</div>

          {isPinnedOpen && (
            <div className="staff-footer-info">
              <strong>Staff Member</strong>
              <small>Hotel Staff</small>
            </div>
          )}
        </div>
      </aside>

      <div className="staff-main">
        <header className="staff-topbar">
          <div>
            <h5>Staff Workspace</h5>
            <small>Manage your daily hotel operations</small>
          </div>

          <div className="staff-topbar-right">
            <span className="staff-online-indicator" />
            <span className="staff-online-text">Staff Portal</span>
            <div className="staff-avatar">ST</div>
          </div>
        </header>

        <main className="staff-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StaffLayout
