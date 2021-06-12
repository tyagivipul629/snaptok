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
    description: String,
    file: String,
    fileType: String,
    subGratis: String,
    dateOfPost: String,
    likes: Number,
    hearts: Number, 
    comments:[
        {
            commentAuthor: String,
            comment: String,
            mention: String,
            dateOfcomment: String,
            replies: [{
                replyAuthor: String,
                reply: String,
                dateOfReply: String
            }]
        }
    ]
},{collection: 'SocialPost'});

const SocialPost=mongoose.model('SocialPost',PostSchema);

module.exports=SocialPost;
