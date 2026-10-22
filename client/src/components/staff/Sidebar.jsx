import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const navigation = [
  { label: 'Dashboard', icon: 'bi-grid-1x2', to: '/admin' },
  { label: 'Bookings', icon: 'bi-journal-check', to: '/admin/bookings' },
  { label: 'Rooms', icon: 'bi-door-open', to: '/admin/rooms' },
  { label: 'Staff', icon: 'bi-person-badge', to: '/admin/staff' },
]

function Sidebar() {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const isOpen = isPinnedOpen 

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'is-open' : 'is-closed'}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-brand">
        <NavLink to="/" className="sidebar-logo" aria-label="Hotel Palace home">
          <span>HP</span>
        </NavLink>
        <button
          type="button"
          className="sidebar-pin"
          onClick={() => {
            setIsPinnedOpen((value) => !value)
          }}
          aria-label={isPinnedOpen ? 'Collapse sidebar' : 'Pin sidebar open'}
          title={isPinnedOpen ? 'Collapse sidebar' : 'Pin sidebar open'}
        >
          <i className={`bi ${isPinnedOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`} />
        </button>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={!isOpen ? item.label : undefined}
          >
            <i className={`bi ${item.icon} sidebar-link-icon`} />
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-link" type="button" title={!isOpen ? 'Help' : undefined}>
          <i className="bi bi-headset sidebar-link-icon" />
          <span className="sidebar-link-label">Help & Support</span>
        </button>
        <button className="sidebar-link" type="button" title={!isOpen ? 'Settings' : undefined}>
          <i className="bi bi-gear sidebar-link-icon" />
          <span className="sidebar-link-label">Settings</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
