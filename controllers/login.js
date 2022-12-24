const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const { User, Session } = require('../models')

router.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  const passwordCorrect = body.password === 'secret'

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  if (user.disabled) {
    return response.status(401).json({
      error: 'account disabled, unable to login'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  // set token to expire in 1 hour in case user did not do logout
  const token = jwt.sign(userForToken, SECRET, { expiresIn: 60 * 60 })

  await Session.create({ token })

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router