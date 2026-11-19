
import express from 'express'

import {
  createGuest,
  getAllGuests,
  getGuestById,
  updateGuest,
  deleteGuest,
} from '../controllers/guestController.js'

const router = express.Router()

router.post('/', createGuest)
router.get('/', getAllGuests)
router.get('/:id', getGuestById)
router.put('/:id', updateGuest)
router.delete('/:id', deleteGuest)

export default router
