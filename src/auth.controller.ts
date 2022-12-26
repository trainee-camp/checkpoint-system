import {Request, Response} from "express";
import {authService} from "./auth.service.js";
import {v4 as uuidv4} from "uuid";

class AuthController {
    //object representing the queue of checkpoint handlers
    pipeline
    authService

    constructor(auth_pipeline: any, authService: any) {
        this.pipeline = auth_pipeline
        this.authService = authService
    }

    //Registration handling
    getPipeline = async (req: Request, res: Response) => {
        try {
            //later rework to give names
            res.status(200).json({pipeline: this.pipeline.toString()})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }

    initiateTransaction = async (req: Request, res: Response) => {
        res.status(200).json({index: uuidv4()})
    }

    accessCheckpoint = async (req: Request, res: Response) => {
        try {
            const point = req.params.point
            const {index, payload} = req.body
            //check if all previous points have been completed
            // this.authService.checkTransaction(index, point)
            //call the current checkpoint handler
            await this.pipeline[point](payload, index)
            res.status(200).json({message:"Successfully completed this checkpoint"})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }

    finishTransaction = async (req: Request, res: Response) => {
        try {
            const {index} = req.body
            await this.authService.save(index)
            res.status(200).json({message:"Successfully completed all the checkpoints"})
        } catch (err: any) {
            console.log(err)
            res.status(500).json({message: err.message})
        }
    }
}

export const authController = new AuthController({
    basic: authService.basic
}, authService)
