import {Request, Response} from "express";
import {userService} from "./services/user.service.js";
import {v4 as uuidv4} from "uuid";
import {checkpointUserService} from "./services/checkpoint.service.js";
import crypto from "crypto";
import {mailerService} from "./services/mailer.service.js";

class AuthController {
    //object representing the queue of checkpoint handlers
    userService
    checkpointService
    mailerService

    constructor(userService: any, checkpointService: any, mailerService: any) {
        this.userService = userService
        this.checkpointService = checkpointService
        this.mailerService = mailerService
    }

    basic = async (req: Request, res: Response) => {
        try {
            //validation
            const {email, password} = req.body
            //write user data to db
            const user = await this.userService.create({email, password})
            //register checkpoint
            const checkpoint = await this.checkpointService.initiate(user, 'basic')
            //generate token
            const token = crypto.randomBytes(64).toString('hex');
            //send in email
            const generatedUrl = process.env.HOSTNAME = '/auth/verify/email/' + checkpoint + '/' + token
            // await this.mailerService.send(email, "Account verification", "Pass by this link:", "<a href='" + generatedUrl + "'/>")
            //leave temp data in checkpoint
            await this.checkpointService.leaveTemp(checkpoint, token)
            res.status(200).json({message: "Sent verification email", token, checkpoint})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }

    activateEmail = async (req: Request, res: Response) => {
        try {
            const token = req.params.token
            const checkpoint = req.params.checkpoint
            const expected = await this.checkpointService.checkTemp(checkpoint)
            if (token !== expected.temp_data) {
                return res.status(401).json({message: 'Incorrect token'})
            }
            res.status(200).json({message: "Verified"})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }


}

export const authController = new AuthController(userService, checkpointUserService, mailerService)
