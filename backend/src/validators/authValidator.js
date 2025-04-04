import { body,check } from "express-validator";


//  for user registration 
export const registrationValidationRules = () => 
   
   [
    body("email").trim()
    .notEmpty().withMessage("Email is required").bail()
    .isEmail().withMessage("Invalid email").bail().normalizeEmail(
        {gmail_remove_dots: true,
        gmail_remove_subaddress: true,
        all_lowercase: true}),
  // ,trim() will return Number to String 
    body("password").notEmpty().withMessage("Password is required").bail()
      .isString().withMessage("Password must be a string").bail()
      .isLength({ min: 6 })
      .withMessage("Password must be a atleast 6 characters"),

      // with regex

  //     body("password").trim()
  // .notEmpty().withMessage("Password is required").bail()
  // .isString().withMessage("Password must be a string").bail()
  // .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long").bail()
  // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
  // .withMessage("Password must include uppercase, lowercase, number, and special character"),

      // custom checks

      // body("password")
      // .custom((value) => {
      //   if (typeof value !== "string") {
      //     throw new Error("Password must be a string");
      //   }
    
      //   if (!value.trim()) {
      //     throw new Error("Password is required");
      //   }
    
      //   if (value.length < 6) {
      //     throw new Error("Password must be at least 6 characters long");
      //   }
    
      //   return true;
      // }),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),
  ]
  
//  for sign in 
export const siginingInValidationRules=()=>
     [
    body("email").trim()
    .notEmpty().withMessage("Email is required").bail()
    .isEmail().withMessage("Invalid email").bail().normalizeEmail(
        {gmail_remove_dots: true,
        gmail_remove_subaddress: true,
        all_lowercase: true}),
    body("password").notEmpty().withMessage("Password is required"),
]

// for sign out with custom req and use of OneOf like switch
export const signingOutValidationRules=()=>
     [
        body("type").notEmpty().withMessage("Type is required").bail().isIn(["One",
        "All"]).withMessage("Type is required either One or All"),

        check("refreshToken").if(body("type").equals("One")).notEmpty().withMessage("Refresh token is required for single session logout"),

        body("userId").if(body("type").equals("All")).notEmpty().withMessage(" User id required with all session logout"),

        // custom with type check prehand

        // body().custom((_, { req }) => {
        //   if (req.body.type === "One" && !req.body.refreshToken) {
        //     throw new Error("Refresh token is required for sign out of type 'One'");
        //   }
        //   if (req.body.type === "All" && !req.body.userId) {
        //     throw new Error("User ID is required for sign out of type 'All'");
        //   }
        //   return true;
        // }),

]