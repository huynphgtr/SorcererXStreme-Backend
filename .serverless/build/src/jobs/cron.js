"use strict";var l=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var h=(n,t)=>{for(var r in t)l(n,r,{get:t[r],enumerable:!0})},g=(n,t,r,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of d(t))!m.call(n,o)&&o!==r&&l(n,o,{get:()=>t[o],enumerable:!(e=p(t,o))||e.enumerable});return n};var y=n=>g(l({},"__esModule",{value:!0}),n);var x={};h(x,{runDailyJob:()=>b});module.exports=y(x);var c=require("@prisma/client"),u=new c.PrismaClient,i=class{static async getUsersForNotification(){try{return(await u.reminder.findMany({where:{is_subscribed:!0,user:{email:{not:void 0}}},select:{user:{select:{email:!0,name:!0}}}})).map(e=>({email:e.user.email,name:e.user.name}))}catch(t){throw console.error("Prisma Error:",t),t}}};var a=require("@aws-sdk/client-ses"),f=new a.SESClient({region:"ap-southeast-1"}),s=class{static async sendDailyUpdate(t,r){let e={Source:process.env.SES_FROM_EMAIL,Destination:{ToAddresses:[t]},Message:{Subject:{Data:"Th\xF4ng b\xE1o t\u1EEB SorcererXStreme",Charset:"UTF-8"},Body:{Html:{Data:`<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4a2375;">Ch\xE0o ${r},</h2>
                    <p style="font-size: 16px; line-height: 1.6;">V\u0169 tr\u1EE5 \u0111\xE3 g\u1EEDi \u0111\u1EBFn m\u1ED9t t\xEDn hi\u1EC7u \u0111\u1EB7c bi\u1EC7t cho b\u1EA1n. H\xF4m nay, b\u1EA1n \u0111\u01B0\u1EE3c nh\u1EAFc nh\u1EDF v\u1EC1 t\u1EA7m quan tr\u1ECDng c\u1EE7a s\u1EF1 c\xE2n b\u1EB1ng.</p>

                    <div style="background-color: #f7f0ff; padding: 20px; margin-top: 25px; border-radius: 8px;">
                        <h3 style="color: #6a40a5; margin-top: 0;">G\u1EE3i \xFD N\u0103ng l\u01B0\u1EE3ng B\xED \u1EA9n:</h3>
                        <p style="font-style: italic; font-size: 16px; margin-bottom: 5px;">"M\u1ED9t s\u1EF1 ki\u1EC7n b\u1EA5t ng\u1EDD s\u1EBD x\u1EA3y ra, th\u1EED th\xE1ch c\xE1ch b\u1EA1n \u0111\xF3n nh\u1EADn thay \u0111\u1ED5i."</p>
                        <p style="font-style: italic; font-size: 16px; margin-top: 5px;">"...V\u1EADy... Y\u1EBFu t\u1ED1 n\xE0o s\u1EBD l\xE0 ch\xECa kh\xF3a gi\xFAp b\u1EA1n v\u01B0\u1EE3t qua th\u1EED th\xE1ch n\xE0y?"</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://main.d30n5a8g6cs88k.amplifyapp.com/" style="background-color: #6a40a5; color: white; padding: 15px 30px; text-align: center; text-decoration: none; display: inline-block; font-size: 18px; border-radius: 8px; font-weight: bold; transition: background-color 0.3s;">
                            Kh\xE1m ph\xE1 C\xE2u tr\u1EA3 l\u1EDDi Chi ti\u1EBFt NGAY!
                        </a>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #777;">
                        <p>\u0110\xE2y l\xE0 th\xF4ng b\xE1o t\u1EEB SorcererXStreme g\u1EEDi \u0111\u1EBFn b\u1EA1n.</p>
                    </div>
                </div>`,Charset:"UTF-8"}}}};try{return await f.send(new a.SendEmailCommand(e)),!0}catch(o){return console.error(`G\u1EEDi l\u1ED7i t\u1EDBi ${t}:`,o),!1}}};var b=async n=>{console.log("--- B\u1EAFt \u0111\u1EA7u Cron Job ---");try{let t=await i.getUsersForNotification();if(console.log(`T\xECm th\u1EA5y ${t.length} ng\u01B0\u1EDDi d\xF9ng.`),t.length===0)return;let r=t.map(e=>{if(e.email)return s.sendDailyUpdate(e.email,e.name||"B\u1EA1n")});return await Promise.allSettled(r),console.log("--- Ho\xE0n th\xE0nh Cron Job ---"),{statusCode:200,body:JSON.stringify({message:"\u0110\xE3 g\u1EEDi th\xF4ng b\xE1o th\xE0nh c\xF4ng"})}}catch(t){console.error("L\u1ED7i Cron Job:",t)}};0&&(module.exports={runDailyJob});
