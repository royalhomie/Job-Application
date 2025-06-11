// Load environment variables
require("dotenv").config();

// server.js - Main server file
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create necessary directories
const uploadsDir = "./uploads";
const applicationsDir = "./applications";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(applicationsDir)) {
  fs.mkdirSync(applicationsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed!"));
    }
  },
});

// Email configuration - only create transporter if credentials are provided
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    // Try Gmail with SSL first (port 465) since it's more reliable
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify the connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.warn("Gmail SSL (port 465) failed:", error.message);
        console.log("Trying Gmail TLS (port 587)...");

        // Try Gmail with TLS (port 587) as fallback
        transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        });

        // Verify TLS connection
        transporter.verify(function (tlsError, tlsSuccess) {
          if (tlsError) {
            console.warn("Gmail TLS (port 587) also failed:", tlsError.message);
            console.log(
              "Email notifications will be disabled. Applications will still be saved."
            );
            transporter = null;
          } else {
            console.log("Email server is ready to send messages (TLS)");
          }
        });
      } else {
        console.log("Email server is ready to send messages (SSL)");
      }
    });
  } catch (error) {
    console.warn("Failed to create email transporter:", error.message);
    console.log(
      "Email notifications will be disabled. Applications will still be saved."
    );
    transporter = null;
  }
} else {
  console.log(
    "Email credentials not provided. Email notifications will be disabled."
  );
}

// Utility function to send WhatsApp notification
async function sendWhatsAppNotification(applicationData) {
  try {
    // Check if WhatsApp is configured
    if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_PHONE_NUMBER) {
      console.log(
        "WhatsApp notifications not configured. Skipping WhatsApp notification."
      );
      return;
    }

    // Create WhatsApp message
    const message = `📋 *New Job Application Received*

*Application ID:* ${applicationData.applicationId}
*Name:* ${applicationData.firstName} ${applicationData.lastName}
*Position:* ${applicationData.position}
*Email:* ${applicationData.email}
*Phone:* ${applicationData.phone}
*Experience:* ${applicationData.experience}
*Expected Salary:* ${applicationData.salary}
*Availability:* ${applicationData.availability}

*Cover Letter Preview:*
${applicationData.coverLetter.substring(0, 200)}${
      applicationData.coverLetter.length > 200 ? "..." : ""
    }

*Submitted:* ${new Date(applicationData.timestamp).toLocaleString()}

View full application at: http://localhost:3000/admin.html`;

    // Using CallMeBot API - correct format
    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER.replace("+", ""); // Remove + for CallMeBot
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}&apikey=${process.env.WHATSAPP_API_KEY}`;

    // Send WhatsApp message via GET request
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 200) {
            console.log(
              `WhatsApp notification sent successfully for application: ${applicationData.applicationId}`
            );
          } else {
            console.warn(
              `WhatsApp notification failed for application ${applicationData.applicationId}. Status: ${res.statusCode}, Response: ${data}`
            );
          }
        });
      })
      .on("error", (error) => {
        console.warn(
          `WhatsApp notification failed for application ${applicationData.applicationId}:`,
          error.message
        );
      });
  } catch (error) {
    console.warn(
      `WhatsApp notification error for application ${applicationData.applicationId}:`,
      error.message
    );
  }
}

// Utility function to generate application ID
function generateApplicationId() {
  return (
    "APP-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substr(2, 9).toUpperCase()
  );
}

// Utility function to save application data
function saveApplicationData(applicationData) {
  const fileName = `application_${applicationData.applicationId}.txt`;
  const filePath = path.join(applicationsDir, fileName);

  const textData = `
APPLICATION SUBMISSION
=====================
Application ID: ${applicationData.applicationId}
Timestamp: ${applicationData.timestamp}
Name: ${applicationData.firstName} ${applicationData.lastName}
Email: ${applicationData.email}
Phone: ${applicationData.phone}
Address: ${applicationData.address}
Position: ${applicationData.position}
Experience: ${applicationData.experience}
Expected Salary: ${applicationData.salary}
Start Date: ${applicationData.availability}
LinkedIn: ${applicationData.linkedin}
Portfolio: ${applicationData.portfolio}
Source: ${applicationData.source}
Resume File: ${applicationData.resumeFileName}

Cover Letter:
${applicationData.coverLetter}

