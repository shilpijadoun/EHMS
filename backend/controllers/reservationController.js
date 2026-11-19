
import mongoose from 'mongoose'
import Reservation from '../models/Reservation.js'
import Guest from '../models/Guest.js'
import Room from '../models/Room.js'

// Create Reservation
export const createReservation = async (req, res) => {
  try {
    const {
      guest,
      rooms,
      checkInDate,
      checkOutDate,
      bookingSource = 'reception',
      specialRequests,
    } = req.body

    // Required field validation
    if (!guest || !rooms?.length || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Guest, rooms, check-in and check-out dates are required',
      })
    }

    // Validate MongoDB IDs
    if (
      !mongoose.isValidObjectId(guest) ||
      rooms.some(item => !mongoose.isValidObjectId(item.room))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest or room ID',
      })
    }

    // Validate dates
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (
      Number.isNaN(checkIn.getTime()) ||
      Number.isNaN(checkOut.getTime()) ||
      checkOut <= checkIn
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking dates. Check-out must be after check-in',
      })
    }

    // Validate booking source
    if (!['online', 'reception'].includes(bookingSource)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking source',
      })
    }

    // Prevent duplicate rooms in the same booking
    const roomIds = rooms.map(item => item.room.toString())

    if (new Set(roomIds).size !== roomIds.length) {
      return res.status(400).json({
        success: false,
        message: 'A room cannot be added more than once',
      })
    }

    // Check guest
    const guestExists = await Guest.findById(guest)

    if (!guestExists) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found',
      })
    }

    // Get active rooms
    const roomDocuments = await Room.find({
      _id: { $in: roomIds },
      isActive: true,
    })

    if (roomDocuments.length !== roomIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms are invalid or inactive',
      })
    }

    // Validate room status and occupancy
    const reservationRooms = []

    for (const item of rooms) {
      const room = roomDocuments.find(
        doc => doc._id.toString() === item.room.toString()
      )

      if (['Cleaning', 'Maintenance'].includes(room.status)) {
        return res.status(409).json({
          success: false,
          message: `Room ${room.roomNumber} is currently ${room.status}`,
        })
      }

      const adults = Number(item.adults ?? 1)
      const children = Number(item.children ?? 0)

      if (
        !Number.isInteger(adults) ||
        !Number.isInteger(children) ||
        adults < 1 ||
        children < 0 ||
        adults + children > room.capacity
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid occupancy for room ${room.roomNumber}`,
        })
      }

      // Save current room price as booking price snapshot
      reservationRooms.push({
        room: room._id,
        ratePerNight: room.pricePerNight,
        adults,
        children,
      })
    }

    // Check overlapping reservations
    const conflictingReservation = await Reservation.findOne({
      'rooms.room': { $in: roomIds },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      bookingStatus: { $nin: ['cancelled'] },
    }).populate('rooms.room', 'roomNumber')

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: 'One or more rooms are already booked for these dates',
        conflictingBooking: conflictingReservation.bookingNumber,
      })
    }

    // Calculate total booking amount
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) /
      (1000 * 60 * 60 * 24)
    )

    const totalAmount = reservationRooms.reduce(
      (total, item) => total + item.ratePerNight * nights,
      0
    )

    // Generate booking number
    const bookingNumber = `HP-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`

    // Create reservation
    const reservation = await Reservation.create({
      bookingNumber,
      guest,
      rooms: reservationRooms,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      bookingSource,
      totalAmount,
      specialRequests,
      bookingStatus: 'confirmed',
    })

    const populatedReservation = await Reservation.findById(
      reservation._id
    )
      .populate('guest', 'firstName lastName email phone')
      .populate('rooms.room', 'roomNumber roomType pricePerNight')

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: populatedReservation,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getAllReservations = async (req, res) => {
  try {
    const {
      search = '',
      status,
      page = 1,
      limit = 10,
    } = req.query

    const currentPage = Math.max(1, Number(page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10))

    const filter = {}

    // Filter by booking status
    const allowedStatuses = [
      'pending',
      'confirmed',
      'checked-in',
      'checked-out',
      'cancelled',
    ]

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status',
        })
      }

      filter.bookingStatus = status
    }

    // Search by booking number or guest details
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      )

      const matchingGuests = await Guest.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
        ],
      }).select('_id')

      filter.$or = [
        { bookingNumber: searchRegex },
        { guest: { $in: matchingGuests.map(g => g._id) } },
      ]
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate('guest', 'firstName lastName email phone')
        .populate('rooms.room', 'roomNumber roomType')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),

      Reservation.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize),
      data: reservations,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getReservationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation ID',
      })
    }

    const reservation = await Reservation.findById(req.params.id)
      .populate('guest')
      .populate('rooms.room')
      .populate('createdBy', 'name email')

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: reservation,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params
    const {
      guest,
      rooms,
      checkInDate,
      checkOutDate,
      bookingSource,
      specialRequests,
    } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation ID',
      })
    }

    const reservation = await Reservation.findById(id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      })
    }

    if (['checked-in', 'checked-out', 'cancelled'].includes(reservation.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'This reservation cannot be updated',
      })
    }

    const newGuest = guest ?? reservation.guest
    const newRooms = rooms ?? reservation.rooms
    const newCheckIn = new Date(checkInDate ?? reservation.checkInDate)
    const newCheckOut = new Date(checkOutDate ?? reservation.checkOutDate)

    if (
      !mongoose.isValidObjectId(newGuest) ||
      !newRooms.length ||
      newRooms.some(item => !mongoose.isValidObjectId(item.room))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest or room information',
      })
    }

    if (
      Number.isNaN(newCheckIn.getTime()) ||
      Number.isNaN(newCheckOut.getTime()) ||
      newCheckOut <= newCheckIn
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation dates',
      })
    }

    const guestExists = await Guest.findById(newGuest)

    if (!guestExists) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found',
      })
    }

    const roomIds = newRooms.map(item => item.room.toString())

    if (new Set(roomIds).size !== roomIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate rooms are not allowed',
      })
    }

    const roomDocuments = await Room.find({
      _id: { $in: roomIds },
      isActive: true,
    })

    if (roomDocuments.length !== roomIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more rooms are invalid or inactive',
      })
    }

    const reservationRooms = []

    for (const item of newRooms) {
      const room = roomDocuments.find(
        doc => doc._id.toString() === item.room.toString()
      )

      if (['Cleaning', 'Maintenance'].includes(room.status)) {
        return res.status(409).json({
          success: false,
          message: `Room ${room.roomNumber} is currently ${room.status}`,
        })
      }

      const adults = Number(item.adults ?? 1)
      const children = Number(item.children ?? 0)

      if (
        !Number.isInteger(adults) ||
        !Number.isInteger(children) ||
        adults < 1 ||
        children < 0 ||
        adults + children > room.capacity
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid occupancy for room ${room.roomNumber}`,
        })
      }

      reservationRooms.push({
        room: room._id,
        ratePerNight: room.pricePerNight,
        adults,
        children,
      })
    }

    // Check overlapping bookings, excluding current reservation
    const conflict = await Reservation.findOne({
      _id: { $ne: reservation._id },
      'rooms.room': { $in: roomIds },
      checkInDate: { $lt: newCheckOut },
      checkOutDate: { $gt: newCheckIn },
      bookingStatus: { $nin: ['cancelled'] },
    })

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'One or more rooms are already booked for these dates',
      })
    }

    const nights = Math.ceil(
      (newCheckOut.getTime() - newCheckIn.getTime()) /
      (1000 * 60 * 60 * 24)
    )

    const totalAmount = reservationRooms.reduce(
      (total, item) => total + item.ratePerNight * nights,
      0
    )

    // Do not allow an update that makes existing payments exceed total
    if (totalAmount < reservation.paidAmount) {
      return res.status(400).json({
        success: false,
        message: 'New total cannot be less than the amount already paid',
      })
    }

    reservation.guest = newGuest
    reservation.rooms = reservationRooms
    reservation.checkInDate = newCheckIn
    reservation.checkOutDate = newCheckOut
    reservation.totalAmount = totalAmount

    if (bookingSource !== undefined) {
      reservation.bookingSource = bookingSource
    }

    if (specialRequests !== undefined) {
      reservation.specialRequests = specialRequests
    }

    reservation.paymentStatus =
      reservation.paidAmount === 0
        ? 'unpaid'
        : reservation.paidAmount >= totalAmount
          ? 'paid'
          : 'partial'

    await reservation.save()

    const updatedReservation = await Reservation.findById(id)
      .populate('guest', 'firstName lastName email phone')
      .populate('rooms.room', 'roomNumber roomType')

    return res.status(200).json({
      success: true,
      message: 'Reservation updated successfully',
      data: updatedReservation,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params
    const { cancellationReason } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation ID',
      })
    }

    const reservation = await Reservation.findById(id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      })
    }

    if (reservation.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reservation is already cancelled',
      })
    }

    if (
      ['checked-in', 'checked-out'].includes(reservation.bookingStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Checked-in or checked-out reservation cannot be cancelled',
      })
    }

    reservation.bookingStatus = 'cancelled'
    reservation.cancellationReason = cancellationReason || ''

    await reservation.save()

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
