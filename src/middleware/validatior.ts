import {Request, Response, NextFunction} from "express";
import joi from "joi";
import joi_phone from "joi-phone-number";
// import "joi-iban-extension";

const Joi = joi.extend(joi_phone)

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().alphanum().min(8).max(20),
    data: {
        username: Joi.string().alphanum().min(3).max(20),
        phone: Joi.string().phoneNumber(),
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