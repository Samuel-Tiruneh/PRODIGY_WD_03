const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/tictactoe', {
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
});

const User = mongoose.model('User', userSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, avatar });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'secret');
    res.send({ token, username: user.username, avatar: user.avatar });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');
    const user = await User.findById(decoded.id);
    res.send({ username: user.username, avatar: user.avatar });
  } catch (error) {
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
