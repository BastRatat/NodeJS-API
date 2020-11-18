const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { registerValidation, loginValidation } = require('../models/validations')
const verifyEmail = require('./verifyEmail')
const sendEmail = require('./emailUser')



// /api/user/register
router.post('/register', async (req, res) => {
  // Data validation
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).json({message: error.details[0].message})

  // Check for user duplicates
  const emailExist = await User.findOne({email: req.body.email})
  if (emailExist) return res.status(400).json({message: "User already exists"})
  
  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashPassword  = await bcrypt.hash(req.body.password, salt)

  // Create a new user
  const user = User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  })
  try {
    const savedUser = await user.save()
    sendEmail(savedUser.id, savedUser.email)
    res.status(201).json({
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email
    })
  } catch(err) {
    res.status(400).json({message: err.message})
  }
})

// /api/user/login
router.post('/login', async (req, res) => {
  // Data validation
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).json({message: error.details[0].message})

  // Check for user email
  const user = await User.findOne({email: req.body.email})
  if (!user) return res.status(400).json({message: "Email doesn't exists"})

  // Check if password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).json({message: "Invalid password"})

  // Check if user is confirmed
  if (!user.confirmed) return res.status(400).json({message: "Please confirm your email first"})

  // Create and assign a token
  const token = jwt.sign({id: user._id, name: user.name, email: user.email}, process.env.TOKEN_SECRET)
  res.header('jwt', token).json({jwt: token})
})

// GET /confirmation/TOKEN_FOR_EMAIL_CONFIRMATION
router.get('/confirmation/:token', verifyEmail , async (req, res) => {
  // Take res.user from the middleware verifyEmail and update the record
  res.user.confirmed = true
  try {
    const updatedUserInformations = await res.user.save()
    // redirect to frontend confirmation page (success)
    res.redirect('http://google.com')
  } catch(err) {
    res.status(400).json({message: err.message})
      // redirect to frontend confirmation page (failure)
      res.redirect('http://google.com')
  }
})

module.exports = router