import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import config from "./config.js";

export const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
      user: config.EMAIL_USERNAME,
      pass: config.EMAIL_PASSWORD,
    },
    headers: {
      "X-PM-Message-Stream": "outbound",
    },
  });

  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("views/"),
  };
  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    // html: options.text,
    template: options.template,
    context: {
      verificationCode: options.verificationCode,
      resetCode: options.resetCode,
      email: options.to,
      firstname: options.firstname,
    },
  };

  console.log("MO::", mailOptions);

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("mail_err:::", err);
    }
    console.log("Message sent: " + info?.response);
  });
};
