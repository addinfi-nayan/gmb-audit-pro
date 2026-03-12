import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { to, subject, body, attachment } = await request.json();

        // Validate required fields
        if (!to || !subject || !body) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, body' },
                { status: 400 }
            );
        }

        // Option 1: Use Resend (Recommended for production)
        // You'll need to install: npm install resend
        // And set up your Resend API key in environment variables
        if (process.env.RESEND_API_KEY) {
            const Resend = require('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            const emailData: any = {
                from: 'noreply@whatmyrank.com', // Your verified domain
                to: [to],
                subject: subject,
                html: body,
            };

            // Add attachment if provided
            if (attachment) {
                emailData.attachments = [{
                    filename: attachment.filename,
                    content: attachment.content,
                    type: attachment.contentType,
                }];
            }

            const { data, error } = await resend.emails.send(emailData);

            if (error) {
                console.error('Resend error:', error);
                return NextResponse.json(
                    { error: 'Failed to send email via Resend' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, data });
        }

        // Option 2: Use Nodemailer with Gmail (Alternative)
        // You'll need to install: npm install nodemailer
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            const nodemailer = require('nodemailer');

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            const mailOptions: any = {
                from: process.env.GMAIL_USER,
                to: to,
                subject: subject,
                html: body,
            };

            // Add attachment if provided
            if (attachment) {
                mailOptions.attachments = [{
                    filename: attachment.filename,
                    content: Buffer.from(attachment.content, 'base64'),
                    contentType: attachment.contentType,
                }];
            }

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);

            return NextResponse.json({ success: true, messageId: info.messageId });
        }

        // Option 3: Use a webhook to your existing email service
        // This sends the email data to your n8n webhook
        const webhookUrl = "https://n8n-pro-775604255858.asia-south1.run.app/webhook/send-pdf-email";
        
        const webhookPayload = {
            to,
            subject,
            body,
            attachment,
            timestamp: new Date().toISOString(),
        };

        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
        });

        if (webhookResponse.ok) {
            return NextResponse.json({ success: true, message: 'Email sent via webhook' });
        } else {
            console.error('Webhook error:', webhookResponse.statusText);
            return NextResponse.json(
                { error: 'Failed to send email via webhook' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Email API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
