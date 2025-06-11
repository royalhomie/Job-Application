# WhatsApp Notifications Setup Guide

## Overview

This guide will help you set up WhatsApp notifications for your job application system. When someone submits an application, you'll receive an instant WhatsApp message with all the details.

## Method 1: CallMeBot (Free & Easy)

### Step 1: Get Your WhatsApp API Key

1. **Open WhatsApp** on your phone
2. **Send this message** to `+34 644 51 95 23`:
   ```
   /start
   ```
3. **You'll receive a response** with your API key
4. **Copy the API key** (it looks like: `123456789`)

### Step 2: Update Your .env File

Replace the placeholder values in your `.env` file:

```bash
WHATSAPP_API_KEY=123456789
WHATSAPP_PHONE_NUMBER=+1234567890
```

**Important Notes:**

- Replace `123456789` with your actual API key
- Replace `+1234567890` with your phone number including country code
- Example: If you're in the US with number 555-123-4567, use `+15551234567`

### Step 3: Test the Setup

1. Restart your server: `npm start`
2. Submit a test application
3. Check your WhatsApp for the notification

## Method 2: WhatsApp Business API (Advanced)

If you need more features or higher message limits, you can use the official WhatsApp Business API:

### Step 1: Set Up WhatsApp Business Account

1. Go to [WhatsApp Business API](https://business.whatsapp.com/)
2. Create a business account
3. Get your API credentials

### Step 2: Update Configuration

Replace the webhook URL in `server.js` with your WhatsApp Business API endpoint.

## Method 3: Alternative Services

### Option A: Twilio WhatsApp

1. Sign up for [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Update the WhatsApp function in `server.js`

### Option B: MessageBird

1. Sign up for [MessageBird](https://messagebird.com/)
2. Get your API key
3. Update the configuration

## Testing Your Setup

### Test Command

```bash
curl -X POST http://localhost:3000/api/submit-application \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "email":"test@example.com",
    "phone":"1234567890",
    "position":"Developer",
    "experience":"2 years",
    "salary":"50000",
    "availability":"Immediate",
    "coverLetter":"Testing WhatsApp notifications",
    "linkedin":"",
    "portfolio":"",
    "source":"Website"
  }'
```

### Expected WhatsApp Message

You should receive a message like:

```
📋 New Job Application Received

Application ID: APP-1749667449806-CCN791ODR
Name: Test User
Position: Developer
Email: test@example.com
Phone: 1234567890
Experience: 2 years
Expected Salary: 50000
Availability: Immediate

Cover Letter Preview:
Testing WhatsApp notifications

Submitted: 6/11/2025, 6:44:09 PM

View full application at: http://localhost:3000/admin.html
```

## Troubleshooting

### Issue: No WhatsApp message received

**Solutions:**

1. Check your API key is correct
2. Verify your phone number includes country code
3. Make sure you sent `/start` to the CallMeBot number
4. Check server logs for error messages

### Issue: API key not working

**Solutions:**

1. Generate a new API key by sending `/start` again
2. Wait a few minutes for the key to activate
3. Check if you have any message limits

### Issue: Server errors

**Solutions:**

1. Check your `.env` file format
2. Restart the server after updating configuration
3. Check console logs for specific error messages

## Security Notes

- Keep your API keys secure
- Don't share your `.env` file
- Consider using environment variables in production
- Monitor your message usage to avoid limits

## Cost Information

- **CallMeBot**: Free (limited messages per day)
- **WhatsApp Business API**: Paid (per message)
- **Twilio**: Paid (per message)
- **MessageBird**: Paid (per message)

## Support

If you need help:

1. Check the CallMeBot documentation
2. Review server logs for error messages
3. Test with a simple message first
4. Verify your internet connection

## Next Steps

Once WhatsApp is working:

1. Test with real applications
2. Customize the message format if needed
3. Set up additional notification channels
4. Monitor message delivery rates
