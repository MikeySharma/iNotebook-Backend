const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')



const JWT_SECRET = 'Theworldofgood$b$oy';
//ROUTE 1: Create a user using: POST '/api/auth/createuser'. "No login required"
let success = null;
router.post('/createuser', [
  body('name', "Enter a valid name").isLength({ min: 3 }),
  body('email', "Enter a valid email").isEmail(),
  body('password', "Password must be atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {
  //If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false
    return res.status(400).json({success, errors: errors.arry() });
  }
  try {
    let user = await User.findOne({ email: req.body.email })

    if (user) {
      success = false
      return res.status(400).json({success,  error: "Sorry a user with this email already exist" })
    }
    //Check whether the user exist with the same email already
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    })

    // .then(user => res.json(user))
    // .catch((err)=>{console.log(err)
    // res.json({err: "please enter a unique email", message: err.message})})

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true
    res.json({success, authToken });
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error occured');
  }
})

//ROUTE 2: Authenticate a user using: POST '/api/auth/login'. "No login required"
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  //If there are errors, return bad request and errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false
    return res.status(400).json({success,  errors: errors.array() })
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({success, error: 'Please try to login with correct credentials' })
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({success, error: "Please try to login with correct credentials" })
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authToken });

  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error occured');
  }

});


//ROUTE 3: get loggedin User Details  using: POST '/api/auth/getuser'. " login required"

router.post('/getuser',fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user =  await User.findById(userId).select('-password');
    res.send( user);
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error occured');

  }
})

module.exports = router