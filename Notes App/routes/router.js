const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/security')

const Note = require('../models/notes')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'loginl',
  })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.firstName,
      notes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router