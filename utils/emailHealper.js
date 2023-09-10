const nodemailer = require('nodemailer');

const mailHelper = async (option) => {
        const transport = nodemailer.createTransport({
                host: process.env.MAILTRAP_HOST,
                port: process.env.MAILTRAP_PORT,
                auth: {
                        user: process.env.MAILTRAP_USER,
                        pass: process.env.MAILTRAP_PASS
                },
        });


        const message = {
                from : "sree@tshirtapp.com",
                to : option.email,
                subject : option.subject,
                text : option.message,
        };
        const info = await transport.sendMail(message);
        // console.log(`info mail------${info.messageId}`);
};

module.exports = mailHelper;



// var transport = nodemailer.createTransport({
//         host: "sandbox.smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "767318465cf4b6",
//           pass: "b74a5a964ef2a9"
//         }
//       });