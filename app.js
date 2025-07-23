import express from "express";
import cors from "cors"
import nodemailer from "nodemailer"
import dotenv from 'dotenv'

dotenv.config()

const app = express();

const PORT = 3000
app.use(express.json());
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions))

const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORT,
    secure: process.env.SECURE,
    auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }

})
app.post('/send-email', async (req, res) => {
    console.log("Received POST /send-email");
    try {
        const { names, subject, emails, message, html } = req.body;

        if (!names || !subject || !emails || !message || !html) {
            return res.status(400).json({ status: 'error', message: 'missing info' })
        }

        const mailOptions = {
            from: process.env.USER,
            to: `${names} <${emails}>`,
            replyTo: process.env.USER,
            subject: subject,
            html: html,
            text: message
        }

        const info = await transporter.sendMail(mailOptions);

        console.log("email sent", info.response);
        res.status(200).json({ status: 'success', message: 'email sent successfully' })

    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 'error', message: 'Error sending email, please try again.' });
    }
})

app.listen(PORT, () => {
    console.log('app listening on port ', PORT)
})