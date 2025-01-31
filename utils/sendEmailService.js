import http from 'http';
import createError from 'http-errors';
import nodemailer from 'nodemailer';

const techDetails = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD, // gmail app password
    }
}

const transporter = nodemailer.createTransport(techDetails);

const sendEmailService = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            to,
            from,
            subject,
            text,
            html,
        });
        return {
            success: true,
            message: info.messageId,
        };
    } catch (err) {
        console.error(err);
        return false;
    }
};

const sendEmail = async (to, subject, text, html) => {
    const result = await sendEmailService(to, subject, text, html);
    if (result.success) {
        return true;
    }
    return false;
};

export default sendEmail;