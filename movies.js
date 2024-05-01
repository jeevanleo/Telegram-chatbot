const request = require('request');
const telegrambot=require("node-telegram-bot-api");
const token="6556011515:AAGHaAY0uc7E5txU5hph-E_kraUI4H2_0vk";

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

var serviceAccount = require("./db.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const bot=new telegrambot(token,{polling:true});
   


bot.on("message",function(msg){
    const mg=msg.text;
    console.log(msg.text);
    request("https://www.omdbapi.com/?t=" +msg.text+ "&apikey=151f484f",function(error,response,body){
    console.log(msg.text);
        const mg=msg.text;
        const newmsg=mg.split(" ");
        if(newmsg[0]=='get' || newmsg[0]=='Get' || newmsg[0]=='GET'){
            db.collection('Geocoding').where('userID', '==', msg.from.id).get().then((docs)=>{
                docs.forEach((doc) => {
                      bot.sendMessage(msg.chat.id, "The movie name is " +doc.data().key)
                      bot.sendMessage(msg.chat.id, doc.data().key +" is released in "+ doc.data().Released)
                      bot.sendMessage(msg.chat.id, "The Metascore rating of "+doc.data().key + " is " + doc.data().Metascore)
                      bot.sendMessage(msg.chat.id, "The imdb rating of "+doc.data().key + " is " + doc.data().imdbRating)
                });
              })
        }
        else{
            
            const title=JSON.parse(body).Title;
            const release=JSON.parse(body).Released;
            const meta=JSON.parse(body).Metascore;
            const imdb=JSON.parse(body).imdbRating;
            console.log(title);
            console.log(release);
            console.log(meta);
            console.log(imdb);
            db.collection('Geocoding').add({
                key:msg.text,
                Released:release,
                Metascore:meta,
                imdbRating:imdb,
                userID:msg.from.id
            }).then(()=>{
                bot.sendMessage(msg.chat.id,"Name = "+JSON.parse(body).Title);   
                bot.sendMessage(msg.chat.id,"Released in = "+JSON.parse(body).Released);
                bot.sendMessage(msg.chat.id,"Metascore is = "+JSON.parse(body).Metascore);
                bot.sendMessage(msg.chat.id,"IMDB Rating is = "+JSON.parse(body).imdbRating);
                bot.sendMessage(msg.chat.id, msg.text+ " stored in Database sucessfully !!")
            })
        }   
    });
});