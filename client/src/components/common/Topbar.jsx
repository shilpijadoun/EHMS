
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleNavigation = (path) => {
    setIsDropdownOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setIsDropdownOpen(false)

    // TODO: Clear authentication/session data here.
    navigate('/login')
  }

  return (
    <header className="app-topbar">
      <div className="topbar-actions">
        <div className="topbar-pill hotel-identity">
          <i className="bi bi-building" />
          <strong>Hotel Palace</strong>
        </div>

        <div className="topbar-profile" ref={dropdownRef}>
          <button
            type="button"
            className={`topbar-user ${
              isDropdownOpen ? 'dropdown-active' : ''
            }`}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="Open admin profile menu"
          >
            <span className="user-avatar">AD</span>

            <span className="topbar-user-info">
              <strong>Admin</strong>
              <small>Administrator</small>
            </span>

            <i
              className={`bi ${
                isDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <span className="user-avatar dropdown-avatar">AD</span>

                <div>
                  <strong>Admin</strong>
                  <small>Administrator</small>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => handleNavigation('/admin/profile')}
              >
                <i className="bi bi-person-circle" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => handleNavigation('/admin/settings')}
              >
                <i className="bi bi-gear" />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => handleNavigation('/admin/profile')}
              >
                <i className="bi bi-shield-lock" />
                <span>Change Password</span>
              </button>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-item logout-item"
                role="menuitem"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar