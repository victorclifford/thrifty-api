import * as yup from "yup";

export const registerSchema = yup.object().shape({
  firstname: yup.string().min(2).max(20).required("your firstname is required"),
  lastname: yup.string().min(2).max(20).required("your lastname is required"),
  fcm: yup.string(),
  email: yup
    .string()
    .email("please provide a valid email")
    .required("email is required"),
  mobile: yup.string().min(6).max(15).required(),
  password: yup
    .string()
    .min(6, "password is to weak")
    .max(30, "password should not exceed 30 characters")
    .required("password is required")
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      "password must contain at least 1 UpperCase, 1 lowerCase, 1 number and 1 special character"
    ),
  gender: yup.number().required().min(1).max(3),
});

export const sixDigitCodeSchema = yup.object().shape({
  code: yup.string().required().min(6).max(6),
});

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("please provide a valid email")
    .required("email is required"),
});

//reset password args Schema
export const passwordResetSchema = yup.object().shape({
  resetCode: yup
    .string()
    .required("Reset Code is required!")
    .min(6, "Invalid Reset code!")
    .max(6, "Invalid Reset Code!"),
  userId: yup.string().required("User ID is Required"),
  password: yup
    .string()
    .min(6, "password is too weak")
    .max(30, "password should not exceed 30 characters")
    .required("password is required")
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      "password must contain at least 1 UpperCase, 1 lowerCase, 1 number and 1 special character"
    ),
});

export const addCategorySchema = yup.object().shape({
  name: yup.string().required().min(3).max(20),
});

export const addSubCategorySchema = yup.object().shape({
  name: yup.string().required().min(3).max(30),
});

export const addItemTypeSchema = yup.object().shape({
  name: yup.string().required().min(3).max(40),
});
