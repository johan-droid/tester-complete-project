const nodemailer = require('nodemailer');

class EmailService {
    static transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    static async sendWelcomeEmail(user) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Welcome to Tester - Your Intelligent Assessment Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3498db;">Welcome to Tester, ${user.name}! 🎉</h2>
                    <p>We're excited to have you onboard our intelligent mock test and evaluation platform.</p>
                    <p>With Tester, you can:</p>
                    <ul>
                        <li>Create and take automated tests</li>
                        <li>Get AI-powered evaluation of handwritten answers</li>
                        <li>Track your performance with detailed analytics</li>
                        <li>Extract questions from PDF documents</li>
                    </ul>
                    <p>Start exploring the features and take your learning to the next level!</p>
                    <br>
                    <p>Best regards,<br>The Tester Team</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }
    }

    static async sendTestResultEmail(user, result) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Test Result: ${result.test.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3498db;">Test Completed: ${result.test.title}</h2>
                    <p>Hello ${user.name},</p>
                    <p>You have successfully completed the test. Here are your results:</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h3>Performance Summary</h3>
                        <p><strong>Score:</strong> ${result.score}/${result.totalMarks}</p>
                        <p><strong>Percentage:</strong> ${result.percentage}%</p>
                        <p><strong>Time Taken:</strong> ${Math.floor(result.timeTaken / 60)} minutes</p>
                    </div>
                    <p>Login to your dashboard to view detailed analysis and recommendations.</p>
                    <br>
                    <p>Keep learning!<br>The Tester Team</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Test result email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending test result email:', error);
        }
    }
}

module.exports = EmailService;