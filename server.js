import dns from 'node:dns'

import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'

import authRoutes from './routes/authRoutes.js'
import boApiRoutes from './routes/bo-api/index.js'
import customerRoutes from './routes/customerRoutes.js'
import menuRoutes from './routes/menuRoutes.js'
import organizationRoutes from './routes/organizationRoutes.js'
import superAdminRoutes from './routes/superAdminRoutes.js' // *** ШИНЭ ***

dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()
const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', customerRoutes)
app.use('/api', menuRoutes)
app.use('/api', organizationRoutes)
app.use('/api', superAdminRoutes) // *** ШИНЭ ***
app.use('/bo-api', boApiRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'OK, Who are you', timestamp: new Date() })
})

// Error handling
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({
    message: 'Серверт алдаа гарлаа',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// DB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB холбогдлоо'))
  .catch((err) => console.log('❌ MongoDB алдаа:', err))

// Server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`)
})