=====================
    `.trim();

  fs.writeFileSync(filePath, textData);
  return fileName;
}

// Email templates
const emailTemplates = {
  applicantConfirmation: (applicationData) => ({
    subject: `Application Received - ${applicationData.position} Position`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h1>🎉 Application Received Successfully!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Dear ${applicationData.firstName} ${
      applicationData.lastName
    },</p>
                
                <p>Thank you for your interest in the <strong>${
                  applicationData.position
                }</strong> position at our company. We have successfully received your application.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                    <h3>Application Details:</h3>
                    <p><strong>Application ID:</strong> ${
                      applicationData.applicationId
                    }</p>
                    <p><strong>Position:</strong> ${
                      applicationData.position
                    }</p>
                    <p><strong>Submitted:</strong> ${new Date(
                      applicationData.timestamp
                    ).toLocaleString()}</p>
                </div>
                
                <p>Our hiring team is currently reviewing applications, and we will contact qualified candidates within 24-48 hours. Due to the high volume of applications we receive, we ask for your patience during this process.</p>
                
                <p>If you have any questions, please don't hesitate to contact our HR department.</p>
                
                <p>Thank you once again for your interest in joining our team!</p>
                
                <p>Best regards,<br>
                <strong>HR Team</strong><br>
                Your Company Name</p>
            </div>
        </div>
        `,
  }),

  hrNotification: (applicationData) => ({
    subject: `New Job Application - ${applicationData.position} - ${applicationData.firstName} ${applicationData.lastName}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #28a745; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h2>📋 New Job Application Received</h2>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h3>Applicant Information:</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background: white;">
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Application ID:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.applicationId
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Name:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.firstName
                        } ${applicationData.lastName}</td>
                    </tr>
                    <tr style="background: white;">
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Email:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.email
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Phone:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.phone
                        }</td>
                    </tr>
                    <tr style="background: white;">
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Position:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.position
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Experience:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.experience
                        }</td>
                    </tr>
                    <tr style="background: white;">
                        <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Expected Salary:</td>
                        <td style="padding: 10px; border: 1px solid #dee2e6;">${
                          applicationData.salary
                        }</td>
                    </tr>
                </table>
                
                ${
                  applicationData.coverLetter
                    ? `
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4>Cover Letter:</h4>
                    <p style="white-space: pre-wrap;">${applicationData.coverLetter}</p>
                </div>
                `
                    : ""
                }
                
                <p><strong>Resume:</strong> ${
                  applicationData.resumeFileName
                }</p>
                <p><strong>LinkedIn:</strong> ${
                  applicationData.linkedin || "Not provided"
                }</p>
                <p><strong>Portfolio:</strong> ${
                  applicationData.portfolio || "Not provided"
                }</p>
                <p><strong>How they heard about us:</strong> ${
                  applicationData.source || "Not specified"
                }</p>
                
                <p><em>Application submitted on: ${new Date(
                  applicationData.timestamp
                ).toLocaleString()}</em></p>
            </div>
        </div>
        `,
  }),
};

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Application submission endpoint
app.post(
  "/api/submit-application",
  upload.single("resume"),
  async (req, res) => {
    try {
      // Generate application ID
      const applicationId = generateApplicationId();

      // Prepare application data
      const applicationData = {
        applicationId,
        timestamp: new Date().toISOString(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address || "",
        position: req.body.position,
        experience: req.body.experience || "",
        salary: req.body.salary || "",
        availability: req.body.availability || "",
        coverLetter: req.body.coverLetter || "",
        linkedin: req.body.linkedin || "",
        portfolio: req.body.portfolio || "",
        source: req.body.source || "",
        resumeFileName: req.file ? req.file.filename : "No file uploaded",
        resumeOriginalName: req.file
          ? req.file.originalname
          : "No file uploaded",
      };

      // Save application data to text file
      const savedFileName = saveApplicationData(applicationData);

      // Try to send emails (optional - won't fail the application if email fails)
      try {
        // Send confirmation email to applicant
        if (transporter) {
          const applicantEmail =
            emailTemplates.applicantConfirmation(applicationData);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: applicationData.email,
            subject: applicantEmail.subject,
            html: applicantEmail.html,
          });

          // Send notification email to HR
          const hrEmail = emailTemplates.hrNotification(applicationData);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.HR_EMAIL || process.env.EMAIL_USER,
            subject: hrEmail.subject,
            html: hrEmail.html,
            attachments: req.file
              ? [
                  {
                    filename: applicationData.resumeOriginalName,
                    path: req.file.path,
                  },
                ]
              : [],
          });

          console.log(
            `Emails sent successfully for application: ${applicationId}`
          );
        } else {
          console.log(
            `Email transporter not available. Skipping email notifications for application: ${applicationId}`
          );
        }
      } catch (emailError) {
        console.warn(
          `Email sending failed for application ${applicationId}:`,
          emailError.message
        );
        // Don't fail the application submission if email fails
      }

      // Send WhatsApp notification
      await sendWhatsAppNotification(applicationData);

      // Log application
      console.log(
        `New application received: ${applicationId} - ${applicationData.firstName} ${applicationData.lastName}`
      );

      res.json({
        success: true,
        message: "Application submitted successfully!",
        applicationId: applicationId,
      });
    } catch (error) {
      console.error("Error processing application:", error);
      res.status(500).json({
        success: false,
        message:
          "An error occurred while processing your application. Please try again.",
      });
    }
  }
);

