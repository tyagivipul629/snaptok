const mongoose = require('mongoose');
const connector = require('./cluster-connector');

mongoose.connect(connector.connector,{useNewUrlParser:true,useUnifiedTopology: true})
.then(()=>{
    console.log("connected");
})
.catch((err)=>console.log("could not connect:",err));

const PostSchema=mongoose.Schema({
    author: String,
    uid: String,
    email: String,
    title: String,
    userProfile: String,
    description: String,
    file: String,
    fileType: String,
    subGratis: String,
    dateTime: String,
    likes: Number,
    hearts: Number, 
    comments:[
        {
            commentAuthor: String,
            uid: String,
            comment: String,
            userProfile: String,
            dateOfComment: String,
            replies: [{
                replyAuthor: String,
                authorProfile: String,
                reply: String,
                dateOfReply: String
            }]
        }
    ]
},{collection: 'SocialPost'});

const SocialPost=mongoose.model('SocialPost',PostSchema);

module.exports=SocialPost;
