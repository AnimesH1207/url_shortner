
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const Url = require("./models/url");

const generateShortCode = require("./utils/generateShortCode");
const validateUrl = require("./utils/validateUrl");


// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================



app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);


// Parse JSON request body
app.use(express.json());


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log("MongoDB connected");
  })

  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {

  return res.status(200).json({
    success: true,
    message: "Server is running",
  });

});


// ==========================================
// CREATE SHORT URL
//
// POST /api/url/shorten
// ==========================================

app.post(
  "/api/url/shorten",
  async (req, res) => {

    try {

      // --------------------------------------
      // Get original URL
      // --------------------------------------

      const { originalUrl } = req.body;


      // --------------------------------------
      // Check URL exists
      // --------------------------------------

      if (!originalUrl) {

        return res.status(400).json({
          success: false,
          message: "URL is required",
        });

      }


      // --------------------------------------
      // Validate URL
      // --------------------------------------

      if (!validateUrl(originalUrl)) {

        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL",
        });

      }


      // --------------------------------------
      // Generate unique short code
      // --------------------------------------

      let shortCode;

      let existingUrl;


      do {

        shortCode = generateShortCode();

        existingUrl = await Url.findOne({
          shortCode,
        });

      } while (existingUrl);


      // --------------------------------------
      // Save URL to MongoDB
      // --------------------------------------

      const newUrl = await Url.create({

        originalUrl:
          originalUrl.trim(),

        shortCode,

      });


      // --------------------------------------
      // Create short URL
      // --------------------------------------

      const shortUrl =
        `${process.env.BACKEND_URL}/s/${shortCode}`;


      // --------------------------------------
      // Send response
      // --------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "URL shortened successfully",

        data: {

          originalUrl:
            newUrl.originalUrl,

          shortCode:
            newUrl.shortCode,

          shortUrl,

        },

      });

    } catch (error) {

      console.error(
        "Create URL error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Internal server error",

      });

    }

  }
);


// ==========================================
// REDIRECT TO ORIGINAL URL
//
// GET /s/:shortCode
// ==========================================

app.get("/s/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) {
      return res.status(404).send(
        "Short URL not found"
      );
    }

    return res.redirect(url.originalUrl);

  } catch (error) {
    console.error(
      "Redirect error:",
      error
    );

    return res.status(500).send(
      "Internal server error"
    );
  }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);
