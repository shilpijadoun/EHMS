
import { useState } from 'react'
import {
  Building2,
  Bell,
  ShieldCheck,
  Save,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from 'lucide-react'

function Settings() {
  const [hotel, setHotel] = useState({
    name: 'Hotel Palace',
    email: 'admin@hotelpalace.com',
    phone: '',
    address: '',
  })

  const [notifications, setNotifications] = useState({
    bookings: true,
    cancellations: true,
    staffUpdates: false,
    emailAlerts: true,
  })

  const [security, setSecurity] = useState({
    sessionTimeout: '30',
    twoFactor: false,
  })

  const [saved, setSaved] = useState(false)

  const updateHotel = (event) => {
    const { name, value } = event.target
    setHotel((current) => ({ ...current, [name]: value }))
    setSaved(false)
  }

  const toggleNotification = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }))
    setSaved(false)
  }

  const handleSave = (event) => {
    event.preventDefault()

    // UI-only save. Connect your backend API here for persistence.
    setSaved(true)
  }

  const handleReset = () => {
    setHotel({
      name: 'Hotel Palace',
      email: 'admin@hotelpalace.com',
      phone: '',
      address: '',
    })

    setNotifications({
      bookings: true,
      cancellations: true,
      staffUpdates: false,
      emailAlerts: true,
    })

    setSecurity({
      sessionTimeout: '30',
      twoFactor: false,
    })

    setSaved(false)
  }

  return (
    <div className="hp-settings-page">
      <div className="hp-settings-header">
        <div>
          <div className="hp-settings-breadcrumb">
            Admin <span>/</span> Settings
          </div>
          <h1>Settings</h1>
          <p>Manage your hotel profile, notifications, and security preferences.</p>
        </div>

        <div className="hp-settings-header-icon">
          <Building2 size={27} />
        </div>
      </div>

      {saved && (
        <div className="hp-settings-success" role="status">
          <CheckCircle2 size={19} />
          Settings updated in this session. Connect the backend API to save permanently.
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Hotel profile */}
        <section className="hp-settings-card">
          <div className="hp-settings-card-heading">
            <div className="hp-settings-section-icon hp-settings-blue">
              <Building2 size={21} />
            </div>
            <div>
              <h2>Hotel Profile</h2>
              <p>Update your hotel's basic information.</p>
            </div>
          </div>

          <div className="hp-settings-fields">
            <div className="hp-settings-field">
              <label htmlFor="hotelName">Hotel name</label>
              <input
                id="hotelName"
                name="name"
                value={hotel.name}
                onChange={updateHotel}
                required
              />
            </div>

            <div className="hp-settings-field">
              <label htmlFor="hotelEmail">Contact email</label>
              <div className="hp-settings-input-icon">
                <Mail size={17} />
                <input
                  id="hotelEmail"
                  name="email"
                  type="email"
                  value={hotel.email}
                  onChange={updateHotel}
                  required
                />
              </div>
            </div>

            <div className="hp-settings-field">
              <label htmlFor="hotelPhone">Phone number</label>
              <div className="hp-settings-input-icon">
                <Phone size={17} />
                <input
                  id="hotelPhone"
                  name="phone"
                  type="tel"
                  value={hotel.phone}
                  onChange={updateHotel}
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div className="hp-settings-field">
              <label htmlFor="hotelAddress">Hotel address</label>
              <div className="hp-settings-input-icon hp-settings-address">
                <MapPin size={17} />
                <input
                  id="hotelAddress"
                  name="address"
                  value={hotel.address}
                  onChange={updateHotel}
                  placeholder="Enter hotel address"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="hp-settings-card">
          <div className="hp-settings-card-heading">
            <div className="hp-settings-section-icon hp-settings-purple">
              <Bell size={21} />
            </div>
            <div>
              <h2>Notifications</h2>
              <p>Choose which updates you want to receive.</p>
            </div>
          </div>

          <div className="hp-settings-options">
            {[
              {
                key: 'bookings',
                title: 'New bookings',
                description: 'Get notified when a new reservation is created.',
              },
              {
                key: 'cancellations',
                title: 'Booking cancellations',
                description: 'Receive updates when a reservation is cancelled.',
              },
              {
                key: 'staffUpdates',
                title: 'Staff updates',
                description: 'Receive notifications about staff-related changes.',
              },
              {
                key: 'emailAlerts',
                title: 'Email notifications',
                description: 'Enable email alerts for supported events.',
              },
            ].map((item) => (
              <div className="hp-settings-option" key={item.key}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <label className="hp-settings-switch">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => toggleNotification(item.key)}
                    aria-label={item.title}
                  />
                  <span />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="hp-settings-card">
          <div className="hp-settings-card-heading">
            <div className="hp-settings-section-icon hp-settings-green">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h2>Security Preferences</h2>
              <p>Configure your session preferences.</p>
            </div>
          </div>

          <div className="hp-settings-security-row">
            <div>
              <h3>Session timeout</h3>
              <p>Preferred inactivity period before session expiry.</p>
            </div>

            <select
              value={security.sessionTimeout}
              onChange={(event) => {
                setSecurity((current) => ({
                  ...current,
                  sessionTimeout: event.target.value,
                }))
                setSaved(false)
              }}
              aria-label="Session timeout"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <div className="hp-settings-option">
            <div>
              <h3>Two-factor authentication</h3>
              <p>Enable an additional sign-in verification step.</p>
            </div>

            <label className="hp-settings-switch">
              <input
                type="checkbox"
                checked={security.twoFactor}
                onChange={() => {
                  setSecurity((current) => ({
                    ...current,
                    twoFactor: !current.twoFactor,
                  }))
                  setSaved(false)
                }}
                aria-label="Two-factor authentication"
              />
              <span />
            </label>
          </div>
        </section>

        <div className="hp-settings-actions">
          <button
            type="button"
            className="hp-settings-reset"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button type="submit" className="hp-settings-save">
            <Save size={17} />
            Save Changes
          </button>
        </div>
      </form>

      <footer className="hp-settings-footer">
        Hotel Palace Admin Portal <span>•</span> Settings
      </footer>
    </div>
  )
}

export default Settings
