import nodemailer from "nodemailer"
import {config} from "dotenv";

config()

class Mailer {
    transport: any
    sender: string

    constructor(transport: any, sender: string) {
        this.transport = transport
        this.sender = sender
    }

    async send(to: string, subject: string, plain: string, html?: string) {
        await this.transport.sendMail({
            from: this.sender,
            to: to,
            subject: subject,
            text: plain,
            html: html ? html : undefined
        })
    }
}

export const mailerService = new Mailer(nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_AUTH,
        pass: process.env.GMAIL_PASS
    }
}), "Someone")