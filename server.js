const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Google OAuth Client
const client = new OAuth2Client("506317870201-dmijf1kredosu9cejs3754slfh2gt086.apps.googleusercontent.com");

// reCAPTCHA secret key
const RECAPTCHA_SECRET = "6Ldb3tgrAAAAAARDCU6DtyM40fcm_U_II2ouFb2I";

// ✅ Google login verification
app.post("/google-login", async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: "506317870201-dmijf1kredosu9cejs3754slfh2gt086.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    res.json({ success: true, user: payload });
  } catch (err) {
    res.json({ success: false, message: "Invalid Google token" });
  }
});

// ✅ reCAPTCHA verification
app.post("/verify", async (req, res) => {
  const response = req.body["g-recaptcha-response"];
  if (!response) {
    return res.send("❌ reCAPTCHA missing");
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${response}`;

  try {
    const googleRes = await fetch(verifyUrl, { method: "POST" });
    const data = await googleRes.json();

    if (data.success) {
      res.send("✅ Human verified successfully!");
    } else {
      res.send("❌ Verification failed. You might be a robot!");
    }
  } catch (err) {
    res.send("⚠️ Error verifying reCAPTCHA");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
