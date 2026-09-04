import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface EmailRequest {
    to: string;
    subject: string;
    body: string;
    attachment?: {
        filename: string;
        content: string; // base64
        contentType: string;
    };
    // Alternative to `attachment` for large files (e.g. a full-report PDF) — the file
    // is fetched server-to-server instead of riding in this request's JSON body, which
    // Vercel caps at ~4.5MB.
    attachFromUrl?: string;
    attachmentFilename?: string;
}

async function resolveAttachment(email: EmailRequest): Promise<EmailRequest["attachment"]> {
    if (email.attachment) return email.attachment;
    if (!email.attachFromUrl) return undefined;

    const res = await fetch(email.attachFromUrl);
    if (!res.ok) throw new Error(`Failed to fetch attachment from URL: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
        filename: email.attachmentFilename || "attachment.pdf",
        content: buffer.toString("base64"),
        contentType: res.headers.get("content-type") || "application/pdf",
    };
}

async function sendViaResend(email: EmailRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'WhatMyRank <onboarding@resend.dev>',
        to: [email.to],
        subject: email.subject,
        html: email.body,
        attachments: email.attachment
            ? [{ filename: email.attachment.filename, content: email.attachment.content }]
            : undefined,
    });

    if (error) throw new Error(error.message);
}

function getNodemailerTransporter() {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    return null;
}

async function sendViaNodemailer(email: EmailRequest) {
    const transporter = getNodemailerTransporter();
    if (!transporter) return false;

    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.GMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email.to,
        subject: email.subject,
        html: email.body,
    };

    if (email.attachment) {
        mailOptions.attachments = [{
            filename: email.attachment.filename,
            content: Buffer.from(email.attachment.content, 'base64'),
            contentType: email.attachment.contentType,
        }];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via Nodemailer:', info.messageId);
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const email: EmailRequest = await request.json();

        if (!email.to || !email.subject || !email.body) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, body' },
                { status: 400 }
            );
        }

        // Normalize attachFromUrl into `attachment` once, up front, so both send
        // paths below can stay agnostic to how the attachment arrived.
        if (email.attachFromUrl) {
            try {
                email.attachment = await resolveAttachment(email);
            } catch (e: any) {
                console.error('Failed to resolve email attachment:', e.message);
            }
        }

        // Resend is the preferred path — simplest to set up, best deliverability.
        if (process.env.RESEND_API_KEY) {
            await sendViaResend(email);
            return NextResponse.json({ success: true, provider: 'resend' });
        }

        // Falls back to Gmail (app password) or generic SMTP if Resend isn't configured.
        const sent = await sendViaNodemailer(email);
        if (sent) {
            return NextResponse.json({ success: true, provider: 'nodemailer' });
        }

        console.error('Email is not configured: set RESEND_API_KEY, or GMAIL_USER + GMAIL_APP_PASSWORD, or SMTP_HOST + SMTP_USER + SMTP_PASS.');
        return NextResponse.json(
            { error: 'Email service is not configured on the server.' },
            { status: 500 }
        );
    } catch (error: any) {
        console.error('Email API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
