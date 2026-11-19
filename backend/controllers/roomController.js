
import Room from '../models/Room.js'

// Create Room
export const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      floor,
      capacity,
      pricePerNight,
      amenities,
      description,
    } = req.body

    if (
      !roomNumber ||
      !roomType ||
      floor === undefined ||
      capacity === undefined ||
      pricePerNight === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Room number, type, floor, capacity and price are required',
      })
    }

    const existingRoom = await Room.findOne({
      roomNumber: roomNumber.trim(),
    })

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: 'Room number already exists',
      })
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      floor,
      capacity,
      pricePerNight,
      amenities,
      description,
    })

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get All Rooms
export const getAllRooms = async (req, res) => {
  try {
    const {
      search = '',
      status,
      roomType,
      page = 1,
      limit = 10,
    } = req.query

    const currentPage = Math.max(1, Number(page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10))

    const filter = {}

    if (search.trim()) {
      filter.roomNumber = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      }
    }

    if (status) filter.status = status
    if (roomType) filter.roomType = roomType

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),

      Room.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize),
      data: rooms,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Room By ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: room,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid room ID',
    })
  }
}

// Update Room
export const updateRoom = async (req, res) => {
  try {
    const allowedFields = [
      'roomNumber',
      'roomType',
      'floor',
      'capacity',
      'pricePerNight',
      'amenities',
      'description',
      'status',
      'isActive',
    ]

    const updates = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (updates.roomNumber) {
      const existingRoom = await Room.findOne({
        roomNumber: updates.roomNumber.trim(),
        _id: { $ne: req.params.id },
      })

      if (existingRoom) {
        return res.status(409).json({
          success: false,
          message: 'Room number already exists',
        })
      }
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      })
    }

    const Reservation = (await import('../models/Reservation.js')).default

    const hasActiveReservation = await Reservation.exists({
      'rooms.room': room._id,
      bookingStatus: { $in: ['pending', 'confirmed', 'checked-in'] },
    })

    if (hasActiveReservation) {
      return res.status(409).json({
        success: false,
        message: 'Room has active reservations and cannot be deleted',
      })
    }

    await room.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}
