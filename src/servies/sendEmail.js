
import  nodemailer from 'nodemailer'



import jwt from 'jsonwebtoken'
import { EmailHtml } from './EmailHtml.js';
// import { EmailHtml } from './EmailHtml.js';

export const sendEmail=async(email,code)=>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
          user: "miss.ayaahmed77@gmail.com",
          pass: "yvquehpozavxjjkl",
        },
      });
/////////
    
        jwt.sign({email},'nour',async(err,token)=>{
               const info = await transporter.sendMail({
          from: '"aya 😀" <miss.ayaahmed77@gmail.com>', // sender address
          to: email, 
          subject: "Hello ✔", // Subject line
          
          html: EmailHtml(token,code), // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        })
   
}



