const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const buildPath = path.join(__dirname, 'build');

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(buildPath));

// Fallback to index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
