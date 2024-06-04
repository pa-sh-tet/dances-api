const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const danceSchema = new mongoose.Schema({
  title: String,
  description: String,
  links: [String]
});

const userSchema = new mongoose.Schema({
  fio: String,
  date: String,
  login: String,
  password: String
});

const Dance = mongoose.model('Dance', danceSchema);
const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  const adminUser = await User.findOne({ login: 'admin' });
  if (!adminUser) {
    const newAdmin = new User({
      fio: 'Admin Admin Admin',
      date: '01.01.2000',
      login: 'admin',
      password: 'admin' // Рекомендуется хэшировать пароль перед сохранением
    });
    await newAdmin.save();
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

mongoose.connect('mongodb://127.0.0.1:27017/dances', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successfully connected to the database');
}).catch((error) => {
  console.error('Connection error:', error);
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
  console.log('Connected to MongoDB');
  await createAdminUser();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

app.use(cors());
app.use(express.json());

app.get('/api/dances', async (req, res) => {
  try {
    const dances = await Dance.find();
    res.json(dances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/dances', async (req, res) => {
  try {
    const newDance = new Dance(req.body);
    await newDance.save();
    res.status(201).json(newDance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/dances/:id', async (req, res) => {
  try {
    await Dance.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await User.findOne({ login, password });
    if (user) {
      res.json({ success: true, isAdmin: user.login === 'admin' });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
