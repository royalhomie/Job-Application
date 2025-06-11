// Simple email test script
require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("Testing Gmail connection...");
  console.log("Email User:", process.env.EMAIL_USER);
  console.log("SMTP Host:", process.env.SMTP_HOST);
  console.log("SMTP Port:", process.env.SMTP_PORT);

  // Test TLS (port 587)
  console.log("\n--- Testing TLS (port 587) ---");
  try {
    const transporterTLS = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporterTLS.verify();
    console.log("✅ TLS connection successful!");

    // Try sending a test email
    const info = await transporterTLS.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "Test Email - Job Application System",
      text: "This is a test email from your job application system.",
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.log("❌ TLS failed:", error.message);

    // Test SSL (port 465)
    console.log("\n--- Testing SSL (port 465) ---");
    try {
      const transporterSSL = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporterSSL.verify();
      console.log("✅ SSL connection successful!");

      // Try sending a test email
      const info = await transporterSSL.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: "Test Email - Job Application System (SSL)",
        text: "This is a test email from your job application system using SSL.",
      });

      console.log("✅ Test email sent successfully!");
      console.log("Message ID:", info.messageId);
    } catch (sslError) {
      console.log("❌ SSL also failed:", sslError.message);
      console.log("\n🔧 Troubleshooting suggestions:");
      console.log("1. Make sure 2-Factor Authentication is enabled");
      console.log(
        "2. Generate a fresh App Password from Google Account settings"
      );
      console.log(
        "3. Check if your Gmail account has any security restrictions"
      );
      console.log("4. Try using a different email provider (Outlook, Yahoo)");
    }
  }
}

testEmail().catch(console.error);
