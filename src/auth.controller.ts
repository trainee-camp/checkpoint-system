import {NextFunction, Request, Response} from "express";
import {userService} from "./services/user.service.js";
import {checkpointUserService} from "./services/checkpoint.service.js";
import crypto from "crypto";
import {mailerService} from "./services/mailer.service.js";
import {config} from "dotenv";
import axios from "axios";

config()

//Provides controller functions for checkpoints,as well as order of checkpoint walkthrough
class AuthController {
    //object representing the queue of checkpoint handlers
    userService
    checkpointService
    mailerService
    //Maps controller functions to checkpoint names
    map: Map<string, any>
    //Defines the order in which the checkpoints should be completed
    order: Array<string>

    constructor(userService: any, checkpointService: any, mailerService: any) {
        this.userService = userService
        this.checkpointService = checkpointService
        this.mailerService = mailerService
        //add custom checkpoints here
        this.map = new Map([
            ['basic', this.basic],
            ['profile', this.fillData],
            ['phone', this.fillData],
            ['address', this.fillData],
            ['account', this.fillData]
        ])
        this.order = Array.from(new Set(['basic', 'profile', 'phone', 'address', 'account']))

        this.checkpointService.define(this.order)
    }

//Access checkpoint by name, check if previous checkpoints were completed call required controller function
    access = async (req: Request, res: Response) => {
        try {
            const currentPoint = req.params.checkpoint
            const user = req.body.id
            //check previous checkpoints completion if id is provided ( basic authentication completed)
            if (!user) {
                return res.status(401).json({message: "Complete previous checkpoints first!"})
            }
            const checkpointNum = this.order.find(name => name === currentPoint)
            await Promise.all(this.order.slice(0, Number(checkpointNum)).map(async name => {
                const found = await this.checkpointService.find(user, name)
                if (!found) {
                    return res.status(401).json({message: "Complete previous checkpoints first!"})
                }
            }))
            //start completing other checkpoints starting from the current
            //initial data received with request
            let clientData = {...req.body, currentPoint}
            const {CLIENT, CLIENT_CHECKPOINT_EP} = process.env
            for (const [name, func] of this.map) {
                //call the function for checkpoint
                const dataOperation = await func.call(this, clientData, res)
                if (!dataOperation) {
                    return
                }
                //get further data from client for the next checkpoint
                const nextPoint = this.order[this.order.findIndex(point => point === currentPoint)]
                clientData = await axios.get(`${CLIENT}/${CLIENT_CHECKPOINT_EP}/${nextPoint}`)
                clientData.currentPoint = nextPoint
            }
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }

//initial checkpoint that creates the user based on credentials
    basic = async (reqData: any, res: Response) => {
        //parse request data
        const {email, password, currentPoint} = reqData
        //write user data to db
        const user = await this.userService.create({email, password})
        if (!user) {
            res.status(401).json({message: 'Email already in use'})
            return
        }
        //register checkpoint
        const checkpoint = await this.checkpointService.initiate(user, currentPoint)
        //generate token
        const token = crypto.randomBytes(64).toString('hex');
        //send in email
        const generatedUrl = process.env.HOSTNAME + '/auth/verify/email/' + checkpoint + '/' + token
        await this.mailerService.send(email, "Account verification", generatedUrl)
        //leave temp data in checkpoint
        await this.checkpointService.leaveTemp(checkpoint, token)
        //send response with next checkpoint name for the callback on the client side
        // res.status(200).json({message: "Sent verification email, you can continue for now", id: user})
        return 1
    }
//general function to fill in data for a user, callback receives a function to prepare for verification for specific checkpoint
    fillData = async (reqData: any, res: Response, verificator: any) => {
        //parse request data
        const {id, data, currentPoint} = reqData
        //write data to db
        const user = await this.userService.edit(id, {...data})
        if (!user) {
            res.status(404).json({message: "No such user exists"})
            return
        }
        //do checkpoint specific actions
        await verificator()
        //register checkpoint
        await this.checkpointService.initiate(id, currentPoint)
        //send response with next checkpoint name for the callback
        // res.status(200).json({message: "Updated user data", id})
        return 1
    }

//check if all checkpoints have been activated, activate the account
    finish = async (req: Request, res: Response) => {
        try {
            const user = req.body.id
            await Promise.all(this.order.map(async name => {
                const checkpoint = await this.checkpointService.find(user, name)
                if (!checkpoint.finished) {
                    return res.status(401).json({message: "Complete all checkpoints!"})
                }
            }))
            await this.userService.edit(user, {activated: true})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }

    }
//todo: different controller ?
//Checkpoint verification
    activateEmail = async (req: Request, res: Response) => {
        try {
            const token = req.params.token
            const checkpoint = req.params.checkpoint
            //check if token received with url is the one that was sent to the email address
            const expected = await this.checkpointService.checkTemp(checkpoint)
            if (!expected || token !== expected.temp_data) {
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
