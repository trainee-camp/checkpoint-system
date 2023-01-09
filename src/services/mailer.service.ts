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

    async send(to: string, subject: string, plain: string) {
        const message = {
            from: this.sender,
            to: to,
            subject: subject,
            text: plain,
        }
        console.log(message)
        await this.transport.sendMail(message)
    }
}

export const mailerService = new Mailer(
    nodemailer.createTransport({
        host: String(process.env.SMTP_SERVER),
        port: Number(process.env.SMTP_SERVER_PORT),
        auth: {
            user: "apikey",
            pass: String(process.env.SENDGRID_API_KEY)
        }
    }),
    `<${String(process.env.SENDGRID_SENDER_EMAIL)}>`)