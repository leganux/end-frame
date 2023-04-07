
let cron = require('node-cron');
let moment = require('moment');
let axios = require('axios');
let cronlist = {};
  
cronlist["8a1536d6"]=cron.schedule('* * * * *', async function () { console.info('Cron every minute');   return body.a + body.b },  {timezone: "America/Mexico_City"});  
cronlist["8a1536d6"].stop();
                    
cronlist["4b24e491"]=cron.schedule('*/2 * * * *', async function () {  console.log('cron cada 2 minutos ____ tttt  ') ; return body.a + body.b },  {timezone: "America/Mexico_City"});  
cronlist["4b24e491"].stop();
                    
cronlist["e8bef11b"]=cron.schedule('*/2 * * * *', async function () {  console.log('cron cada 2 minutos ____ tttt  ') ; return body.a + body.b },  {timezone: "America/Mexico_City"});  
cronlist["e8bef11b"].stop();
                    
cronlist["8272b022"]=cron.schedule('*/1 * * * *', async function () {  console.log('cron cada 1 minutos ____ nuevo  ') ; return body.a + body.b },  {timezone: "America/Mexico_City"});  
cronlist["8272b022"].stop();
                    
cronlist["33fd6963"]=cron.schedule('* * * * *', async function () {  console.log('This is a cron every minute ') ; return true },  {timezone: "America/Mexico_City"});  
cronlist["33fd6963"].stop();
                    
module.exports=cronlist;
            