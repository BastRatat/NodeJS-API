const chai = require('chai')
const chaiHttp = require('chai-http')
const dotenv = require('dotenv')

const { expect } = chai
const app = process.env.API_URL

chai.use(chaiHttp)

describe('Authentication', () => {
  // registration
  describe('Register', () => {
    it("should return a 200 and an object with user data", (done) => {
      chai.request(app)
      .post('/api/user/register')
      .send({
        name: "Juan Mata",
        email: "jo.mata@gmail.com", 
        password: "123456"
      })
      .end((err, res) => {
        if (err) done(err)
        expect(res).to.have.status(201)
        expect(res).to.be.an('object')
        done()
      })
    }
  )})
})