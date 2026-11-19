import api from './api'

// Get all rooms
export const getRooms = async (params = {}) => {
  const response = await api.get('/rooms', { params })
  return response.data
}

// Get room by ID
export const getRoomById = async (id) => {
  const response = await api.get(`/rooms/${id}`)
  return response.data
}

// Create room
export const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData)
  return response.data
}

// Update room
export const updateRoom = async (id, roomData) => {
  const response = await api.put(`/rooms/${id}`, roomData)
  return response.data
}

// Delete room
export const deleteRoom = async (id) => {
  const response = await api.delete(`/rooms/${id}`)
  return response.data
}