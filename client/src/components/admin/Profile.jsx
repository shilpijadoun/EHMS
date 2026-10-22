
import { useState } from 'react'
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Camera,
  ShieldCheck,
  Save,
  LockKeyhole,
} from 'lucide-react'

function Profile() {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@hotelpalace.com',
    phone: '',
    address: '',
    role: 'Hotel Administrator',
  })

  const [password, setPassword] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  })

  const [photo, setPhoto] = useState('')
  const [message, setMessage] = useState('')

  const updateProfile = (event) => {
    const { name, value } = event.target

    setProfile((current) => ({
      ...current,
      [name]: value,
    }))

    setMessage('')
  }

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be less than 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleProfileSave = (event) => {
    event.preventDefault()

    // Connect your profile update API here.
    setMessage('Profile form validated. Connect the backend API to save changes permanently.')
  }

  const handlePasswordSave = (event) => {
    event.preventDefault()

    if (password.newPassword.length < 8) {
      setMessage('New password must contain at least 8 characters.')
      return
    }

    if (password.newPassword !== password.confirm) {
      setMessage('New password and confirmation do not match.')
      return
    }

    // Password change must be implemented securely through the backend.
    setMessage('Password form validated. Connect your secure password update API.')
  }

  return (
    <div className="hp-profile-page">
      <div className="hp-profile-header">
        <div>
          <div className="hp-profile-breadcrumb">
            Admin <span>/</span> My Profile
          </div>
          <h1>My Profile</h1>
          <p>Manage your personal information and account security.</p>
        </div>

        <div className="hp-profile-header-icon">
          <UserRound size={27} />
        </div>
      </div>

      {message && (
        <div className="hp-profile-message" role="status">
          {message}
        </div>
      )}

      <div className="hp-profile-layout">
        <aside className="hp-profile-summary">
          <div className="hp-profile-avatar">
            {photo ? (
              <img src={photo} alt="Profile preview" />
            ) : (
              <UserRound size={52} />
            )}
          </div>

          <label className="hp-profile-photo-button">
            <Camera size={16} />
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              hidden
            />
          </label>

          <h2>{profile.name || 'Admin User'}</h2>
          <p>{profile.role}</p>

          <div className="hp-profile-summary-divider" />

          <div className="hp-profile-summary-item">
            <Mail size={17} />
            <span>{profile.email || 'No email added'}</span>
          </div>

          <div className="hp-profile-summary-item">
            <Phone size={17} />
            <span>{profile.phone || 'No phone added'}</span>
          </div>

          <div className="hp-profile-summary-item">
            <ShieldCheck size={17} />
            <span>Administrator Account</span>
          </div>
        </aside>

        <div className="hp-profile-content">
          <section className="hp-profile-card">
            <div className="hp-profile-card-heading">
              <div className="hp-profile-section-icon">
                <UserRound size={21} />
              </div>
              <div>
                <h3>Personal Information</h3>
                <p>Update your name and contact details.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="hp-profile-fields">
                <div className="hp-profile-field">
                  <label htmlFor="profileName">Full Name</label>
                  <input
                    id="profileName"
                    name="name"
                    value={profile.name}
                    onChange={updateProfile}
                    required
                  />
                </div>

                <div className="hp-profile-field">
                  <label htmlFor="profileEmail">Email Address</label>
                  <input
                    id="profileEmail"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={updateProfile}
                    required
                  />
                </div>

                <div className="hp-profile-field">
                  <label htmlFor="profilePhone">Phone Number</label>
                  <input
                    id="profilePhone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={updateProfile}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="hp-profile-field">
                  <label htmlFor="profileRole">Role</label>
                  <input
                    id="profileRole"
                    value={profile.role}
                    readOnly
                  />
                </div>

                <div className="hp-profile-field hp-profile-field-full">
                  <label htmlFor="profileAddress">Address</label>
                  <div className="hp-profile-address-input">
                    <MapPin size={17} />
                    <input
                      id="profileAddress"
                      name="address"
                      value={profile.address}
                      onChange={updateProfile}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>

              <div className="hp-profile-actions">
                <button type="submit" className="hp-profile-save">
                  <Save size={17} />
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          <section className="hp-profile-card">
            <div className="hp-profile-card-heading">
              <div className="hp-profile-section-icon hp-profile-security-icon">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h3>Change Password</h3>
                <p>Update your password to help protect your account.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSave}>
              <div className="hp-profile-fields hp-profile-password-fields">
                <div className="hp-profile-field hp-profile-field-full">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={password.current}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        current: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="hp-profile-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password.newPassword}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        newPassword: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="hp-profile-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={password.confirm}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        confirm: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="hp-profile-actions">
                <button type="submit" className="hp-profile-save">
                  <LockKeyhole size={17} />
                  Update Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
