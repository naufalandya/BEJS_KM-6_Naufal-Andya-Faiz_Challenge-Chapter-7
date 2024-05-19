import nodemailer from "nodemailer";

const SERVER_HOST =  String(Bun.env.SERVER_HOST)
const SERVER_EMAIL = String(Bun.env.SERVER_EMAIL)
const SERVER_PASSWORD = String(Bun.env.SERVER_PASS)

export const transporter = nodemailer.createTransport({
    host: SERVER_HOST,
    port: 587,
    auth: {
        user: SERVER_EMAIL,
        pass: SERVER_PASSWORD
    },
});