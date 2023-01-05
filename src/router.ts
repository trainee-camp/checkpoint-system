import {NextFunction, Router} from 'express'
import {authController} from "./auth.controller.js";
import {validate} from "./middleware/validatior.js";

export const router = Router()
router.post('/auth/:checkpoint', validate, authController.access)


router.get('/auth/verify/email/:checkpoint/:token', authController.activateEmail.bind(authController))
