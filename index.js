import { generateImagesLinks } from 'bimg';
import fs from 'fs';
import { Blob, FormData } from 'formdata-node';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Botly from 'botly';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = 8080;
const PageID = "245492821986982";
let userStatus = {};
/*--------- page database ---------*/
const botly = new Botly({
  accessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  webHookPath: process.env.WB_PATH,
  notificationType: Botly.CONST.REGULAR,
  FB_URL: "https://graph.facebook.com/v18.0/",
});

/*--------- Functions ---------*/
app.get("/", function (_req, res) {
  res.sendStatus(200);
});
app.use(
  bodyParser.json({
    verify: botly.getVerifySignature(process.env.APP_SECRET),
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/webhook", botly.router());
botly.on("message", async (senderId, message, data) => {
  //aaaaaaaaaaaaa
  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.MARK_SEEN});
  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_ON});

  /*--------- s t a r t ---------*/
  if (message.message.text) {
    if (userStatus[senderId]) {
      botly.sendText({id: senderId, text: "رجاءا انتظر حتى يتم توليد الصور الخاصة برسالتك السابقة ❤️"});
    } else {
      userStatus[senderId] = true;
      botly.sendText({id: senderId, text: "الميزة تجريبية ❗⏳\n لذلك قد يستغرق وقتا اطول لتويد الصور الخاص بك 🏙️ "});

      let userText = encodeURIComponent(message.message.text); 
      let apiUrl = `https://raiden-api.up.railway.app/api/ai/bingimage?q=${userText}`; 

      let response = await fetch(apiUrl);
      let data = await response.json();

      if (Array.isArray(data.data)) {
        let imageUrls = data.data

        for (let imageUrl of imageUrls) {
          botly.sendImage({id: senderId, url: imageUrl, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
        }
        userStatus[senderId] = false;
      } else {
        try {
          botly.sendText({id: senderId, text: "حدث خطأ بسبب الضغط ، لذلك يتم الان استخدام السرفر التاني لتوليد صورتك مجددا لذلك انتظر قليلا ❤️"});
  const images = await generateImagesLinks(userText);

          for (let image of images) {
          botly.sendImage({id: senderId, url: image, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
        }
        userStatus[senderId] = false;
        } catch {
        console.error('Unexpected response:', data);
        botly.sendText({id: senderId, text: "حدث خطأ أثناء محاولة تحويل النص إلى صور. يرجى المحاولة مرة أخرى في وقت لاحق."});
        userStatus[senderId] = false;
        }
      }

    }

    } else if (message.message.attachments[0].payload.sticker_id) {
      botly.sendText({id: senderId, text: "(Y)"}) ;
    } else if (message.message.attachments[0].type == "image") {
  botly.sendText({id: senderId, text: "يرجى ارسال النصوص فقط ❤️"});
    } else if (message.message.attachments[0].type == "audio") {
      botly.sendText({id: senderId, text: "يرجى ارسال النصوص فقط ❤️"});
        } else if (message.message.attachments[0].type == "video") {
      botly.sendText({id: senderId, text: "يرجى ارسال النصوص فقط ❤️"});
    }
  /*--------- e n d ---------*/
//botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_OFF}); 
});
botly.on("postback", async (senderId, message, postback, data, ref) => {
 //aaaaaaaaaa
  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.MARK_SEEN});
  //aaaaaaaa
  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_ON});
    /*--------- s t a r t ---------*/
    if (message.postback){ // Normal (buttons)
    if (postback == "GET_STARTED"){           botly.sendGeneric({id: senderId, elements: {
                title: "سعيد بلقاءك ❤️، انا هنا لتحويل كل ما في بالك الى صور ابداعية 😍",
                image_url: "https://telegra.ph/file/77edfdf7b35823caf90f6.jpg",
                subtitle: "ارسل نصا لكي احوله الى صورة ❤️",
                buttons: [
                  botly.createPostbackButton("مطور البوت 🇲🇦😄", "Owner"),
                ]}, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
        
    } else if (postback == "Owner") {
        botly.sendGeneric({id: senderId, elements: {
           title: "Morocco AI",
           image_url: "https://telegra.ph/file/6db48bb667028c068d85a.jpg",
           subtitle: " اضغط لمتابعة الصفحة ❤️👇🏻",
           buttons: [
              botly.createWebURLButton("صفحة المطور 🇲🇦😄", "https://www.facebook.com/profile.php?id=100090780515885")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
      } else if (postback == "bots") {
      botly.sendText({id: senderId, text: `قائمة روبوتاتنا 🇲🇦😍`,
      quick_replies: [
         botly.createQuickReply("Atlas-GPT", "Atlas-GPT")]});
    }
  } else { // Quick Reply
   if (postback == "Owner") {
      botly.sendGeneric({id: senderId, elements: {
         title: "Morocco AI",
         image_url: "https://telegra.ph/file/6db48bb667028c068d85a.jpg",
         subtitle: "صفحة المطور 🇲🇦😄",
         buttons: [
            botly.createWebURLButton("مطور البوت 🇲🇦😍", "fb.com/Morocco.Openai")]},
          aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
     }
  }
   /*--------- e n d ---------*/
 //aaaaa
  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_OFF});
});
/*------------- RESP -------------*/
botly.setGetStarted({pageId: PageID, payload: "GET_STARTED"});
botly.setGreetingText({
    pageId: PageID,
    greeting: [
      {
        locale: "default",
        text: "CatBot - Image Generator Bot\nهو روبوت لتحويل نص الى صور واقعية 😯\n❤️🇲🇦"
      }
    ]
  });
botly.setPersistentMenu({
    pageId: PageID,
    menu: [
        {
          locale: "default",
          composer_input_disabled: false,
          call_to_actions: [
            {
              type:  "web_url",
              title: "صفحة المطور 🇲🇦😄",
              url:   "fb.com/Morocco.Openai/",
              webview_height_ratio: "full"
            }
          ]
        }
      ]
  });
/*------------- RESP -------------*/
app.listen(process.env.PORT || port, () =>
  console.log(`App is on Port : ${port}`)
)

