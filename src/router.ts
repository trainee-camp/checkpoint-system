import {Router} from 'express'
import {authController} from "./auth.controller.js";

export const router = Router()
router.post('/auth/:checkpoint', authController.access)


router.get('/auth/verify/email/:checkpoint/:token', authController.activateEmail.bind(authController))
