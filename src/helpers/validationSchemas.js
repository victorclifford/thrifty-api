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

export const urlValidator = yup.object().shape({
  url: yup.string().url(),
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

export const addItemConditionSchema = yup.object().shape({
  name: yup.string().required().min(3).max(40),
  description: yup.string().max(200),
});

export const addBrandSchema = yup.object().shape({
  name: yup.string().required().min(3).max(40),
  description: yup.string().max(250),
  logo: yup.string().url().required(),
});

export const addItemSchema = yup.object().shape({
  name: yup.string().required().min(3).max(100),
  description: yup.string().required().min(5).max(300),
  size: yup.string().max(25),
  color: yup.string().max(25),
  cover_image: yup.string().url().required(),
});

export const PriceBreakdownchema = yup.object().shape({
  total_items_price: yup.number().required().max(100000000),
  // platform_percentage: yup.string().required().max(4),
  // platform_fee: yup.number().required().max(100000000),
  delivery_fee: yup.number().required().max(10000),
});

export const SinglePriceBreakdownchema = yup.object().shape({
  delivery_fee: yup.number().required().max(10000),
});

export const DeliveryDetailsSchema = yup.object().shape({
  street_address: yup.string().required().min(5).max(100),
  apt_or_suite_number: yup.string().max(30),
  state: yup.string().required().min(2).max(30),
  city: yup.string().required().min(2).max(30),
  zip_code: yup.string().max(10),
  special_instructions: yup.string().max(170),
  additional_phone_number: yup
    .string()
    .min(6, "Invalid phone number")
    .max(15, "Invalid phone number"),
});
