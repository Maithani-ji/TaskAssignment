import { body } from "express-validator";

export const userByEmailValidationRules=()=>[
    body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Email is invalid").normalizeEmail({all_lowercase:true,gmail_remove_dots:true,gmail_remove_subaddress:true}),
]