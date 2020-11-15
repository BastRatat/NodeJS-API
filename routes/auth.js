const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { registerValidation, loginValidation } = require('../models/validations')

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

  // Create and assign a token
  const token = jwt.sign({id: user._id, name: user.name, email: user.email}, process.env.TOKEN_SECRET)
  console.log(token)
  res.header('jwt', token).json({jwt: token})

})

module.exports = router