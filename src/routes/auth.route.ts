import express from 'express'
import { userController } from '../controllers'
import { Request, Response } from 'express'
const auth = express.Router()
    .post("/register", 
        userController.registerUserController
    )
    .post("/login", 
        userController.loginUserControllerByEmail
    )
    .get("/who-am-i", 
        userController.whoAmIController
    )

    // .get('/forgot-password-send-email-link', (req: Request, res: Response) => {
    //     res.json({status : true, message : "email sent !"})
    // })

    .post('/forgot-password-send-email-link',
        userController.verifyEmailAndGiveLink
    )

    .post("/forgot-password-send-email-token", 
        userController.verifyEmailAndGiveToken
    )
    .post("/forgot-password-send-email-token/verify",      
        userController.verifyTokenAndLogin
    )
    .post("/update-password",
        userController.updateYourPassword) //password reset dari login

    .post("/reset-password", 
        userController.resetPasswordAsForgotByUser) //password reset dari link

export default auth
