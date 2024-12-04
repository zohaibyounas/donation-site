const { check, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const Newsletter = require('../models/Newsletter');
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message, mobile } = req.body;

    const submission = new Contact({ name, email, message, mobile });

    try {
      await submission.save();

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
        You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nNumber: ${mobile}\nMessage: ${message}`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send('Form Submitted');
    } catch (error) {
      console.error('Error in form submission or sending email:', error);
      res.status(500).send('Error in form submission or email sending');
    }
  }
);

router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  const newsletter = new Newsletter({ email });

  try {
    await newsletter.save();

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
      subject: 'Email Submission',
      text: `This Email is Sent by Donation Site ICP
      You have a new Newsletter Email submission: ${email}`,
    };

    transporter.sendMail(mailOptions);
    res.status(200).send('Form Submitted');
  } catch (error) {
    console.error('Error in newsletter submission or sending email:', error);
    res.status(500).send('Error in newsletter submission or email sending');
  }
});

module.exports = router;
