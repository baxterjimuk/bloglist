const router = require('express').Router()
const { ReadingList, Session, User } = require('../models')
const { SECRET } = require('../util/config')
const jwt = require('jsonwebtoken')

router.post('/', async (req, res) => {
  try {
    const readingList = await ReadingList.create(req.body)
    res.json(readingList)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const session = await Session.findAll({
        where: { token: authorization.substring(7) }
      })
      if (session.length == 0) {
        return res.status(401).json({ error: 'Session expired. Please login again.' })
      } else {
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
        const user = await User.findByPk(req.decodedToken.id)
        if (user.disabled) {
          return res.status(401).json({ error: 'Unable to proceed. Your account has been disabled.' })
        }
      }
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.put('/:id', tokenExtractor, async (req, res) => {
  const readingList = await ReadingList.findByPk(req.params.id)

  if (readingList) {
    if (readingList.userId === req.decodedToken.id) {
      readingList.read = req.body.read
      await readingList.save()
      res.json(readingList)
    } else {
      res.status(401).json({ error: `Cannot set read/unread status of others' reading list` })
    }
  } else {
    res.status(401).json({ error: 'Invalid reading list id' })
  }
})

module.exports = router