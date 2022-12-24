const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Blog, User, Session } = require('../models')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  let where = {}
  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.match]: req.query.search
          }
        },
        {
          author: {
            [Op.match]: req.query.search
          }
        }
      ]
    }
  }
  const blogs = await Blog.findAll({
    include: {
      model: User
    },
    where,
    order: [
      ['likes', 'DESC']
    ]
  })
  res.json(blogs)
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

router.post('/', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  const blog = await Blog.create({ ...req.body, userId: user.id })
  return res.json(blog)
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  if (req.blog) {
    if (req.blog.userId === user.id) {
      await req.blog.destroy()
      res.status(204).end()
    } else {
      res.status(401).json({ error: 'Unauthorized deletion' })
    }
  } else {
    res.status(401).json({ error: 'Invalid blog id' })
  }
})

router.put('/:id', blogFinder, async (req, res) => {
  req.blog.likes = req.body.likes
  await req.blog.save()
  res.json(req.blog)
})

module.exports = router