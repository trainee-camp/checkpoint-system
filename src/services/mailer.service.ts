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
        const message = {
            from: this.sender,
            to: to,
            subject: subject,
            text: plain,
            html: html ? html : undefined
        }
        console.log(message)
        await this.transport.sendMail(message)
    }
}

export const mailerService = new Mailer(nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
}), `<${String(process.env.SENDGRID_SENDER_EMAIL)}>`)