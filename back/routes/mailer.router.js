// routes/subscribe.routes.js
import express from "express";
import User from "../models/usermodel.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    req.user.subscribed = true;
    await req.user.save();
    res.status(200).json({ message: "Subscription successful" });
  } catch (error) {
    console.error("Subscription failed:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vbhargav0310@gmail.com",
      pass: "elsvmuakmltbikfn", // app password
    },
  });
  
  router.post("/send-email", async (req, res) => {
    if (!req.user || req.user.subscribed !== true) {
      return res.status(401).json({ message: "Not authorized to receive email" });
    }
  
    try {
      const to = req.user.email;
      const subject = "Welcome to AI Register";
      const text = "Thank you for joining AI register";
  
      const info = await transporter.sendMail({
        from: '"vaibhav bhargav" <vbhargav0310@gmail.com>',
        to,
        subject,
        text,
      });
  
      res.status(200).json({ message: "Email sent", info });
    } catch (err) {
      console.error("Error sending email:", err);
      res.status(500).json({ message: "Failed to send email", error: err });
    }
  });



export default router;
