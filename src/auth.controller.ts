import {NextFunction, Request, Response} from "express";
import {userService} from "./services/user.service.js";
import {checkpointUserService} from "./services/checkpoint.service.js";
import crypto from "crypto";
import {mailerService} from "./services/mailer.service.js";

//Provides controller functions for checkpoints,as well as order of checkpoint walkthrough
class AuthController {
    //object representing the queue of checkpoint handlers
    userService
    checkpointService
    mailerService
    //Maps controller functions to checkpoint names
    map: Map<string, any>
    //Defines the order in which the checkpoints should be completed
    order: Set<string>

    constructor(userService: any, checkpointService: any, mailerService: any) {
        this.userService = userService
        this.checkpointService = checkpointService
        this.mailerService = mailerService
        //add custom checkpoints here
        this.map = new Map([
            ['basic', this.basic],
            ['profile', this.fillProfile],
            ['phone', this.fillPhone],
            ['address', this.fillAddress],
            ['account', this.fillBankAccount]
        ])
        this.order = new Set(['basic', 'profile', 'phone', 'address', 'account'])

        this.checkpointService.define(this.order)
    }

//Access checkpoint by name, check if previous checkpoints were completed call required controller function
    access = async (req: Request, res: Response) => {
        try {
            const currentPoint = req.params.checkpoint
            const user = req.body.id
            //check completion if id is provided ( basic authentication completed)
            if (user) {
                for (const name of this.order) {
                    if (name === currentPoint) {
                        break
                    }
                    if (!await this.checkpointService.find(user, name)) {
                        return res.status(401).json({message: "Complete previous checkpoints first!"})
                    }
                }
            }
            //find next checkpoint name
            const order = this.order.values()
            let nextPoint = order.next()
            while (nextPoint.value !== currentPoint) {
                nextPoint = order.next()
            }
            //pass data about next checkpoint into the function to be sent to client
            return this.map.get(currentPoint).call(this, req, res, order.next().value)
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }
//initial checkpoint that creates the user based on credentials
    basic = async (req: Request, res: Response, nextPoint: string) => {
        //parse request data
        const {email, password} = req.body
        const currentPoint = req.params.checkpoint
        //write user data to db
        const user = await this.userService.create({email, password})
        if (!user) {
            return res.status(401).json({message: 'Email already in use'})
        }
        //register checkpoint
        const checkpoint = await this.checkpointService.initiate(user, currentPoint)
        //generate token
        const token = crypto.randomBytes(64).toString('hex');
        //send in email
        // const generatedUrl = process.env.HOSTNAME = '/auth/verify/email/' + checkpoint + '/' + token
        // await this.mailerService.send(email, "Account verification", "Pass by this link:", "<a href='" + generatedUrl + "'/>")
        //leave temp data in checkpoint
        await this.checkpointService.leaveTemp(checkpoint, token)
        //send response with next checkpoint name for the callback on the client side
        res.status(200).json({message: "Sent verification email, you can continue for now", id: user, nextPoint})
    }
//general function to fill in data for a user, callback receives a function to prepare for verification for specific checkpoint
    fillData = async (req: Request, res: Response, nextPoint: string, cb: any) => {
        //parse request data
        const {id, data} = req.body
        const currentPoint = req.params.checkpoint
        //write data to db
        const user = await this.userService.edit(id, {...data})
        if (!user) {
            return res.status(404).json({message: "No such user exists"})
        }
        //do checkpoint specific actions
        await cb()
        //register checkpoint
        await this.checkpointService.initiate(id, currentPoint)
        //send response with next checkpoint name for the callback
        res.status(200).json({message: "Updated user data", id, nextPoint})
    }
//Checkpoint specific functions which provide callbacks for verification (in progress)
    fillProfile = async (req: Request, res: Response, nextPoint: string) => {
        return this.fillData(req, res, nextPoint, async () => {

        })
    }

    fillPhone = async (req: Request, res: Response, nextPoint: string) => {
        return this.fillData(req, res, nextPoint, async () => {

        })
    }

    fillAddress = async (req: Request, res: Response, nextPoint: string) => {
        return this.fillData(req, res, nextPoint, async () => {

        })
    }

    fillBankAccount = async (req: Request, res: Response, nextPoint: string) => {
        return this.fillData(req, res, nextPoint, async () => {

        })
    }
    //todo: different controller ?
//Checkpoint verification
    activateEmail = async (req: Request, res: Response) => {
        try {
            const token = req.params.token
            const checkpoint = req.params.checkpoint
            //check if token received with url is the one that was sent to the email address
            const expected = await this.checkpointService.checkTemp(checkpoint)
            if (token !== expected.temp_data) {
                return res.status(401).json({message: 'Incorrect token'})
            }
            //complete the checkpoint and clear the temporary data
            await this.checkpointService.activate(checkpoint, true)
            await this.checkpointService.clearTemp(checkpoint)
            //
            res.status(200).json({message: "Verified"})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }

}

export const authController = new AuthController(userService, checkpointUserService, mailerService)
