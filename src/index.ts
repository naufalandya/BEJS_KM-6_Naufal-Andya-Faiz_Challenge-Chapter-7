import express, { Request, Response, NextFunction, Errback } from "express"
import morgan from "morgan"
import bodyParser from "body-parser"
import path from 'path'
import cors from 'cors'
import views from "./routes/view.route"
import v1 from "./api/v1"
import { corsMiddleware } from "./middlewares"
import Sentry from "./libs/sentry.lib"
//import expressListRoutes from "express-list-routes"

const app = express()
    .use(Sentry.Handlers.requestHandler())
    .use(Sentry.Handlers.tracingHandler())
    .use(cors(corsMiddleware.corsOptions))
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(morgan("dev"))
    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, 'views'))
    .use(bodyParser.urlencoded({extended : false}))
    .use(bodyParser.json({ limit: '1kb' }))
    .use("/api/v1", v1)
    .use("/", views)
    .get("/error", (res : Response)=> {
        throw new Error("errror custom tess")
     })
    .use(Sentry.Handlers.errorHandler())

     // 500 error handler
    .use((err : any, req : Request, res : Response, next : NextFunction) => {
         console.log(err);
         res.status(500).json({
             status: false,
             message: err.message,
             data: null
         });
     });
     
     // 404 error handler
    app.use((req, res, next) => {
         res.status(404).json({
             status: false,
             message: `are you lost? ${req.method} ${req.url} is not registered!`,
             data: null
         });
    })

//expressListRoutes(app, { prefix: '/api/v1' });

import http from "http"
import { Server } from "socket.io"


const server = http.createServer(app)
export const io = new Server(server)


const PORT = Bun.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});