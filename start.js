#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log(' Starting URL Shortener Microservice...\n');

// Check if node_modules exists
const fs = require('fs');
if (!fs.existsSync('node_modules')) {
  console.log('Installing dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log(' Dependencies installed successfully!\n');
      startServer();
    } else {
      console.error(' Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('Starting server...');
  const server = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });
  
  server.on('close', (code) => {
    console.log(`\nServer stopped with code ${code}`);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}
