const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const app = express()

// Import routes
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')

// Connect to database
const env = process.env.NODE_ENV

// Switch environment in the terminal : set NODE_ENV=development
if (env === 'development') {
  // Connect to the database for develoment
  mongoose.connect(
    process.env.DB_CONNECT, 
    { useNewUrlParser: true, 
      useUnifiedTopology: true 
    },
    () => console.log("Connected to development database")
  )
} else {
  // Connect to the database for testing
  mongoose.connect(
    process.env.DB_TEST, 
    { useNewUrlParser: true, 
      useUnifiedTopology: true 
    },
    () => console.log("Connected to test database")
  )
  mongoose.connection.collections['users'].drop( function(err) {
    console.log('tests tables are clean for testing');
  });
}

// Middleware
app.use(express.json())

// Routes
app.use('/api/user', authRoutes)
app.use('/api/users', usersRoutes)

// Launch server
const port = 3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
