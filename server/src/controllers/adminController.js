const jwt = require('jsonwebtoken')

// ✅ POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { password } = req.body

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    // ✅ Token 7 days tak valid rahega — bar bar login nahi karna padega
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ message: 'Login successful', token })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { adminLogin }