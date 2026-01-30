const sendEmail = require('../utils/sendEmail');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Send email to the admin (owner)
        // The admin can reply to this email because we set the 'replyTo' to the user's email
        const emailOptions = {
            email: process.env.FROM_EMAIL, // Send TO the admin
            subject: `New Contact Form Submission: ${subject}`,
            replyTo: email, // This allows the admin to just hit "Reply" in their email client
            message: `You have received a new message from your website contact form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        await sendEmail(emailOptions);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending message. Please try again later.'
        });
    }
};
