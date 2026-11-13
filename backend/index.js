
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
}))

app.use(express.json())
app.use('/api/users', userRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hotel Palace API is running',
  })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server running`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()