import { Router, Response, Request } from "express";
import { verify } from "hono/jwt";
import { beforeRenderResetPassword, trySendEmailAgain, verifyUserByEmail } from "../controllers/user.controller";

const views = Router()
    .get("/", (req: Request, res: Response) => {
        res.render('register', { title: 'Express with EJS and TypeScript' });
    })

    .get("/update-password-verify", beforeRenderResetPassword)

    .get("/email-verify", (req: Request, res: Response) => {
        return res.render('emailVerification');
    })
    .get("/signup", (req: Request, res: Response) => {
        res.render('register');
    })
    .get("/signin", (req: Request, res: Response) => {
        res.render('login');
    })

    .get("/email-login-verify", verifyUserByEmail)// dari email kesini

    .get("/try-send-email-verify", trySendEmailAgain)// coba send email lagi, ngetrigger -> /email-login-verify lagi

    .get("/profile", (req: Request, res: Response) => {
        res.render('profile');
    })

export default views

