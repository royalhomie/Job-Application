#!/bin/bash

# Job Application System - Quick Start Script
# This script sets up and runs the job application system with ngrok

echo "🚀 Job Application System - Quick Start"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install ngrok from https://ngrok.com/"
    echo "   Or use: brew install ngrok (macOS) / choco install ngrok (Windows)"
    exit 1
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p job-application-system/public
cd job-application-system

# Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "job-application-system",
  "version": "1.0.0",
  "description": "Professional job application system with ngrok hosting",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "ngrok": "ngrok http 3000"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Install dependencies
echo "⬇️  Installing dependencies..."
npm install

# Create .env template
echo "⚙️  Creating environment configuration..."
cat > .env << 'EOF'
# Server Configuration
PORT=3000

# Email Configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
HR_EMAIL=hr@yourcompany.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EOF

# Create .gitignore
echo "🔒 Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.env
uploads/
applications/
*.log
.DS_Store
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 IMPORTANT: Before running, please:"
echo "1. Edit the .env file with your actual email credentials"
echo "2. For Gmail, use an 'App Password' (not your regular password)"
echo "3. Make sure you have ngrok authenticated with your token"
echo ""
echo "🚀 To start the application:"
echo "   1. Terminal 1: npm start"
echo "   2. Terminal 2: ngrok http 3000"
echo ""
echo "🌍 Your application will be accessible at the ngrok URL!"
echo ""

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting Job Application System..."
echo "Make sure to run 'ngrok http 3000' in another terminal!"
npm start
EOF

chmod +x start.sh

echo "💡 Quick start: ./start.sh"
echo "📊 Admin dashboard will be at: https://your-ngrok-url.ngrok.io/admin.html"