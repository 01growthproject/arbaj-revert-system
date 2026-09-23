const jwt = require('jsonwebtoken');


const adminLogin = (req, res) => {

  try {
    const { username, password } = req.body;

    if ( !username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    const validUsername = username === process.env.ADMIN_USERNAME;
    const validPassword = password === process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ 
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

module.exports = { adminLogin };