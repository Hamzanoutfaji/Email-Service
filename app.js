import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;

app.use(express.json());

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.post('/send-email', async (req, res) => {
  console.log("Received POST /send-email");

  try {
    // Get the Base64 SMTP config string from the header
    const smtpBase64 = req.headers['x-smtp-config'];

    if (!smtpBase64) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing SMTP config in headers'
      });
    }

    //  Decode the base64 string
    let smtpConfigJson;
    try {
      const decoded = Buffer.from(smtpBase64, 'base64').toString('utf-8');
      smtpConfigJson = JSON.parse(decoded);
    } catch (err) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to decode or parse SMTP config'
      });
    }

    //  Validate required fields in SMTP config
    const { host, port, secure, user, pass } = smtpConfigJson;
    if (!host || !port || secure === undefined || !user || !pass) {
      return res.status(400).json({
        status: 'error',
        message: ' Incomplete SMTP config'
      });
    }

    //  Create the transporter using decoded SMTP config
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Get the email details from request body
    const { names, subject, emails, message, html } = req.body;

    if (!names || !subject || !emails || !message || !html) {
      return res.status(400).json({
        status: 'error',
        message: ' Missing email content in request body'
      });
    }

    //Prepare email options
    const mailOptions = {
      from: user,
      to: `${names} <${emails}>`,
      replyTo: user,
      subject,
      html,
      text: message
    };

    //  Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent:", info.response);

    return res.status(200).json({
      status: 'success',
      message: ' Email sent successfully'
    });

  } catch (e) {
    console.error(" Error:", e);
    return res.status(500).json({
      status: 'error',
      message: ' Something went wrong on the server.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
