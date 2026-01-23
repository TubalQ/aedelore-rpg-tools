const nodemailer = require('nodemailer');

// SMTP Configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.protonmail.ch';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'Aedelore <noreply@aedelore.nu>';
const APP_URL = process.env.APP_URL || 'https://aedelore.nu';

// Create transporter (lazy initialization)
let transporter = null;

function getTransporter() {
    if (!transporter && SMTP_USER && SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: false, // Use STARTTLS
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            },
            tls: {
                rejectUnauthorized: true
            }
        });
    }
    return transporter;
}

/**
 * Check if email is configured and available
 */
function isEmailConfigured() {
    return !!(SMTP_USER && SMTP_PASS);
}

/**
 * Send password reset email
 * @param {string} toEmail - Recipient email address
 * @param {string} resetToken - The reset token
 * @param {string} username - The username for personalization
 * @returns {Promise<boolean>} - True if email sent successfully
 */
async function sendPasswordResetEmail(toEmail, resetToken, username) {
    const transport = getTransporter();

    if (!transport) {
        console.error('Email not configured - SMTP_USER and SMTP_PASS required');
        return false;
    }

    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: SMTP_FROM,
        to: toEmail,
        subject: 'Password Reset - Aedelore',
        text: `
Hello ${username},

You requested a password reset for your Aedelore account.

Click the link below to reset your password:
${resetUrl}

This link expires in 1 hour.

If you did not request this reset, you can safely ignore this email.

- The Aedelore Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f14;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f14; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: linear-gradient(180deg, #1a1a24 0%, #141419 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                Aedelore
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 20px; color: #ffffff; font-weight: 600;">
                                Password Reset
                            </h2>
                            <p style="margin: 0 0 16px; font-size: 15px; color: #a1a1aa; line-height: 1.6;">
                                Hello <strong style="color: #ffffff;">${username}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; font-size: 15px; color: #a1a1aa; line-height: 1.6;">
                                You requested a password reset for your Aedelore account. Click the button below to set a new password.
                            </p>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 16px 0;">
                                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 24px 0 8px; font-size: 13px; color: #71717a; line-height: 1.5;">
                                This link expires in <strong style="color: #a1a1aa;">1 hour</strong>.
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.5;">
                                If you did not request this reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px 32px; border-top: 1px solid rgba(255,255,255,0.05);">
                            <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                                &copy; ${new Date().getFullYear()} Aedelore &bull; Fantasy RPG Character Management
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Link fallback -->
                <p style="margin: 24px 0 0; font-size: 12px; color: #52525b; text-align: center; max-width: 500px; word-break: break-all;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${resetUrl}" style="color: #a855f7;">${resetUrl}</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim()
    };

    try {
        await transport.sendMail(mailOptions);
        console.log(`Password reset email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send password reset email:', error.message);
        return false;
    }
}

module.exports = {
    sendPasswordResetEmail,
    isEmailConfigured
};