// Get application status endpoint
app.get("/api/application-status/:id", (req, res) => {
  const applicationId = req.params.id;
  const filePath = path.join(
    applicationsDir,
    `application_${applicationId}.txt`
  );

  if (fs.existsSync(filePath)) {
    res.json({
      success: true,
      status: "received",
      message: "Your application is being reviewed by our team.",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Application not found.",
    });
  }
});

// Get all applications for admin dashboard
app.get("/api/applications", (req, res) => {
  try {
    const applications = [];

    // Read all application files from the applications directory
    if (fs.existsSync(applicationsDir)) {
      const files = fs.readdirSync(applicationsDir);

      files.forEach((file) => {
        if (file.endsWith(".txt")) {
          const filePath = path.join(applicationsDir, file);
          const content = fs.readFileSync(filePath, "utf8");

          // Parse the application data from the text file
          const applicationData = parseApplicationFile(content);
          if (applicationData) {
            applications.push(applicationData);
          }
        }
      });
    }

    // Sort applications by timestamp (newest first)
    applications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      applications: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
    });
  }
});

// Utility function to parse application file content
function parseApplicationFile(content) {
  try {
    const lines = content.split("\n");
    const application = {};

    lines.forEach((line) => {
      if (line.includes("Application ID:")) {
        application.id = line.split("Application ID:")[1].trim();
      } else if (line.includes("Timestamp:")) {
        application.timestamp = line.split("Timestamp:")[1].trim();
      } else if (line.includes("Name:")) {
        const name = line.split("Name:")[1].trim();
        const nameParts = name.split(" ");
        application.firstName = nameParts[0] || "";
        application.lastName = nameParts.slice(1).join(" ") || "";
      } else if (line.includes("Email:")) {
        application.email = line.split("Email:")[1].trim();
      } else if (line.includes("Phone:")) {
        application.phone = line.split("Phone:")[1].trim();
      } else if (line.includes("Position:")) {
        application.position = line.split("Position:")[1].trim();
      } else if (line.includes("Experience:")) {
        application.experience = line.split("Experience:")[1].trim();
      } else if (line.includes("Expected Salary:")) {
        application.salary = line.split("Expected Salary:")[1].trim();
      } else if (line.includes("Start Date:")) {
        application.availability = line.split("Start Date:")[1].trim();
      } else if (line.includes("LinkedIn:")) {
        application.linkedin = line.split("LinkedIn:")[1].trim();
      } else if (line.includes("Portfolio:")) {
        application.portfolio = line.split("Portfolio:")[1].trim();
      } else if (line.includes("Source:")) {
        application.source = line.split("Source:")[1].trim();
      } else if (line.includes("Resume File:")) {
        application.resumeFile = line.split("Resume File:")[1].trim();
      } else if (line.includes("Cover Letter:")) {
        // Get everything after "Cover Letter:" until the end
        const coverLetterIndex = content.indexOf("Cover Letter:");
        if (coverLetterIndex !== -1) {
          application.coverLetter = content
            .substring(coverLetterIndex + "Cover Letter:".length)
            .trim();
        }
      }
    });

    // Add default status (all applications start as 'new')
    application.status = "new";
    application.submittedAt = application.timestamp;

    return application;
  } catch (error) {
    console.error("Error parsing application file:", error);
    return null;
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }

  if (error.message.includes("Only PDF, DOC, and DOCX files are allowed!")) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only PDF, DOC, and DOCX files are allowed.",
    });
  }

  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
