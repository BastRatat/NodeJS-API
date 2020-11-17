const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()
const User = require('../models/User')

module.exports = async function (req, res, next) {
  // Declare a user
  let user

  // Take jwt from the request param, verify it and decode it to retrieve the user ID
  const token = req.params.token
  if (token == null) return res.status(404).json({message: 'Token not found'})
  const userId = jwt.verify(token, process.env.EMAIL_SECRET).id

  try {
    user = await User.findById(userId)
    if (user == null) return res.status(404).json({message: 'User not found'})
  } catch(err) {
    return res.status(500).json({message: err.message})
  }
  
  // Return the user and call the next middleware function
  res.user = user
  next()
}