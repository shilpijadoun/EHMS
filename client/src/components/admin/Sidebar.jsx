
import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const navigation = [
  { label: 'Dashboard', icon: 'bi-grid-1x2', to: '/admin', end: true },
  { label: 'Bookings', icon: 'bi-journal-check', to: '/admin/bookings' },
  { label: 'Rooms', icon: 'bi-door-open', to: '/admin/rooms' },
  { label: 'Staff', icon: 'bi-person-badge', to: '/admin/staff' },
]

function Sidebar() {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const isOpen = isPinnedOpen

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'is-open' : 'is-closed'}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-brand">
        <NavLink
          to="/"
          className="sidebar-logo"
          aria-label="Hotel Palace home"
        >
          <span>HP</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-pin"
          onClick={() => setIsPinnedOpen((value) => !value)}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <i
            className={`bi ${
              isOpen ? 'bi-chevron-left' : 'bi-chevron-right'
            }`}
          />
        </button>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            title={!isOpen ? item.label : undefined}
          >
            <i className={`bi ${item.icon} sidebar-link-icon`} />
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/admin/help"
          className={linkClass}
          title={!isOpen ? 'Help & Support' : undefined}
        >
          <i className="bi bi-headset sidebar-link-icon" />
          <span className="sidebar-link-label">Help &amp; Support</span>
        </NavLink>

        <NavLink to="/admin/settings" className={linkClass}>
  <i className="bi bi-gear sidebar-link-icon" />
  <span className="sidebar-link-label">Settings</span>
</NavLink>
      </div>
    </aside>
  )
}

export default Sidebar;
