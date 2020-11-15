const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const app = express()

// Import routes
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')

// Connect to database
mongoose.connect(
  process.env.DB_CONNECT, 
  { useNewUrlParser: true, 
    useUnifiedTopology: true 
  },
  () => console.log("Connected to database")
)

// Middleware
app.use(express.json())

// Routes middleware
app.use('/api/user', authRoutes)
app.use('/api/users', usersRoutes)

// Launch server
const port = 3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
