const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const checkoutRoute = require('./routes/checkout');
const invoiceRoute = require('./routes/invoice'); // <-- ✅ New
const socketIo = require('socket.io');
const chatRoutes = require('./routes/chatRoutes');


const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this if your frontend runs elsewhere
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/yourdbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB Connected");
}).catch(err => console.error(err));

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});
app.use('/api/checkout', checkoutRoute);
app.use('/api/invoice', invoiceRoute); // <-- ✅ New
// Add chat routes
app.use('/api/chats', chatRoutes);




// Socket.io handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('send-message', (data) => {
    const { chatId, message, sender } = data;

    // Broadcast to others in the same chat room
    io.to(chatId).emit('receive-message', {
      chatId,
      message,
      sender
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});


