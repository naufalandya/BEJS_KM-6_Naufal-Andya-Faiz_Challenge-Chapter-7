import { checkUserByEmail, createUser, getUserByEmail } from "../models/user.model";
import { errorWithStatusCode } from "../middlewares/errorHandler";
import { decode, sign, verify } from 'hono/jwt'
import { prisma } from "../libs";
import { transporter } from "../libs/mailer.lib";
import { Request, Response } from "express";
import { JwtTokenInvalid } from "hono/utils/jwt/types";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

const SERVER_EMAIL = String(Bun.env.SERVER_EMAIL)

const SECRET = String(Bun.env.JWT_SECRET)

export const registerUserController = async function(req : Request, res : Response) {
    try {
        const {email, password} = await req.body
        
        const isExist = await checkUserByEmail(email)

        if(isExist) {
            return res.json({
                status : false,
                message : `User with email ${email} already exist`
            }).status(409)
        }

        const hashed = await Bun.password.hash(password)

        const result : UserPayload = await createUser(email, hashed)

        const payload = {
            id : result.id,
            email : result.email,
            createdAt : result.createdAt
        }

        const token = await sign(payload, SECRET)
        let url = `${req.protocol}://${req.get('host')}/email-login-verify?token=${token}`;

        await transporter.sendMail({
            from: SERVER_EMAIL,
            to: `${email}`, 
            subject: "Welcome to Andya Website",
            html: `
                <html>
                    <head>
                        <style>
                            /* CSS untuk styling */
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                color: #333;
                                text-align: center;
                            }
                            p {
                                color: #666;
                            }
                            .verification-token {
                                background-color: #007bff;
                                color: #fff;
                                padding: 10px;
                                border-radius: 5px;
                                text-align: center;
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Welcome to Andya Website</h1>
                            <p>Congratulations! You've successfully registered on Andya Website.</p>
                            <p>Click The Button Below To Verify Your Email. And then Sign In</p>
                            <p>Explore and enjoy the features of our platform.</p>
                            <div class="verification-link">
                                <a href="${url}" target="_blank">Verify</a>
                            </div>
                        </div>
                    </body>
                </html>
            `,
        })
        

        return res.json({
            status : true,
            message : `Success`,
            data : result
        }).status(201)



    } catch (err) {
        if (err instanceof errorWithStatusCode) {
            return res.json({
                status: false,
                message: err.message
            }).status(err.statusCode)
        }
        
        throw err
    }
} 

export const loginUserControllerByEmail = async function(req : Request, res : Response) {
    try {
        const {email, password} = await req.body

        const isExist = await getUserByEmail(email)

        if(!isExist) {
            return res.json({
                status : false,
                message : `User with email ${email} is not exist`
            }).status(404)
        }

        const verify = await Bun.password.verify(password, isExist.password)

        if(!verify){
            return res.json({
                status : false,
                message : 'Password is not match !'
            }).status(401)
        }

        const payload = {
            id : isExist.id,
            email : isExist.email,
            createdAt : isExist.createdAt,
            isVerified : isExist.isVerified
        }

        const token = await sign(payload, SECRET)

        return res.json({
            status : true,
            message : 'success',
            data : {...payload, token}
        })

    } catch (err) {
        if (err instanceof errorWithStatusCode) {
            return res.json({
                status: false,
                message: err.message
            }).status(err.statusCode)
        }
        
        throw err
    }
}

export const whoAmIController = async function(req : Request, res : Response) {

    try {
        const { authorization } = req.headers

        console.log(authorization)

        if (!authorization || !authorization.split(' ')[1]) {
            return res.json({
                status: false,
                message: 'token not provided!',
                data: null
            }).status(401);
        }

        let token = authorization.split(' ')[1];

        const decodedPayload = await verify(token, SECRET)

        return res.json({
            status : true,
            message : 'success',
            data : decodedPayload
        })

    } catch (err) {
        throw err
    }
}

