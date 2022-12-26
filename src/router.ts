import {Router} from 'express'
import {authController} from "./auth.controller.js";

export const router = Router()
router.get('/auth/start',authController.initiateTransaction)
router.post('/auth/finish',authController.finishTransaction)
router.get('/auth/pipeline',authController.getPipeline)
router.post('/auth/progress/:point', authController.accessCheckpoint)
