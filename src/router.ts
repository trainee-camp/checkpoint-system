import {NextFunction, Router} from 'express'
import {authController} from "./auth.controller.js";
import {validate} from "./middleware/validatior.js";

export const router = Router()
//checkpoints
router.post('/auth/:checkpoint', validate, authController.access)
router.post('/auth/finish', authController.finish)
//mfa
router.get('/auth/verify/email/:checkpoint/:token', authController.activateEmail)

