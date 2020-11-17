const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')

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
    html: `<a href="${process.env.API_URL}/api/user/confirmation/${token}">Click here to confirm your email</a>`
  });

}
