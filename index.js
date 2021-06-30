const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const SocialPost=require('./CollectionsSchema.js')
const multer=require('multer')
const cors=require('cors')
const http=require('http').createServer(app)
const io=require('socket.io')(http,options={
	cors:true,
	origins:["http://localhost:3000"],
   })
const {Storage} = require('@google-cloud/storage')
const fs=require('fs')

app.set('io',io);

const storage = new Storage({
    projectId: "gratis-3ce5a",
    keyFilename: "certfile.json"
  });

const bucket = storage.bucket("gratis-3ce5a.appspot.com");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());

app.use(cors());

var storage1 = multer.diskStorage({
	destination: function (req, file, cb) {
		// Uploads is the Upload_folder_name
		if(!file) return;
		cb(null, "files")
	},
	filename: function (req, file, cb) {
	if(!file) return;
	var arr=file.mimetype.split("/");
	var extension=arr[1]
	cb(null, file.fieldname + "-" + Date.now()+"."+extension)
	}
})

const upload = multer({
    storage: storage1
})

app.get('/',(req,res)=>{
	res.json({"status":"success"});
})

io.on('connection',function(socket){
	console.log("client reached connection");
	socket.emit('connection',null);
})

app.post('/deleteComment',(req,res)=>{
	SocialPost.findByIdAndUpdate({_id: req.body.postId},{$pull: {comments: {_id: req.body.commentId}}},{'new': true},function(err, success){
		if(err) res.send(err);
		else {
			req.app.get('io').sockets.emit(req.body.postId,{type: 'COMMENT_DELETED',commentId: req.body.commentId});
			res.json({})}
	})
})

app.post('/postReply',(req,res)=>{
	SocialPost.findOneAndUpdate({_id: req.body._id, "comments._id": req.body.commentId},
		{$push :{'comments.$.replies': {replyAuthor: req.body.replyAuthor, reply: req.body.reply, 
			authorProfile: req.body.authorProfile, dateOfReply: req.body.dateOfReply}}},{new: 'true'},
			function(err,result){
				if(err)
					res.json({err});
				else
					{const replies=result.comments.filter(comment=>comment._id==req.body.commentId)[0].replies;
					res.json(replies[replies.length-1]);}
			})
})

app.post('/deleteReply',(req,res)=>{
	SocialPost.findOneAndUpdate({_id: req.body._id, "comments._id": req.body.commentId},
		{$pull :{'comments.$.replies': {_id: req.body.replyId}}},{useFindAndModify: 'false'},
			function(err){
				if(err)
					res.json({err});
				else
					res.json({});
			})
})

app.post('/fetchPosts',(req,res)=>{
	if(req.body.category==="")
		SocialPost.find({},{comments: 0,description: 0},{sort: {dateTime: -1}}, function(err,result){
			if(err) res.send(err);
			else res.json(result);
		})
	else
		SocialPost.find({subGratis: req.body.category},{comments: 0,description: 0},{sort: {dateTime: -1}}, function(err,result){
			if(err) res.send(err);
			else res.json(result);
		})
})

app.post('/deletePost',(req,res)=>{

	SocialPost.findOneAndDelete({_id: req.body.id},function(err,result){
		if(err) res.send(err);
		else {
			req.app.get('io').sockets.emit(req.body.id,{type: 'POST_DELETED'});
			res.json({});
		}
	})
})

app.get('/fetchPost/:id',(req,res)=>{
	SocialPost.findOne({_id: req.params.id},function(err,post){
		if(err) res.send(err);
		else res.json(post);
	})
})

app.post('/like',(req,res)=>{
	
	var action=req.body.action=="decrease"?-1:1;
	SocialPost.findOneAndUpdate({_id:req.body.id},{$inc:{likes: action}},function(err,response){
		if(err) throw err;
		else{
			res.json({});
		}
	})
})

app.post('/postComment',(req,res)=>{
	const id=req.body.id;
	delete req.body.id;
	SocialPost.findOneAndUpdate({_id: id},{$push:{comments: req.body}}, {'new': true}, function(err, result){
		if(err) res.send(err);
		else {
			req.app.get('io').sockets.emit(id,
				{type: 'COMMENT_ADDED',res: result.comments[result.comments.length-1]});
			res.json({});
		}
	})
})

app.post('/heart',(req,res)=>{
	
	var action=req.body.action=="decrease"?-1:1;
	SocialPost.findOneAndUpdate({_id:req.body.id},{$inc:{hearts: action}},function(err,response){
		if(err) throw err;
		else{
			res.json({});
		}
	})
})

app.post('/changeProfile',upload.single('image'),(req,res)=>{
	if(req.file){
		bucket.upload(req.file.path,{destination: 'Profile/'+req.file.filename},function(err,file,response){
        if(err) throw err;
        else{
			fs.unlink(req.file.path,(err)=>{if(err) throw err;})
			res.json({"status": "success","URL": file.metadata.mediaLink})
		}
    })}
})

app.post('/changeBackground',upload.single('image'),(req,res)=>{
	if(req.file){
		bucket.upload(req.file.path,{destination: 'Profile/'+req.file.filename},function(err,file,response){
        if(err) throw err;
        else{
			fs.unlink(req.file.path,(err)=>{if(err) throw err;})
			res.json({"status": "success","URL": file.metadata.mediaLink})
		}
    })}
})

app.post('/fetchUserPosts',(req,res)=>{
	SocialPost.find({uid: req.body.id},function(err,data){
		if(err)
			res.json(err);
		else
			res.json(data);
	})
})

app.post('/favoritePosts',(req,res)=>{
	SocialPost.find({_id:{$in: req.body}},function(err,data){
		if(err)
			res.send(err);
		else
			res.json(data);
	})
})

app.post('/likedPosts',(req,res)=>{
	console.log(req.body);
	SocialPost.find({_id: {$in: req.body}},function(err,data){
		if(err)
			res.send(err);
		else
			res.json(data);
	})
})



app.post('/post',upload.single('file'),(req,res)=>{
	
	
if(req.file){bucket.upload(req.file.path,{destination: 'files/'+req.file.filename},function(err,file,response){
        if(err) throw err;
        else{
			fs.unlink(req.file.path,(err)=>{if(err) throw err;})
			req.body.file=file.metadata.mediaLink;
			var newPost=new SocialPost(req.body);
			newPost.save().then((item)=>{
				res.json({"Status":"Success"});
			}).catch(err=>{
				console.log(err);
				res.status(400).json({"Status":"Failure"});
			})
		}
    })}
	else{
			req.body.file="";
			var newPost=new SocialPost(req.body);
			newPost.save().then((item)=>{
				res.json({"Status":"Success"});
			}).catch(err=>{
				console.log(err);
				res.status(400).json({"Status":"Failure"});
			})
	}
})


http.listen(process.env.PORT||8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})
