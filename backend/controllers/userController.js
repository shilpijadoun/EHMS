
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

// Create User
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'staff',
    })

    const userResponse = user.toObject()
    delete userResponse.password

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({
      createdAt: -1,
    })

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User By ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update User
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
        })
      }

      user.email = email.toLowerCase()
    }

    if (name !== undefined) user.name = name
    if (phone !== undefined) user.phone = phone
    if (role !== undefined) user.role = role
    if (isActive !== undefined) user.isActive = isActive

    await user.save()

    const userResponse = user.toObject()
    delete userResponse.password

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
