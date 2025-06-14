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
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import Application model
const Application = require("./models/Application");
const Admin = require("./models/Admin");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create necessary directories
const uploadsDir = "./uploads";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
async function saveApplicationData(applicationData) {
  try {
    const application = new Application(applicationData);
    await application.save();
    return application;
  } catch (error) {
    console.error("Error saving application:", error);
    throw error;
  }
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
                CISCOTECH Inc</p>
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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Admin login route
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const validPassword = await admin.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create and assign token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create initial admin user if none exists
async function createInitialAdmin() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      });
      await admin.save();
      console.log("Initial admin user created");
    }
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
}

createInitialAdmin();

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
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        position: req.body.position,
        experience: req.body.experience,
        salary: req.body.salary,
        availability: req.body.availability,
        linkedin: req.body.linkedin,
        portfolio: req.body.portfolio,
        source: req.body.source,
        resumeFileName: req.file ? req.file.filename : null,
        coverLetter: req.body.coverLetter,
        timestamp: new Date(),
      };

      // Save to MongoDB
      await saveApplicationData(applicationData);

      // Send email notifications
      if (transporter) {
        try {
          // Send confirmation to applicant
          await transporter.sendMail({
            to: applicationData.email,
            ...emailTemplates.applicantConfirmation(applicationData),
          });

          // Send notification to HR
          await transporter.sendMail({
            to: process.env.HR_EMAIL,
            ...emailTemplates.hrNotification(applicationData),
          });
        } catch (emailError) {
          console.warn("Email sending failed:", emailError.message);
        }
      }

      // Send WhatsApp notification
      await sendWhatsAppNotification(applicationData);

      res.json({
        success: true,
        message: "Application submitted successfully",
        applicationId: applicationId,
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({
        success: false,
        message: "Error submitting application",
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
app.get("/api/applications", authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find().sort({ timestamp: -1 }); // Sort by timestamp, newest first

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

// Get a single application by ID
app.get("/api/applications/:id", authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching application",
    });
  }
});

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

// Contact applicant route
app.post("/api/contact-applicant", authenticateToken, async (req, res) => {
  try {
    const { applicationId, subject, message } = req.body;

    // Find the application
    const application = await Application.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Send email to applicant
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: application.email,
        subject: subject,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                            <h2>Message from HR</h2>
                            <p>${message}</p>
                            <hr>
                            <p><small>This is an automated message. Please do not reply directly to this email.</small></p>
                        </div>
                    </div>
                `,
      });
    }

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error contacting applicant:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
});

// Reject application route
app.post("/api/reject-application", authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.body;

    // Find and update the application
    const application = await Application.findOneAndUpdate(
      { applicationId },
      { status: "rejected" },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Send rejection email to applicant
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: application.email,
        subject: `Application Status Update - ${application.position}`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                            <h2>Application Status Update</h2>
                            <p>Dear ${application.firstName} ${application.lastName},</p>
                            <p>Thank you for your interest in the ${application.position} position at our company.</p>
                            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
                            <p>We appreciate your interest in joining our team and wish you success in your job search.</p>
                            <hr>
                            <p><small>This is an automated message. Please do not reply directly to this email.</small></p>
                        </div>
                    </div>
                `,
      });
    }

    res.json({
      success: true,
      message: "Application rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting application",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
