import { Router } from 'express'
import auth from '../routes/auth.route'

const v1 = Router()

v1.use("/auth", auth)

export default v1