const randomVerification = async function(length : number){
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const verifyEmailAndGiveToken = async function(req : Request, res : Response) {

    try {
        const {email} = await req.body

        const isExist = await getUserByEmail(email)
    
        const token = await randomVerification(8)
    
        const staticToken = await prisma.user.update({
            where : {
                id : isExist.id
            }, 

            data : {
                verificationToken : token
            }
        })

        const data = await transporter.sendMail({
            from: SERVER_EMAIL,
            to: "andyakuliah@gmail.com", //`${email}`
            subject: "Email Verification",
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                color: #333;
                                text-align: center;
                            }
                            p {
                                color: #666;
                            }
                            .verification-token {
                                background-color: #007bff;
                                color: #fff;
                                padding: 10px;
                                border-radius: 5px;
                                text-align: center;
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Email Verification</h1>
                            <p>Please don't share this token with anyone.</p>
                            <p>Token will expire in 10 minutes.</p>
                            <p>Your verification token:</p>
                            <div class="verification-token">${staticToken.verificationToken}</div>
                        </div>
                    </body>
                </html>
            `,
        })
        

        return res.json({
            status : true,
            message : "We sent token verification to your email !",
            data : data
        })

    } catch (err) {
        if (err instanceof errorWithStatusCode) {
            return res.json({
                status: false,
                message: err.message
            }).status(err.statusCode)
        }
        
        throw err
    }
}

export const verifyTokenAndLogin = async function(req : Request, res : Response) {
    const { email, inputToken } = await req.body

    const user = await prisma.user.findUnique({
        where : {
            email : email
        }
    })

    if(!user) {
        return res.json({
            status : false,
            message : `User with email ${email} is not exist`,
        }).status(401)
    }


    if (inputToken !== user?.verificationToken) {
        return res.json({
            status : false,
            message : 'Token provided is not valid'
        }).status(401)
    }


    await prisma.user.update({
        where : {
            email : email
        },

        data : {
            verificationToken : null
        }
    })

    const payload = {
        id : user?.id,
        email : user?.email,
        createdAt : user?.createdAt
    }

    const token = await sign(payload, SECRET)

    return res.json({
        status : true,
        message : 'success',
        data : {...payload, token}
    })
}

type UserPayload = {
    id : number,
    isVerified : boolean | null,
    email : string,
    createdAt : Date
}

export const updateYourPassword = async function(req : Request, res : Response) {
    try {
    
            const { authorization } = req.headers
            const { password } = await req.body
    
            if (!authorization || !authorization.split(' ')[1]) {
                return res.json({
                    status: false,
                    message: 'token not provided!',
                    data: null
                }).status(401);
            }

            if(!password){
                return res.json({
                    status: false,
                    message: 'Please insert password !',
                }).status(401);
            }
    
            let token = authorization.split(' ')[1];
    
            const user : UserPayload = await verify(token, SECRET)

            const result = await prisma.user.update({
                where : {
                    id : Number(user.id)
                }, data : {
                    password : password
                }
            })

            if(!result) {
                return res.json({
                    status : false,
                    message : `User with email ${user.email} is not exist`
                })
            }
    
            return res.json({
                status : true,
                message : 'success',
                data : result
            })
    
    } catch (err) {
        throw err
    }
}


export const verifyEmailAndGiveLink = async function(req : Request, res : Response) {

    try {
        const {email} = await req.body

        const isExist = await getUserByEmail(email)

        if(!isExist){
            return res.json({ result: false, message: 'email tidak dapat ditemukan !' }).status(400)
        }

        const payload = {
            id : isExist.id,
            email : isExist.email,
            createdAt : isExist.createdAt
        }
        //const token = 12345
        const token = await sign(payload, SECRET)
        let url = `${req.protocol}://${req.get('host')}/update-password-verify?token=${token}`;

        await transporter.sendMail({
            from: SERVER_EMAIL,
            to: `${email}`, //,
            subject: "Email Verification",
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                color: #333;
                                text-align: center;
                            }
                            p {
                                color: #666;
                            }
                            .verification-token {
                                background-color: #007bff;
                                color: #fff;
                                padding: 10px;
                                border-radius: 5px;
                                text-align: center;
                                font-weight: bold;
                            }
                            .verification-link {
                                display: block;
                                margin: 20px 0;
                                text-align: center;
                            }
                            .verification-link a {
                                background-color: #007bff;
                                color: #fff;
                                padding: 10px 20px;
                                border-radius: 5px;
                                text-decoration: none;
                                font-weight: bold;
                            }
                            .verification-link a:hover {
                                background-color: #0056b3;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Email Verification</h1>
                            <p>Please don't share this link with anyone.</p>
                            <p>Token will expire in 10 minutes.</p>
                            <div class="verification-link">
                                <a href="${url}" target="_blank">Click Here To Reset Your Password</a>
                            </div>
                        </div>
                    </body>
                </html>
            `,
        })
                
        console.log("Sebelum mengirim respons JSON");

        return res.json({ result: true, message: 'berhasil kirim email !' })

    } catch (err) {
        if (err instanceof errorWithStatusCode) {
            return res.json({
                status: false,
                message: err.message
            }).status(err.statusCode)
        }
        
        throw err
    }
}


export const beforeRenderResetPassword = async function(req : Request, res : Response) {
    try {
        const { token } = req.query

        const queryToken = String(token)
        if(!token){
            return res.json({status : false, message : "token is not provided"})
        }

        await verify(queryToken, SECRET).then( (data) => {
            return res.render("updatePassword")
        }).then( (err) => {
            return res.json({status : false, message : "Bad Request"})
        })

    } catch (err) {

        if(err instanceof JwtTokenInvalid){
            return res.json({status : false, message : "Invalid JWT Token"})
        }

        throw err
    }
}


export const resetPasswordAsForgotByUser = async function(req : Request, res: Response) {

        try {
    
            const { authorization } = req.headers
            const { password } = await req.body
    
            if (!authorization || !authorization.split(' ')[1]) {
                return res.json({
                    status: false,
                    message: 'token not provided!',
                    data: null
                }).status(401);
            }

            if(!password){
                return res.json({
                    status: false,
                    message: 'Please insert password !',
                }).status(401);
            }
    
            let token = authorization.split(' ')[1];
    
            const user : UserPayload = await verify(token, SECRET).catch( (err)=> {
                return res.json({
                    status : false,
                    message : "token is invalid"
                }).status(400)
            })


            let result

            if(user.id){
                const hashed = await Bun.password.hash(password)

                result = await prisma.user.update({
                    where : {
                        id : Number(user.id)
                    }, data : {
                        password : hashed
                    }
                })
    
            } else {
                return
            }

            if(!result) {
                return res.json({
                    status : false,
                    message : `User with id ${user.id} is not exist`
                })
            }
    
            return res.json({
                status : true,
                message : 'success',
                data : result
            })

    } catch (err) {
        throw err
    }
}

export const verifyUserByEmail = async function(req : Request, res : Response){
    try {
        const { token } = req.query

        const queryToken = String(token)
        if(!token){
            return res.json({status : false, message : "token is not provided"})
        }

        await verify(queryToken, SECRET).then( async (data : UserPayload) => {
            await prisma.user.update({
                where : {
                    id : data.id
                }, 

                data : {
                    isVerified : true
                }
            })

            return res.render("login")
        }).then( (err) => {
            return res.json({status : false, message : "Bad Request"})
        })

    } catch (err) {

        if(err instanceof JwtTokenInvalid){
            return res.json({status : false, message : "Invalid JWT Token"})
        }

        throw err
    }
}

export const trySendEmailAgain = async function(req : Request, res : Response){
    const { token } = req.query

    const queryToken = String(token)
    if(!token){
        return res.json({status : false, message : "token is not provided"})
    }

    let url = `${req.protocol}://${req.get('host')}/email-login-verify?token=${token}`;

    const decoded = await verify(queryToken, SECRET)

    await transporter.sendMail({
        from: SERVER_EMAIL,
        to: `${decoded.email}`, 
        subject: "Welcome to Andya Website",
        html: `
            <html>
                <head>
                    <style>
                        /* CSS untuk styling */
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #fff;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #333;
                            text-align: center;
                        }
                        p {
                            color: #666;
                        }
                        .verification-token {
                            background-color: #007bff;
                            color: #fff;
                            padding: 10px;
                            border-radius: 5px;
                            text-align: center;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to Andya Website</h1>
                        <p>Congratulations! You've successfully registered on Andya Website.</p>
                        <p>Click The Button Below To Verify Your Email. And then Sign In</p>
                        <p>Explore and enjoy the features of our platform.</p>
                        <div class="verification-link">
                            <a href="${url}" target="_blank">Verify</a>
                        </div>
                    </div>
                </body>
            </html>
        `,
    })


    return res.json({
        status : true,
        message : "success email berhasil dikirim"
    })

}