# Register email Notification using MailChimp

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import os
load_dotenv()


async def sendmail(email: str, firstname: str):
    conf = ConnectionConfig(
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_FROM=os.getenv("EMAIL_HOST_USER"),
    MAIL_SSL_TLS=True,
    MAIL_STARTTLS=False,
    )

    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }
            .email-container {
                background-color: #ffffff;
                max-width: 600px;
                margin: 20px auto;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .email-header {
                background-color: #f67408;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
                color: #333333;
            }
            .email-body h2 {
                color: #f67408;
                font-size: 20px;
            }
            .email-footer {
                background-color: #f1f1f1;
                text-align: center;
                padding: 15px;
                font-size: 14px;
                color: #777777;
            }
            .cta-button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #f67408;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 20px;
            }
            .cta-button:hover {
                background-color: #45a049;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Welcome to Daily Blog!</h1>
            </div>
            <div class="email-body">
                <h2>Hello {{firstname}}!</h2>
                <p>
                    Thank you for joining our community! We’re excited to have you on board. 
                    At <strong>Daily Blog</strong>, we bring you fresh insights, tips, and stories every day.
                </p>
                <p>
                    Get started by exploring our latest articles, connecting with fellow readers, or contributing your own stories.
                </p>
                <a href="#" class="cta-button">Visit Daily Blog</a>
            </div>
            <div class="email-footer">
                <p>&copy; 2024 Daily Blog. All rights reserved.</p>
                <p>
                    <a href="#">Unsubscribe</a> | <a href="#">Contact Us</a>
                </p>
            </div>
        </div>
    </body>
    </html>

    """

    replace_username = template.replace("{{firstname}}", firstname)

    message = MessageSchema(
        subject="Welcome to Our Daily Blog.",
        recipients=[email],
        body=replace_username,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    # print(message)