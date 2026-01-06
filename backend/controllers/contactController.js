import Contact from '../models/Contact.js';
import nodemailer from 'nodemailer';

// Create new contact (for xtd form)
export const createContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newContact = new Contact({
            name,
            email,
            message
        });

        await newContact.save();
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all contacts (for Admin panel)
export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ date: -1 }); // Newest first
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get single contact by ID
export const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        res.status(200).json({ success: true, data: contact });
    } catch (error) {
        console.error("Error fetching contact:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update contact status or details
export const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        res.status(200).json({ success: true, data: contact });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete contact
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        res.status(200).json({ success: true, message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Reply to contact (placeholder for now, can be implemented with nodemailer)
export const replyToContact = async (req, res) => {
    try {
        const { message } = req.body;
        console.log(message);

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Reply message is required" });
        }

        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

        // Transporter uses environment variables for credentials
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASS
            }
        });

        // Verify transporter connection (helps surface auth/connectivity errors)
        try {
            await transporter.verify();
        } catch (verifyErr) {
            console.error('Nodemailer verify failed:', verifyErr);
            return res.status(500).json({ success: false, message: 'Email transporter verification failed', error: verifyErr.message });
        }

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: contact.email,
            subject: `Reply from Admin`,
            text: message,
            html: `<div style="font-family: Arial,Helvetica,sans-serif; font-size:14px; color:#222">${message.replace(/\n/g, '<br/>')}</div>`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info);
            res.status(200).json({ success: true, message: 'Reply sent successfully', info });
        } catch (sendErr) {
            console.error('Error sending email:', sendErr);
            return res.status(500).json({ success: false, message: 'Failed to send email', error: sendErr.message });
        }
    } catch (error) {
        console.error("Error replying to contact:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
