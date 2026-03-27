import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const register = async(req, res) => {
    try {
  const { name, email, password, role} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();
  res.status(201).json({ message: `User registered successfully ${name}` });
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
            return res.status(404).json({ message: `User not found ${email}` });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: `Invalid credentials for ${email}` });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong at Login' });
    }
};

export { register, login };
