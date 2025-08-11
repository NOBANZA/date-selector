const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = './data.json';

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();

  const user = data.users.find(u => u.username === username && u.password === password && u.enabled);

  if (user) {
res.json({
  username: user.username,
  title: user.title || 'Brother',
  userId: user.id,
  lastName: user.lastName || ''
});

  } else {
    res.sendStatus(401); // Unauthorized
  }
});


app.get('/admin/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.get('/admin/users', (req, res) => {
  const data = readData();
  res.json(data.users);
});

app.post('/admin/add-user', (req, res) => {
  const { username, password, title, firstName, lastName } = req.body;
  const data = readData();

  const maxId = data.users.reduce((max, u) => Math.max(max, u.id || 212399), 212399);
  const newId = maxId + 1;

  if (!data.users.find(u => u.username === username)) {
    data.users.push({
      id: newId,
      username,
      password, // moved here
      title: title || '',
      firstName: firstName || '',
      lastName: lastName || '',
      enabled: true
    });
    writeData(data);
    res.sendStatus(200);
  } else {
    res.status(409).send('Username already exists.');
  }
});




app.post('/admin/toggle-user', (req, res) => {
  const { username } = req.body;
  const data = readData();
  const user = data.users.find(u => u.username === username);
  if (user) {
    user.enabled = !user.enabled;
    writeData(data);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get('/dates', (req, res) => {
  const data = readData();
  const availableDates = data.dates.map(d => d.date);
  res.json({ availableDates });
});

app.post('/book-date', (req, res) => {
  const { title, name, userId, date, type } = req.body;

  if (!title || !name || !userId || !date || !type) {
    return res.status(400).send("Missing required fields");
  }

  const data = readData(); // ✅ Load data from file

  const slotIndex = data.dates.findIndex(d => d.date === date);
  if (slotIndex === -1) return res.status(404).send("Date not found");

  const slot = data.dates[slotIndex];
  const bookingEntry = { title, name, userId };

  if (type === "opening") {
    if (slot.opening && slot.opening.userId !== userId) {
      return res.status(409).send("Opening slot already booked");
    }
    slot.opening = bookingEntry;
  } else if (type === "closing") {
    if (slot.closing && slot.closing.userId !== userId) {
      return res.status(409).send("Closing slot already booked");
    }
    slot.closing = bookingEntry;
  } else {
    return res.status(400).send("Invalid slot type");
  }

  data.dates[slotIndex] = slot;
  writeData(data); // ✅ Save updated data
  res.status(200).send("Booking confirmed");
});



app.post('/admin/add-date', (req, res) => {
  const { date } = req.body;
  const data = readData();
  if (!data.dates.find(d => d.date === date)) {
    data.dates.push({ date });
    writeData(data);
  }
  res.sendStatus(200);
});


app.post('/admin/unlock-date', (req, res) => {
  const { date, type } = req.body;
  const data = readData();
  const slot = data.dates.find(d => d.date === date);
  if (slot && slot[type]) {
    delete slot[type]; // remove the booking
    writeData(data);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});


app.post('/admin/delete-date', (req, res) => {
  const { date } = req.body;
  const data = readData();
  const index = data.dates.findIndex(d => d.date === date);

  if (index === -1) {
    return res.sendStatus(404);
  }

  const entry = data.dates[index];
  if (entry.opening || entry.closing) {
    return res.status(403).send('Cannot delete a booked date.');
  }

  data.dates.splice(index, 1);
  writeData(data);
  res.sendStatus(200);
});





app.post('/admin/delete-user', (req, res) => {
  const { username } = req.body;

  if (username === 'admin') {
    return res.status(403).send('Cannot delete admin account.');
  }

  const data = readData();
  const index = data.users.findIndex(u => u.username === username);
  if (index !== -1) {
    data.users.splice(index, 1);
    writeData(data);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});



app.post('/admin/book-slot', (req, res) => {
  const { date, slot, userId } = req.body;

  if (!date || !slot || !userId) {
    return res.status(400).send('Missing required fields.');
  }

  const data = readData();

  // Check if user already booked any slot
  const alreadyBooked = data.dates.some(d =>
    (d.opening && d.opening.userId === userId) ||
    (d.closing && d.closing.userId === userId)
  );

  if (alreadyBooked) {
    return res.status(409).send('User has already booked a slot.');
  }

  const slotEntry = data.dates.find(d => d.date === date);
  if (!slotEntry) {
    return res.status(404).send('Date not found.');
  }

  if (slotEntry[slot] && slotEntry[slot].userId !== userId) {
    return res.status(409).send('Slot already booked.');
  }

  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).send('User not found.');
  }

  slotEntry[slot] = {
    title: user.title || '',
    name: user.lastName || user.username,
    userId: user.id
  };

  writeData(data);
  res.status(200).send('Booking confirmed.');
});


// POST /api/cancel-booking
app.post('/api/cancel-booking', async (req, res) => {
  const { userId, date, slotType, reason } = req.body;

  try {
    // Fetch booking
    const booking = await db.getBooking(date, slotType);

    // Validate ownership
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own booking.' });
    }

    // Optional: Check time-based cancellation lock
    const now = new Date();
    const bookingDate = new Date(date);
    const hoursUntil = (bookingDate - now) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
      return res.status(400).json({ error: 'Cancellations must be made at least 24 hours in advance.' });
    }

    // Cancel booking
    await db.cancelBooking(date, slotType);

    // Log reason
    await db.logCancellation({ userId, date, slotType, reason, timestamp: now });

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during cancellation.' });
  }
});




app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));
