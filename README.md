# Job Application System

A complete full-stack job application system with email and WhatsApp notifications, file upload capabilities, and an admin dashboard.

## 🚀 Features

- **Professional Application Form** - Mobile-responsive design
- **File Upload** - Resume upload (PDF, DOC, DOCX)
- **Email Notifications** - Automatic emails to applicants and HR
- **WhatsApp Notifications** - Instant WhatsApp alerts for new applications
- **Admin Dashboard** - Real-time application management
- **Data Storage** - Local file storage for applications
- **Search & Filter** - Advanced filtering in admin panel

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Gmail account for email notifications (optional)
- WhatsApp for notifications (optional)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd job-application-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your actual credentials:

   ```bash
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   HR_EMAIL=hr@yourcompany.com

   # WhatsApp Configuration
   WHATSAPP_API_KEY=your_whatsapp_api_key
   WHATSAPP_PHONE_NUMBER=+1234567890
   ```

4. **Start the server**

   ```bash
   npm start
   ```

5. **Access the application**
   - Main Application: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin.html

## 🔧 Configuration

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### WhatsApp Setup

1. Send `/start` to `+34 644 51 95 23` on WhatsApp
2. You'll receive an API key
3. Add the API key to `WHATSAPP_API_KEY` in your `.env` file
4. Add your phone number with country code to `WHATSAPP_PHONE_NUMBER`

## 📁 Project Structure

```
job-application-system/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (not in git)
├── .env.example            # Example environment file
├── .gitignore              # Git ignore rules
├── public/                 # Static files
│   ├── index.html          # Main application form
│   └── admin.html          # Admin dashboard
├── uploads/                # Resume files (auto-created)
├── applications/           # Application data (auto-created)
└── README.md              # This file
```

## 🔒 Security

### Important Security Notes

- **Never commit `.env` files** - They contain sensitive credentials
- **Use environment variables** in production
- **Keep API keys secure** - Don't share them publicly
- **Monitor file uploads** - Only allow specific file types
- **Validate all inputs** - Server-side validation implemented

### Environment Variables

The following environment variables are used:

| Variable                | Description           | Required                          |
| ----------------------- | --------------------- | --------------------------------- |
| `PORT`                  | Server port           | No (default: 3000)                |
| `EMAIL_USER`            | Gmail address         | No (email disabled if not set)    |
| `EMAIL_PASS`            | Gmail app password    | No (email disabled if not set)    |
| `HR_EMAIL`              | HR notification email | No (uses EMAIL_USER if not set)   |
| `WHATSAPP_API_KEY`      | CallMeBot API key     | No (WhatsApp disabled if not set) |
| `WHATSAPP_PHONE_NUMBER` | Your WhatsApp number  | No (WhatsApp disabled if not set) |

## 🚀 Deployment

### Render Deployment

1. **Connect your GitHub repository** to Render
2. **Set environment variables** in Render dashboard:
   - Go to your service → Environment
   - Add all variables from your `.env` file
3. **Deploy** - Render will automatically deploy your app

### Other Platforms

The application can be deployed to:

- **Heroku** - Use environment variables in dashboard
- **Vercel** - Add environment variables in project settings
- **Railway** - Set environment variables in dashboard
- **DigitalOcean** - Use App Platform with environment variables

## 📧 API Endpoints

- `POST /api/submit-application` - Submit new application
- `GET /api/applications` - Get all applications (admin)
- `GET /api/application-status/:id` - Check application status
- `GET /api/health` - Health check

## 🎯 Usage

### For Applicants

1. Visit the application form
2. Fill in all required fields
3. Upload resume (optional)
4. Submit application
5. Receive confirmation email

### For Admins

1. Access admin dashboard
2. View all applications
3. Search and filter applications
4. Update application status
5. View detailed application information

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
# Test email configuration
node test-email.js

# Test WhatsApp configuration
node test-whatsapp.js
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you need help:

1. Check the documentation
2. Review the setup guides
3. Test your configuration
4. Check server logs for errors

## 🔄 Updates

- **v1.0.0** - Initial release with email and WhatsApp notifications
- **v1.1.0** - Added admin dashboard with real-time data
- **v1.2.0** - Enhanced security and deployment guides

---

**⚠️ Security Reminder**: Never commit your `.env` file to version control!
