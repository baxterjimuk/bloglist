const router = require('express').Router()
const { ReadingList } = require('../models')
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

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.put('/:id', tokenExtractor, async (req, res) => {
  const readingList = await ReadingList.findByPk(req.params.id);
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