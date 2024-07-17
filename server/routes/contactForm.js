const { check, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const router = require('express').Router();
require('dotenv').config();

router.post(
  '/submit',
  [
    check('name', 'Full name is required').not().isEmpty(),
    check('email', 'Invalid email address').isEmail(),
    check('mobile', 'Invalid mobile number').matches(/^[0-9]{11}$/),
    check('message', 'Message is required').not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message, mobile } = req.body;

    const submission = new Contact({
      name,
      email,
      message,
      mobile,
    });

    try {
      submission.save();
      res.status(200).send('Form Submitted');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD,
        },
      });

      const mailOptions = {
        to: process.env.EMAIL,
        from: {
          name: 'Donation Site ICP',
          email: 'cs@icp.edu.pk',
        },
        subject: 'Form Submission',
        text: `This Email is Sent by Donation Site ICP
        You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      };

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.error('Error in sending email:', err); // Log detailed error
          return res.status(500).send('Error in sending email');
        }
        console.log('Email sent successfully to:', process.env.EMAIL);
        res.status(200).send('Recovery email sent');
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

module.exports = router;
