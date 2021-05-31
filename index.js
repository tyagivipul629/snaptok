const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const SocialPost=require('./CollectionsSchema.js')
const multer=require('multer')
const cors=require('cors')
const {Storage} = require('@google-cloud/storage')
const fs=require('fs')

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


app.get('/fetchPosts',(req,res)=>{
console.log("post fetch reached");
	SocialPost.find({},function(err,result){
		if(err) res.send(err);
		else res.json(result);
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

app.post('/dislike',(req,res)=>{
	var action=req.body.action=="decrease"?-1:1;
	SocialPost.findOneAndUpdate({_id:req.body.id},{$inc:{dislikes: action}},function(err,response){
		if(err) throw err;
		else{
			res.json({});
		}
	})
})


app.post('/post',upload.single('file'),(req,res)=>{
	
bucket.upload(req.file.path,{destination: 'files/'+req.file.filename},function(err,file,response){
        if(err) throw err;
        else{
			fs.unlink(req.file.path,(err)=>{if(err) throw err;})
			req.body.file=file.metadata.mediaLink;
			var newPost=new SocialPost(req.body);
			console.log(newPost);
			newPost.save().then((item)=>{
				res.json({"Status":"Success"});
			}).catch(err=>{
				console.log(err);
				res.status(400).json({"Status":"Failure"});
			})
		}
    })
})


app.listen(process.env.PORT||8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})
