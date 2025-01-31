const generateVerificationEmailTemplate = (username, otp) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                
                <style>
                    body {
                        font-family: Arial, 
                        sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background-color: #f4f4f4;
                        color: #333;
                    }
                    .container { 
                        max-width: 600px;
                        margin: 20px auto; background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        border: 2px solid gray;
                    }
                    .header h1 {
                        color: #4CAF50;
                        text-align: center;
                    }
                    .content {
                        text-align: center;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .otp {
                        font-size: 24px;
                        font-weight: bold;
                        color: #4CAF50;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        font-size: 14px;
                        color: #777;
                        margin-top: 20px;
                    }
                    .footer p .trademark {
                        font-size: 10px;
                    }
                </style>
            </head>
            
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email Address</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${username}. Thank you for registering with ClassyShop. Please use the OTP below to verify your account.
                        <div class="otp">${otp}</div>
                        <em>If you didn't create an account, you can safely ignore this email.</em>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 ClassyShop<sup class="trademark">TM</sup>. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};

export {
    generateVerificationEmailTemplate,
};