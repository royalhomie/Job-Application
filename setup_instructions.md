# Job Application System - Setup Instructions

## Overview
This is a complete full-stack job application system with:
- Professional frontend with mobile-responsive design
- Node.js backend server with file upload capabilities
- Email notifications for applicants and HR team
- Secure file handling and data storage

## Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Email account for sending notifications (Gmail, Outlook, etc.)

## Installation Steps

### 1. Create Project Directory
```bash
mkdir job-application-system
cd job-application-system
```

### 2. Initialize the Project
```bash
npm init -y
```

### 3. Install Dependencies
```bash
npm install express multer nodemailer cors
npm install --save-dev nodemon
```

### 4. Create Project Structure
```
job-application-system/
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
├── public/
│   └── index.html
├── uploads/          (created automatically)
└── applications/     (created automatically)
```

### 5. Setup Environment Variables
Create a `.env` file in the root directory:
```bash
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
HR_EMAIL=hr@yourcompany.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 6. Create Public Directory
```bash
mkdir public
```

Move the HTML file to `public/index.html`.

### 7. Setup Email Authentication

#### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

#### For Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### For Yahoo:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Features

### Frontend Features
- ✅ Mobile-responsive design
- ✅ Form validation with visual feedback
- ✅ File upload with drag-and-drop support
- ✅ Professional UI with animations
- ✅ Success/error message handling
- ✅ Application ID tracking

### Backend Features
- ✅ Secure file upload handling (PDF, DOC, DOCX)
- ✅ Application data storage in plain text format
- ✅ Automated email notifications
- ✅ Application ID generation
- ✅ Error handling and validation
- ✅ CORS support for API access

### Email Notifications
- ✅ Confirmation email to applicant with application ID
- ✅ Notification email to HR team with all details
- ✅ Resume attachment in HR email
- ✅ Professional HTML email templates

## API Endpoints

### POST `/api/submit-application`
Submits a new job application with file upload.

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully!",
  "applicationId": "APP-1640995200000-ABCD123EF"
}
```

### GET `/api/application-status/:id`
Check the status of an application by ID.

### GET `/api/health`
Health check endpoint for server monitoring.

## File Storage

### Application Data
- Stored in `./applications/` directory
- Format: `application_[APPLICATION_ID].txt`
- Plain text format with all applicant information

### Resume Files
- Stored in `./uploads/` directory
- Unique filename with timestamp to prevent conflicts
- Original filename preserved for HR reference

## Deployment Options

### 1. Local Server
Perfect for small businesses or internal use.

### 2. Cloud Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set HR_EMAIL=hr@yourcompany.com

# Deploy
git push heroku main
```

### 3. VPS Deployment
1. Copy files to your server
2. Install Node.js and npm
3. Install dependencies
4. Configure environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "job-app"
pm2 startup
pm2 save
```

## Security Considerations

1. **File Upload Security**
   - File type validation (PDF, DOC, DOCX only)
   - File size limits (5MB maximum)
   - Unique filename generation to prevent conflicts

2. **Email Security**
   - Use app passwords instead of account passwords
   - Environment variables for sensitive data
   - Input validation and sanitization

3. **Data Protection**
   - Applications stored locally (not in database for simplicity)
   - File system permissions properly configured
   - CORS configured for API security

## Customization

### Email Templates
Modify the `emailTemplates` object in `server.js` to customize:
- Email subjects
- HTML styling
- Content and messaging

### Form Fields
Add or modify form fields by:
1. Updating the HTML form
2. Updating the backend data processing
3. Updating email templates

### File Types
Modify the `fileFilter` function in `server.js` to accept different file types.

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check email credentials
   - Verify SMTP settings
   - Ensure app password is used (not account password)

2. **File upload fails**
   - Check file size (must be under 5MB)
   - Verify file type (PDF, DOC, DOCX only)
   - Ensure uploads directory exists and is writable

3. **Server won't start**
   - Check if port 3000 is available
   - Verify all dependencies are installed
   - Check environment variables

### Logs
The server logs all activities to console. Check the terminal for detailed error messages.

## Support

For additional support or customization requests, please refer to the documentation or contact the development team.

## License
MIT License - Feel free to modify and use for your business needs.