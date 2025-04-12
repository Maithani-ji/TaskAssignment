import { body, param } from "express-validator";

//  get user by email
export const userByEmailValidationRules=()=>[
    body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Email is invalid").normalizeEmail({all_lowercase:true,gmail_remove_dots:true,gmail_remove_subaddress:true}),
]
//  delete uer by id 
export const userDeleteValidationRules=()=>[
    param("id").notEmpty().withMessage("User id is required").bail().isMongoId().withMessage("User id is invalid"),
]