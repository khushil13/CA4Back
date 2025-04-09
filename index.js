const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { users, addUser, getUserByUsername } = require('./users');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (getUserByUsername(username)) {
    return res.status(409).send('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  addUser({ username, password: hashedPassword });
  res.status(201).send('User registered successfully');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = getUserByUsername(username);

  if (!user) return res.status(401).send('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid credentials');

  res.cookie('token', username, { httpOnly: true });
  res.send('Logged in successfully');
});

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  const user = getUserByUsername(token);
  if (!user) return res.status(404).send('Not authenticated');
  req.user = user;
  next();
}

app.get('/profile', authMiddleware, (req, res) => {
  res.json({ username: req.user.username });
});

app.get('/time', authMiddleware, (req, res) => {
  res.json({ serverTime: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
