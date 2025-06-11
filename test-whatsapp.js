// Test WhatsApp configuration
require("dotenv").config();
const https = require("https");

async function testWhatsApp() {
  console.log("Testing WhatsApp configuration...");
  console.log("API Key:", process.env.WHATSAPP_API_KEY);
  console.log("Phone Number:", process.env.WHATSAPP_PHONE_NUMBER);

  if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_PHONE_NUMBER) {
    console.log("❌ WhatsApp configuration missing!");
    return;
  }

  const testMessage = `🧪 *WhatsApp Test Message*

This is a test message from your job application system.

*Test Details:*
- API Key: ${process.env.WHATSAPP_API_KEY}
- Phone: ${process.env.WHATSAPP_PHONE_NUMBER}
- Time: ${new Date().toLocaleString()}

If you receive this message, your WhatsApp notifications are working! 🎉`;

  // Using CallMeBot API - correct format
  const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER.replace("+", ""); // Remove + for CallMeBot
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodeURIComponent(
    testMessage
  )}&apikey=${process.env.WHATSAPP_API_KEY}`;

  console.log("\n📱 Sending test WhatsApp message...");
  console.log("URL:", url);

  https
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log("✅ WhatsApp test message sent!");
        console.log("Response status:", res.statusCode);
        console.log("Response data:", data);

        if (res.statusCode === 200) {
          console.log("\n🎉 WhatsApp configuration is working!");
          console.log("You should receive a test message on your WhatsApp.");
        } else {
          console.log("\n⚠️  WhatsApp test failed. Check your configuration.");
          console.log("Response:", data);
        }
      });
    })
    .on("error", (error) => {
      console.log("❌ WhatsApp test failed:", error.message);
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Check your API key is correct");
      console.log("2. Verify your phone number includes country code");
      console.log('3. Make sure you sent "/start" to +34 644 51 95 23');
      console.log("4. Check your internet connection");
    });
}

testWhatsApp().catch(console.error);
