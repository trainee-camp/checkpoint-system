import {Request, Response} from "express";
import {userService} from "./services/user.service.js";
import {v4 as uuidv4} from "uuid";
import {checkpointUserService} from "./services/checkpoint.service";

class AuthController {
    //object representing the queue of checkpoint handlers
    userService
    checkpointService

    constructor(userService: any, checkpointService: any) {
        this.userService = userService
        this.checkpointService = checkpointService
    }

    async basic(req: Request, res: Response) {
        try {
            //validation
            const {email, password} = req.body
            //write user data to db
            const user = await this.userService.create(email, password)
            //register checkpoint
            const checkpoint = await this.checkpointService.initiate(user, 'basic')
            //generate token
            //send in email
            //leave temp data in checkpoint
            await this.checkpointService.leaveTemp(checkpoint,)
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }

    async activateEmail(req: Request, res: Response) {
        try {
            const token = req.params.token
            const checkpoint = req.params.checkpoint
            const expected = await this.checkpointService.checkTemp(checkpoint)
            //check token validity and return results

        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }


}

export const authController = new AuthController(userService, checkpointUserService)
