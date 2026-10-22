import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import StaffLayout from './layouts/StaffLayout'
import Help from './components/admin/Help'
import Settings from './components/admin/Settings'
import Profile from './components/admin/Profile'


import Home from './pages/public/Home'
import Rooms from './pages/public/Rooms'
import RoomDetails from './pages/public/RoomDetails'
import Booking from './pages/public/Booking'
import AdminDashboard from './pages/admin/AdminDashboard'
import Login from './components/unprotected/login'
import ManageRooms from './pages/admin/ManageRooms'
import ManageStaff from './pages/admin/ManageStaff'
import ManageBookings from './pages/admin/ManageBookings'
import StaffDashboard from './pages/staff/StaffDashboard'
import Reservations from './pages/staff/Reservations'
import CheckIn from './pages/staff/CheckIn'
import CheckOut from './pages/staff/CheckOut'
import RoomStatus from './pages/staff/RoomStatus'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/booking" element={<Booking />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="help" element={<Help />} />
           <Route path="profile" element={<Profile />} />
           <Route path="settings" element={<Settings />} />
  

        </Route>

        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="reservations" element={<Reservations />} />

          {/* <Route path="check-in" element={<h2>Guest Check-in</h2>} /> */}
          <Route path="check-in" element={<CheckIn />} />
          <Route path="check-out" element={<CheckOut />} />
          <Route path="rooms" element={<RoomStatus />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
