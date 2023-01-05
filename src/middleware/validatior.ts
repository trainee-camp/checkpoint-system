import {Request, Response, NextFunction} from "express";
import Joi from "joi";

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().alphanum().min(8).max(20),
    data: {
        username: Joi.string().alphanum().min(3).max(20),
        phone: Joi.string(),
        address: Joi.string(),
        bankAccount: Joi.string()
    }
})
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const valid = schema.validate(req.body)
    if (valid.error) {
        return next(valid.error)
    }
    next()

}