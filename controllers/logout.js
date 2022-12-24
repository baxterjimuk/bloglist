const router = require('express').Router()

const { Session } = require('../models')

router.delete('/', async (req, res) => {
  await Session.destroy({
    where: {
      token: req.get('authorization').substring(7)
    }
  })
  res.status(204).end('Successfully logout!')
})

module.exports = router