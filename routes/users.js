const router = require('express').Router()
const User = require('../models/User')
const verify = require('./verifyToken')

const getUser = async (req, res, next) => {
  let user
  try {
    user = await User.findById(req.params.id)
    if (user == null) return res.status(404).json({message: 'Cannot find user'})
  } catch(err) {
    return res.status(500).json({message: err.message})
  }

  res.user = user
  next()
}

// GET a user given an ID
router.get('/:id', verify, getUser, async (req, res) => {
  res.json(res.user)
})

// GET all users
router.get('/', verify, async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch(err) {
    res.status(500).json({message: err.message})
  }
})

// PATCH a user to update name or email address
router.patch('/:id', verify, getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name
  }
  if (req.body.email != null) {
    res.user.email = req.body.email
  }

  try {
    const updatedUserInformations = await res.user.save()
    res.json({id: res.user.id, name: res.user.name, email: res.user.email})
  } catch(err) {
    res.status(400).json({message: err.message})
  }
})

// DELETE a user
router.delete('/:id', getUser, verify, async (req, res) => {
  try {
    await res.user.remove()
    res.json({message: "User has been removed"})
  } catch(err) {
    res.status(500).json({message: err.message})
  }
})

// PATCH a user settings
router.patch('/:id/settings', verify, getUser, async (req, res) => {
  const newSetting = req.body.settings.mode

  if (newSetting != null && (newSetting === 'light' ||  newSetting === 'dark')) {
    res.user.settings.mode = newSetting
  }

  try {
    const updatedSettings = await res.user.save()
    res.status(200).json({settings: newSetting})
  } catch(err) {
    res.status(400).json({message: err.message})
  }
})

module.exports = router