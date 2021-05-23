const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const SocialPost=require('./CollectionsSchema.js')
const multer=require('multer')
const cors=require('cors')
const {Storage} = require('@google-cloud/storage')

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
		cb(null, "files")
	},
	filename: function (req, file, cb) {
	var arr=file.mimetype.split("/");
	var extension=arr[1]
	cb(null, file.fieldname + "-" + Date.now()+"."+extension)
	}
})

const upload = multer({
    storage: storage1
})

app.get('/fetchPosts',(req,res)=>{

    SocialPost.find({},function(err,data){
        if(err) throw err;
        else{
            res.send(JSON.stringify({'status':'success','posts':data}))
        }
    })
})

app.post('/post',upload.single('file'),(req,res)=>{
	console.log(req.body);
	console.log(req.file);
/*bucket.upload(req.file.path,{destination: 'images/'+req.file.filename},function(err,file,response){
        console.log(file);
        if(err) throw err;
        else res.send('https://storage.googleapis.com//'+bucket.name);
    })*/
    res.send(JSON.stringify({'status':'success'}))
})


app.listen(8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})
