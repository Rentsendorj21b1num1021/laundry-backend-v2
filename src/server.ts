import dns from 'node:dns'

import cors from 'cors'
import dotenv from 'dotenv'
import express, { type ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'

import adminRoutes from '@/routes/admin.routes'
import authRoutes from '@/routes/auth.routes'
import customerRoutes from '@/routes/customer.routes'
import menuRoutes from '@/routes/menu.routes'
import organizationRoutes from '@/routes/organization.routes'

dns.setServers(['8.8.8.8', '1.1.1.1'])
dotenv.config()

const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', customerRoutes)
app.use('/api', menuRoutes)
app.use('/api', organizationRoutes)
app.use('/api', adminRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Серверт алдаа гарлаа', error: process.env.NODE_ENV === 'development' ? err.message : undefined })
}

app.use(errorHandler)

mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => console.log('✅ MongoDB холбогдлоо'))
  .catch((err) => console.log('❌ MongoDB алдаа:', err))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`)
})
