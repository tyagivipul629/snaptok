var app=require('express')()
var mysql=require('mysql')
var bodyParser=require('body-parser')
var session=require('express-session')
var cors = require('cors')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors())

var db_config={
	host: 'us-cdbr-east-03.cleardb.com',
	user: 'b99ba2ee8b2948',
	password: '9834f978',
	database: 'heroku_e3a30a5672a88ce'
};

app.use(session({
	secret : "secret_password",
	resave : true,
	saveUninitialized : true
}));

var connection;
function handleDisconnect() {
  connection = mysql.createConnection(db_config);

  connection.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  });                                     
                                          
  connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
       throw err;  }                               
    });
}
handleDisconnect();

app.get('/',(req,res)=>{
        res.send("This is the home route of snaptok application");
   }
)

app.post('/signup',function(req, res){
		console.log(req.connection.remoteAddress);
		var usernm=req.body.usrnm;
		var passwd=req.body.passwrd;
        var email=req.body.email;
        var phone=req.body.phone;
		var objmsg={};
		var sql="select * from signup where username='"+usernm+"';";
		connection.query(sql, function(err, result){
		if(err) throw err;
		else if(result.length==0){
				var sql1="insert into signup values('"+usernm+"','"+passwd+"','"+email+"','"+phone+"');";
				connection.query(sql1,function(err, result){
					if(err) throw err;
					else{
						objmsg={'status':'success','message':'Signed up successfully with username '+usernm};
						res.send(JSON.stringify(objmsg));
						}

			});
			}
		else{
			objmsg={'status':'error','message':'Account already exists! Please choose another username!'};
			res.send(JSON.stringify(objmsg));
			}
			
		});
});

app.post('/login',function(req,res){
	console.log(req.body);
	var usernm=req.body.usrnm;
	var passwd=req.body.passwrd;
	var obj={};
	var credentials=[usernm,passwd];
	if(usernm&&passwd){
		connection.query("select * from session where username=?;",[usernm],function(err,result){
			if(err) throw err;
			else if(result.length!=0){
				res.send("Already signed in with username "+usernm);			
			}	
			else{
			connection.query("select * from signup where username=? and passwd=?;",credentials, function(err1, result){
			if(err1) throw err1;
			if(result.length!=0)
			{
				req.session.loggedin=true;
				req.session.username=usernm;
				var sql1="insert into session values('"+usernm+"','"+req.sessionID+"');";
				connection.query(sql1,function(err, result){
					if(err) throw err;
					else{
						console.log(req.sessionID);
						res.send('Logged in successfully with username '+req.session.username);
						}

			});
			}
			else{
			obj={'status':'error','message':'Incorrect Username and/or Password'};
			obj=JSON.stringify(obj);
			res.send(obj);	
			}
			
		});
	}				
		});
	}
});

app.post('/logout',(req,res)=>{
	var user=req.body.user;
	req.session.loggedin=false;
	req.session.username=null;
	req.session.destroy();
        connection.query("Delete from session where username=?;",[user],function(err,result){
		if(err) throw err;
		else{
		res.send("User signed out successfully!");	
	}

	});
	
});

app.get('/homepage',(req,res)=>{
	connection.query("select * from session;",function(err,result){
		if(err) throw err;
		else if(result.length==0){
			res.send("No user is logged in currently! Please login first");
		}
		else{
			res.send(result[0].username+" is logged in currently");
		}
	})
});

app.listen(process.env.PORT||3000);
