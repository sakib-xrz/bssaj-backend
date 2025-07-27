"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgencyApprovalEmailTemplate = void 0;
const config_1 = __importDefault(require("../config"));
const createAgencyApprovalEmailTemplate = (agencyName, directorName, email, password) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agency Approval Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 40px 30px;
            }
            .welcome-message {
                background: #f8f9fa;
                border-left: 4px solid #28a745;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .credentials-box {
                background: #e9ecef;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                text-align: center;
            }
            .credentials-box h3 {
                color: #495057;
                margin-top: 0;
                margin-bottom: 20px;
            }
            .credential-item {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #ced4da;
            }
            .credential-label {
                font-weight: bold;
                color: #6c757d;
                display: block;
                margin-bottom: 5px;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                font-size: 16px;
                color: #212529;
                word-break: break-all;
            }
            .instructions {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .instructions h3 {
                color: #856404;
                margin-top: 0;
            }
            .instructions ul {
                margin: 15px 0;
                padding-left: 20px;
            }
            .instructions li {
                margin: 8px 0;
                color: #856404;
            }
            .security-notice {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #721c24;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 20px 0;
                font-weight: bold;
                text-align: center;
            }
            .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                color: #6c757d;
                border-top: 1px solid #dee2e6;
            }
            .footer p {
                margin: 5px 0;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Congratulations!</h1>
                <p>Your Agency Registration has been Approved</p>
            </div>
            
            <div class="content">
                <div class="welcome-message">
                    <h2>Welcome to BSSAJ, ${directorName}!</h2>
                    <p>We are delighted to inform you that <strong>${agencyName}</strong> has been successfully approved and is now an official partner of the Bangladesh Software, System & Service Advancement Foundation (BSSAJ).</p>
                </div>

                <p>Your agency profile is now active and you can access all the benefits and features available to our registered agencies.</p>

                <div class="credentials-box">
                    <h3>🔐 Your Login Credentials</h3>
                    <div class="credential-item">
                        <span class="credential-label">Email:</span>
                        <span class="credential-value">${email}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Temporary Password:</span>
                        <span class="credential-value">${password}</span>
                    </div>
                </div>

                <div class="security-notice">
                    <strong>⚠️ Important Security Notice:</strong> This is a temporary password generated for your initial login. For security reasons, you will be required to change this password immediately after your first login.
                </div>

                <div class="instructions">
                    <h3>📋 Next Steps</h3>
                    <ul>
                        <li><strong>Login:</strong> Use the credentials above to log into your agency dashboard</li>
                        <li><strong>Change Password:</strong> Immediately update your password to something secure and memorable</li>
                        <li><strong>Complete Profile:</strong> Review and complete your agency profile information</li>
                        <li><strong>Explore Features:</strong> Discover all the tools and resources available to your agency</li>
                        <li><strong>Upload Content:</strong> Start showcasing your success stories and services</li>
                    </ul>
                </div>

                <div style="text-align: center;">
                    <a href="${config_1.default.frontend_base_url}/login" class="button">Login to Your Dashboard</a>
                </div>

                <h3>🌟 What's Next?</h3>
                <p>As an approved agency, you now have access to:</p>
                <ul>
                    <li>Agency dashboard with analytics and management tools</li>
                    <li>Ability to showcase your portfolio and success stories</li>
                    <li>Access to BSSAJ's network of opportunities</li>
                    <li>Participation in industry events and initiatives</li>
                    <li>Priority support from our team</li>
                </ul>

                <p>If you have any questions or need assistance, please don't hesitate to contact our support team. We're here to help you make the most of your partnership with BSSAJ.</p>

                <p><strong>Welcome aboard, and congratulations once again!</strong></p>
            </div>

            <div class="footer">
                <div class="logo">BSSAJ</div>
                <p><strong>Bangladesh Software, System & Service Advancement Foundation</strong></p>
                <p>Email: info@bssaj.org | Website: www.bssaj.org</p>
                <p>This email was sent automatically. Please do not reply to this email.</p>
                <p><small>If you have any questions, please contact our support team.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};
exports.createAgencyApprovalEmailTemplate = createAgencyApprovalEmailTemplate;
