import { body } from "express-validator";

export const blogsValidationMiddleware = [
  body("name").exists().withMessage("Name is a mandatory field!"),
  body("surname").exists().withMessage("Surname is a mandatory field!"),
  body("email")
    .exists("Email is a mandatory field!")
    .isEmail()
    .withMessage("Please send a valid email!"),
];
