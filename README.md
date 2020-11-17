# Node JS API with authentication and JWT

### Initialize a project

Node.js® is required, download at https://nodejs.org/en/download/

From your terminal, create an empty folder and initialize a package.json

```console
mkdir node-authentication
cd node-authentication
npm init -y 
```

### Packages

1. run the follow command in your terminal to generate a package.json with the correct dependencies

```console
npm i @hapi/joi bcryptjs dotenv express jsonwebtoken mongoose nodemon
```

2. open your package.json and add nodemon index.js to the start key/value pair from scripts. Nodemon allows you to avoid manually restarting your server on changes.

```json
{
  "name": "nodejs-authentication",
  "version": "1.0.0",
  "description": "create an api for authenticating a user with nodeJS, express, mongodb and jwt",
  "main": "index.js",
  "scripts": {
    "start": "nodemon index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@hapi/joi": "^17.1.1",
    "bcryptjs": "^2.4.3",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.10.14",
    "nodemon": "^2.0.6"
  }
}
```

### Initialize the server

1. create an index.js file in your app folder and import dependencies

```javascript
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
```

2. instantiate an app from the express dependency and make sure the server can accept JSON format requests by adding 

```javascript
const app = express()
app.use(express.json())
```

3. bind and listen for connections on the port 3000

```javascript
const port = 3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
```

4. on your terminal, run the following command and make sure the output is 'Server is listening on port 3000' 

```console
npm start
```

### Connect database

1. go to **www.mongodb.com/**, register an account and sign in. Then, create a **cluster** using the sandbox database (free)

2. click on **Database Access** underneath the security tab and create a user. Keep the user and password for connecting the database in step 5

3. in **Network Access**, make sure the database can be accessed from your IP

4. go back to the cluster dashboard, click "Connect" and "Connect your application". 
You should have a link such as **mongodb+srv://USER:PASSWORD@cluster0.5trwy.mongodb.net/<dbname>?retryWrites=true&w=majority**

5. back in your codebase, create a **.env file** and copy the following link without wrapping it in quotation mark : 
**DB_CONNECT=mongodb+srv://USER:PASSWORD@cluster0.5trwy.mongodb.net/<dbname>?retryWrites=true&w=majority**
Make sure to change USER and PASSWORD according to the Database Access user your created in step 2

6. in app.js, add the following

```javascript
mongoose.connect(
  process.env.DB_CONNECT, 
  { useNewUrlParser: true, 
    useUnifiedTopology: true 
  },
  () => console.log("Connected to my Mongodb database")
)
```

7. in your terminal, start your server and make sure the database is connected.

```console
npm start
```

### Routing for authentication

1. create two folders in the project directory

```console
mkdir routes
mkdir models
```

2. create a auth.js file within the routes folder

3. create a User.js file and a validations.js in models

4. build a model for user data in User.js with mongoose

```javascript
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 20
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 30
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)
```

5. in validations.js, code two validations functions for register and login with the Joi dependency

```javascript
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
```

6. in auth.js, import express, bcryptjs, jwt, the user model and the validation functions

```javascript
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { registerValidation, loginValidation } = require('../models/validations')
```

7. create two express routes with the POST action

```javascript
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
```

8. in the routes folder, create a middleware function in a verifyToken.js file

```javascript
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const token = req.header('jwt')
  if (!token) return res.status(401).json({message: 'Access denied'})

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET)
    req.user = verified
    next()
  } catch(err) {
    res.status(400).json({message: 'Invalid token'})
  }

}
```

9. go back to index.js and import your newly created routes

```javascript
const authRoutes = require('./routes/auth')
```

10. build the API endpoint

```javascript
app.use('/api/user', authRoutes)
```

### Routing for users

1. in the routes folder, create a users.js file. Import express, the User model and the middleware verifyToken function

```javascript
const router = require('express').Router()
const User = require('../models/User')
const verify = require('./verifyToken')
```

2. create a middleware getUser function to retrieve user params

```javascript
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
```

3. create five routes for the CRUD actions and export the router

```javascript
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

module.exports = router
```

4. in index.js, import your routes for user

```javascript
const usersRoutes = require('./routes/users')
```

5. then, create the endpoint for users

```javascript
app.use('/api/users', usersRoutes)
```

### Testing on Postman

1. run the server

```console
npm start
```

2. write a POST request to http://localhost:3000/api/user/register 
Headers should be "content-type": "application/json"
Body : 
```json
{
  "name": "yourName",
  "email": "yourEmail",
  "password": "yourPassword"
}
```

3. write a POST request to http://localhost:3000/api/user/login
- Headers should be "content-type": "application/json"
- Body : 
```json
{
  "email": "yourEmail",
  "password": "yourPassword"
}
```
- save the token from the request header

4. try to retrieve all users with GET http://localhost:3000/api/users/ without passing a token in the headers, you should get a 401 response

5. write your GET http://localhost:3000/api/users/ with the following headers to retrieve users:
jwt TOKEN FROM STEP 3

### Email confirmation

1. Install Nodemailer via the terminal

```console
npm i nodemailer
```

2. Edit the User.js to add a confirmed column with a false default value to the UserSchema

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 20
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 30
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)
```

3. Open routes/auth.js and verify if user is confirmed beneath the password verification

```javascript
if (!user.confirmed) return res.status(400).json({message: "Please confirm your email first"})
```

4. Create a emailUser.js file in the routes folder and import nodemailer, dotenv and jsonwebtoken

```javascript
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')
```

5. In your .env file, add your gmail ID, your gmail password and a secret key : 
GMAIL_USER=x@gmail.com 
GMAIL_PWD=xxxxx
EMAIL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxx

6. Write a function that takes two arguments, the user ID and the user email. The function will create a token and send an email to the given user email. Pass http://localhost:3000/api/user/confirmation/${token} as a reference to an anchor HTML tag in the email body to redirect the user to the confirmation link. 

```javascript
module.exports = async function(userID, userEmail) {

  const token = jwt.sign({id: userID}, process.env.EMAIL_SECRET)
  
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PWD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Bastien Ratat" <bastien.ratat@gmail.com>',
    to: userEmail,
    subject: "Confirmation email",
    text: "Please click on the following link to validate your account",
    html: `<a href="http://localhost:3000/api/user/confirmation/${token}">Click here to confirm your email</a>`
  });

}
```

7. create a verifyEmail.js file in your routes. This function will be our middleware to check the token, retrieve the userId and update the confirmed value from the user table

```javascript
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
```

8. Go to routes/auth.js, import the function and create a route for confirmation. Pass it the verifyEmail middleware function.

```javascript
const verifyEmail = require('./verifyEmail')
```

```javascript
// GET /confirmation/TOKEN_FOR_EMAIL_CONFIRMATION
router.get('/confirmation/:token', verifyEmail , async (req, res) => {
  // Take res.user from the middleware verifyEmail and update the record
  res.user.confirmed = true
  try {
    const updatedUserInformations = await res.user.save()
    res.status(200).json({id: res.user.id, name: res.user.name, email: res.user.email, confirmed: res.user.confirmed})
  } catch(err) {
    res.status(400).json({message: err.message})
  }
})
```
