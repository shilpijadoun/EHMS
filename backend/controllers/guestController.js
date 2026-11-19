
import Guest from '../models/Guest.js'

// Create Guest
export const createGuest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      idProofType,
      idVerified,
    } = req.body

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name and phone are required',
      })
    }

    const guest = await Guest.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      idProofType,
      idVerified,
    })

    return res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: guest,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get All Guests with Search and Pagination
export const getAllGuests = async (req, res) => {
  try {
    const {
      search = '',
      page = 1,
      limit = 10,
    } = req.query

    const currentPage = Math.max(1, Number(page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10))

    const filter = {}

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      )

      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ]
    }

    const [guests, total] = await Promise.all([
      Guest.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),

      Guest.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      count: guests.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize),
      data: guests,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Guest By ID
export const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id)

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: guest,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid guest ID',
    })
  }
}

// Update Guest
export const updateGuest = async (req, res) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'idProofType',
      'idVerified',
    ]

    const updates = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Guest updated successfully',
      data: guest,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete Guest
export const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id)

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Guest deleted successfully',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid guest ID or delete failed',
    })
  }
}
