# Complete Setup Guide - Job Application System with ngrok

## Step 1: Install Prerequisites

### Install Node.js
1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Verify installation:
```bash
node --version
npm --version
```

### Install ngrok
1. **Option A: Download from website**
   - Go to [ngrok.com](https://ngrok.com/)
   - Sign up for a free account
   - Download ngrok for your operating system
   - Extract and move to your PATH

2. **Option B: Install via package manager**
   ```bash
   # Windows (using chocolatey)
   choco install ngrok
   
   # macOS (using homebrew)
   brew install ngrok/ngrok/ngrok
   
   # Linux (using snap)
   snap install ngrok
   ```

3. **Authenticate ngrok**
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
   (Get your authtoken from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken))

## Step 2: Create Project Structure

```bash
mkdir job-application-system
cd job-application-system
```

Create the following files:

### File Structure
```
job-application-system/
├── server.js
├── package.json
├── .env
├── .gitignore
├── public/
│   ├── index.html
│   └── admin.html
├── uploads/          (auto-created)
└── applications/     (auto-created)
```

## Step 3: Setup Project Files

### 1. Create package.json
```json
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
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env file
```bash
# Server Configuration
PORT=3000

# Email Configuration (Use your actual email credentials)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
HR_EMAIL=hr@yourcompany.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 4. Create public directory
```bash
mkdir public
```

### 5. Copy the HTML files
- Copy the main application form HTML to `public/index.html`
- Copy the admin dashboard HTML to `public/admin.html`
- Copy the server.js file to the root directory

## Step 4: Setup Email Authentication

### For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `.env` file

### For Other Providers:
Update SMTP settings in `.env`:
```bash
# Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## Step 5: Start the Application

### Terminal 1: Start the Node.js server
```bash
npm start
```

You should see:
```
Server is running on port 3000
Access the application at http://localhost:3000
```

### Terminal 2: Start ngrok
```bash
ngrok http 3000
```

You'll see output like:
```
ngrok by @inconshreveable

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

## Step 6: Access Your Application

### Public URLs (accessible from anywhere):
- **Main Application**: `https://abc123.ngrok.io`
- **Admin Dashboard**: `https://abc123.ngrok.io/admin.html`
- **API Health Check**: `https://abc123.ngrok.io/api/health`

### Local URLs (only accessible from your computer):
- **Main Application**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin.html`

## Step 7: Test the System

### Test Application Submission:
1. Open your ngrok URL in a browser
2. Fill out the job application form
3. Upload a resume (PDF, DOC, or DOCX)
4. Submit the application
5. Check your email for confirmation
6. Check HR email for notification

### Test Admin Dashboard:
1. Open `https://your-ngrok-url.ngrok.io/admin.html`
2. View application statistics
3. Filter and search applications
4. Update application status

## Step 8: Share Your Application

### Share these URLs with others:
- **Job Seekers**: `https://your-ngrok-url.ngrok.io`
- **HR Team**: `https://your-ngrok-url.ngrok.io/admin.html`

### ngrok Web Interface
- Access `http://127.0.0.1:4040` to monitor traffic and requests

## Advanced ngrok Features

### Custom Domain (Paid Plan)
```bash
ngrok http 3000 --domain=your-custom-domain.ngrok.io
```

### Password Protection
```bash
ngrok http 3000 --basic-auth="username:password"
```

### Fixed Subdomain (Paid Plan)
```bash
ngrok http 3000 --subdomain=my-job-portal
```

## Security Considerations for Production

### 1. Environment Variables
Never commit `.env` file to version control:
```bash
# Add to .gitignore
.env
```

### 2. ngrok Security
- Use authentication for sensitive admin areas
- Monitor ngrok dashboard for unusual traffic
- Consider paid ngrok plan for production use

### 3. File Upload Security
- The system already validates file types and sizes
- Uploaded files are stored securely with unique names

## Troubleshooting

### Common Issues:

1. **ngrok command not found**
   ```bash
   # Make sure ngrok is in your PATH or use full path
   ./ngrok http 3000
   ```

2. **Email not sending**
   - Check email credentials in `.env`
   - Verify app password (not regular password)
   - Check SMTP settings

3. **Port already in use**
   ```bash
   # Use different port
   PORT=3001 npm start
   ngrok http 3001
   ```

4. **File upload fails**
   - Check file size (max 5MB)
   - Verify file type (PDF, DOC, DOCX only)
   - Ensure uploads directory exists

### Debug Mode:
```bash
# Run with debug logs
DEBUG=* npm start
```

## Monitoring and Analytics

### ngrok Dashboard
- Real-time request monitoring
- Traffic analytics
- Error tracking

### Application Logs
- Server logs show all activities
- Email sending confirmations
- File upload success/failure

## Next Steps

### For Production Deployment:
1. Consider proper hosting (AWS, Heroku, DigitalOcean)
2. Set up SSL certificates
3. Use environment-specific configurations
4. Implement proper logging and monitoring
5. Add database integration for scalability

### For Development:
1. Add more form fields as needed
2. Customize email templates
3. Enhance admin dashboard features
4. Add user authentication for admin area

## Quick Commands Reference

```bash
# Start development server
npm run dev

# Start production server
npm start

# Start ngrok tunnel
ngrok http 3000

# Start ngrok with custom subdomain (paid)
ngrok http 3000 --subdomain=my-job-portal

# Start ngrok with authentication
ngrok http 3000 --basic-auth="admin:password"
```

Your job application system is now live and accessible from anywhere in the world! 🚀