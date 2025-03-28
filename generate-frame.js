const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas with 1024x1024 dimensions
const width = 1024;
const height = 1024;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Set up the frame parameters
const frameWidth = 50; // Width of the frame border
const cornerRadius = 20; // Rounded corners

// Clear the canvas with transparency
ctx.clearRect(0, 0, width, height);

// Create a path for the outer edge of the frame (the entire canvas)
ctx.beginPath();
ctx.moveTo(cornerRadius, 0);
ctx.lineTo(width - cornerRadius, 0);
ctx.arcTo(width, 0, width, cornerRadius, cornerRadius);
ctx.lineTo(width, height - cornerRadius);
ctx.arcTo(width, height, width - cornerRadius, height, cornerRadius);
ctx.lineTo(cornerRadius, height);
ctx.arcTo(0, height, 0, height - cornerRadius, cornerRadius);
ctx.lineTo(0, cornerRadius);
ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
ctx.closePath();

// Create gradient for frame
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#ff7e5f');
gradient.addColorStop(1, '#feb47b');
ctx.fillStyle = gradient;
ctx.fill();

// Create a path for the inner edge of the frame (the transparent center)
const innerWidth = width - (frameWidth * 2);
const innerHeight = height - (frameWidth * 2);
const innerX = frameWidth;
const innerY = frameWidth;
const innerCornerRadius = Math.max(0, cornerRadius - frameWidth/2);

ctx.beginPath();
ctx.moveTo(innerX + innerCornerRadius, innerY);
ctx.lineTo(innerX + innerWidth - innerCornerRadius, innerY);
ctx.arcTo(innerX + innerWidth, innerY, innerX + innerWidth, innerY + innerCornerRadius, innerCornerRadius);
ctx.lineTo(innerX + innerWidth, innerY + innerHeight - innerCornerRadius);
ctx.arcTo(innerX + innerWidth, innerY + innerHeight, innerX + innerWidth - innerCornerRadius, innerY + innerHeight, innerCornerRadius);
ctx.lineTo(innerX + innerCornerRadius, innerY + innerHeight);
ctx.arcTo(innerX, innerY + innerHeight, innerX, innerY + innerHeight - innerCornerRadius, innerCornerRadius);
ctx.lineTo(innerX, innerY + innerCornerRadius);
ctx.arcTo(innerX, innerY, innerX + innerCornerRadius, innerY, innerCornerRadius);
ctx.closePath();

// Cut out the center to make it transparent
ctx.globalCompositeOperation = 'destination-out';
ctx.fillStyle = 'black';
ctx.fill();

// Add some decorative elements to the frame
ctx.globalCompositeOperation = 'source-over';

// Add some subtle patterns to the frame
ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
ctx.lineWidth = 2;

// Add some decorative lines along the frame border
for (let i = 0; i < 8; i++) {
  const offset = frameWidth * 0.3 + (i * 5);
  // Top border
  ctx.beginPath();
  ctx.moveTo(cornerRadius + offset, frameWidth / 2);
  ctx.lineTo(width - cornerRadius - offset, frameWidth / 2);
  ctx.stroke();
  
  // Bottom border
  ctx.beginPath();
  ctx.moveTo(cornerRadius + offset, height - frameWidth / 2);
  ctx.lineTo(width - cornerRadius - offset, height - frameWidth / 2);
  ctx.stroke();
  
  // Left border
  ctx.beginPath();
  ctx.moveTo(frameWidth / 2, cornerRadius + offset);
  ctx.lineTo(frameWidth / 2, height - cornerRadius - offset);
  ctx.stroke();
  
  // Right border
  ctx.beginPath();
  ctx.moveTo(width - frameWidth / 2, cornerRadius + offset);
  ctx.lineTo(width - frameWidth / 2, height - cornerRadius - offset);
  ctx.stroke();
}

// Add some sparkle effects on the corners
function drawSparkle(x, y, size) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1;
  
  // Draw crossing lines
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(angle) * size, y - Math.sin(angle) * size);
    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
    ctx.stroke();
  }
}

// Draw sparkles at each corner
drawSparkle(cornerRadius, cornerRadius, 15);
drawSparkle(width - cornerRadius, cornerRadius, 15);
drawSparkle(cornerRadius, height - cornerRadius, 15);
drawSparkle(width - cornerRadius, height - cornerRadius, 15);

// Save the image to file
const outputPath = '/Users/moldovan/projects/fanfie/public/images/frame.png';
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`Frame image created at: ${outputPath}`);

