# Deployment Guide

This guide will help you deploy your job application system to various platforms while keeping your sensitive data secure.

## 🚀 Render Deployment

### Step 1: Prepare Your Repository

1. **Ensure your `.gitignore` is correct** (already done)
2. **Create a `render.yaml` file** for easy deployment:

```yaml
services:
  - type: web
    name: job-application-system
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Step 2: Deploy to Render

1. **Sign up/Login** to [Render](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure the service**:
   - **Name**: `job-application-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In your Render dashboard, go to **Environment** and add these variables:

```bash
# Server Configuration
PORT=10000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
HR_EMAIL=hr@yourcompany.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# WhatsApp Configuration
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_NUMBER=+1234567890
```

### Step 4: Deploy

Click **Create Web Service** and wait for deployment.

## 🌐 Other Deployment Platforms

### Heroku

1. **Install Heroku CLI**
2. **Create app**:
   ```bash
   heroku create your-app-name
   ```
3. **Set environment variables**:
   ```bash
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   heroku config:set HR_EMAIL=hr@yourcompany.com
   heroku config:set WHATSAPP_API_KEY=your_api_key
   heroku config:set WHATSAPP_PHONE_NUMBER=+1234567890
   ```
4. **Deploy**:
   ```bash
   git push heroku main
   ```

### Vercel

1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in project settings
3. **Deploy automatically** on push

### Railway

1. **Connect your GitHub repository**
2. **Add environment variables** in dashboard
3. **Deploy automatically**

## 🔒 Security Checklist

Before deploying, ensure:

- ✅ **`.env` file is in `.gitignore`**
- ✅ **No sensitive data in code**
- ✅ **Environment variables set in platform**
- ✅ **File upload limits configured**
- ✅ **CORS settings appropriate**

## 📝 Environment Variables Reference

| Variable                | Description        | Example                            |
| ----------------------- | ------------------ | ---------------------------------- |
| `PORT`                  | Server port        | `10000` (Render) or `3000` (local) |
| `EMAIL_USER`            | Gmail address      | `your-email@gmail.com`             |
| `EMAIL_PASS`            | Gmail app password | `abcd efgh ijkl mnop`              |
| `HR_EMAIL`              | HR notifications   | `hr@company.com`                   |
| `WHATSAPP_API_KEY`      | CallMeBot API key  | `123456789`                        |
| `WHATSAPP_PHONE_NUMBER` | Your WhatsApp      | `+1234567890`                      |

## 🚨 Important Notes

### For Render Specifically

- **Port**: Use `PORT=10000` (Render's default)
- **File Storage**: Files are stored locally (not persistent)
- **Database**: Consider adding a database for production

### For All Platforms

- **Environment Variables**: Set them in the platform dashboard
- **Never commit secrets**: Keep `.env` out of version control
- **Test thoroughly**: Verify all features work after deployment

## 🔧 Troubleshooting

### Common Issues

1. **Environment variables not working**

   - Check platform dashboard
   - Restart the service
   - Verify variable names

2. **Email not sending**

   - Check Gmail app password
   - Verify 2FA is enabled
   - Check platform email restrictions

3. **WhatsApp not working**
   - Verify API key is correct
   - Check phone number format
   - Test with CallMeBot

### Getting Help

1. Check platform logs
2. Verify environment variables
3. Test locally first
4. Check platform documentation

## 📊 Monitoring

After deployment:

1. **Test all features**
2. **Monitor logs**
3. **Check email delivery**
4. **Verify WhatsApp notifications**
5. **Test file uploads**

## 🔄 Updates

To update your deployed application:

1. **Push changes** to GitHub
2. **Platform auto-deploys** (if connected)
3. **Verify new features** work
4. **Update environment variables** if needed

---

**Remember**: Your `.env` file stays local and secure! 🛡️
