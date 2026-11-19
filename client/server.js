const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Log the build directory path
const buildPath = path.join(__dirname, 'build');
console.log('Build directory path:', buildPath);
console.log('Build directory exists:', fs.existsSync(buildPath));

if (fs.existsSync(buildPath)) {
  const files = fs.readdirSync(buildPath);
  console.log('Files in build directory:', files);
}

// Serve static files from the React build folder
app.use(express.static(buildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Serving:', indexPath);
  console.log('Index.html exists:', fs.existsSync(indexPath));
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please check deployment.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Server directory: ${__dirname}`);
});
