import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const register = async(req, res) => {
    try {
  const { name, email, password, role} = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();
  
  // Create JWT token
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // Return user without password
  const userResponse = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
  
  res.status(201).json({ 
    message: `User registered successfully`, 
    token,
    user: userResponse 
  });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: `Something went wrong at Registration ${error.message}` });
    }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: `User not found` });
        }
        if (user.status === 'inactive' || user.isActive === false) {
            return res.status(403).json({ message: 'User account is inactive. Contact admin.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: `Invalid credentials` });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Return user without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: userResponse 
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong at Login' });
    }
};

export { register, login };
