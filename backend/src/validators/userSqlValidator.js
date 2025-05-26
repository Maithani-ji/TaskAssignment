import Joi from "joi";

export const loginValidationRules=()=>

    Joi.object({
        email:Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email",
        }),
      password:Joi.string().required().messages({
            "string.empty": "Password is required ",
        }),
    })

  
