require('dotenv').config(); // Load .env file

fetch('https://openrouter.ai/api/v1/auth/key', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${process.env.openRouter_API}`
  }
});