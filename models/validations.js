const Joi = require('@hapi/joi')

const registerValidation = (data) => {
  
  const userSchema = Joi.object({
    name: Joi.string().min(6).max(20).required(),
    email: Joi.string().min(6).max(30).required().email(),
    password: Joi.string().min(6).max(1024).required()
  })
  
  return userSchema.validate(data)
}

const loginValidation = (data) => {
  
  const userSchema = Joi.object({
    email: Joi.string().min(6).max(30).required().email(),
    password: Joi.string().min(6).max(1024).required()
  })
  
  return userSchema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
