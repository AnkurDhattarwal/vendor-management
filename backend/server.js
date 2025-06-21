// backend/server.js
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const Database = require('./config/Database');
const supervendorRoutes = require('./routes/supervendorRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

require('dotenv').config();

class Server {
  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
    this.start();
  }

  configureMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  configureRoutes() {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/supervendor', supervendorRoutes);
    this.app.use('/api/subvendor', require('./routes/subvendorRoutes'));

    // you’ll add more as we go (e.g. public “tree” routes)
  }

  configureErrorHandling() {
    this.app.use(errorHandler);  // any thrown Error goes through here
  }

  async start() {
    await Database.connect();
    const port = process.env.PORT || 5000;
    this.app.listen(port, () =>
      console.log(`🚀 Server running on http://localhost:${port}`)
    );
  }
}

new Server();
