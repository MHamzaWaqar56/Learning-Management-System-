const catchAsyncError = require('../Middlewares/catchAsyncError');
const nodemailer = require('nodemailer');




const Contact = catchAsyncError(async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message)
            return res.status(400).json({ error: 'All fields are required' });

        // console.log("Register PASSWORD :", process.env.SMTP_HOST)

        const transporter = nodemailer.createTransport({
            host: process.env.CONTACT_HOST,
            port: process.env.CONTACT_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_SERVICE,
                pass: process.env.CONTACT_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.ADMIN_CONTACT_EMAIL,
            subject: 'New Contact Form Submission',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px 5px 0 0;">
                        <h1 style="color: #2c3e50; margin: 0;">New Contact Message</h1>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
                        <p style="margin-bottom: 15px;">
                            <strong style="display: inline-block; width: 80px; color: #7f8c8d;">Name:</strong>
                            <span>${name}</span>
                        </p>
                        <p style="margin-bottom: 15px;">
                            <strong style="display: inline-block; width: 80px; color: #7f8c8d;">Email:</strong>
                            <a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a>
                        </p>
                        <div style="margin-bottom: 15px;">
                            <strong style="display: block; margin-bottom: 5px; color: #7f8c8d;">Message:</strong>
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 3px solid #3498db;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px 20px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px; color: #7f8c8d;">
                        <p style="margin: 0;">This message was sent from the contact form on your LMS Website.</p>
                    </div>
                </div>
            `,
        });

        res.status(200).json({ success: 'Message sent successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Message could not be sent. Try again later.' });
    }
});

module.exports = { Contact }