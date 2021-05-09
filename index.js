const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://vipul:vipul1234@vipulcluster.ssrmc.mongodb.net/vipul?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true})
.then(()=>{
    console.log("connected");
    const schema=mongoose.Schema;
    const nameSchema1=new schema({
    name: String,
    age: Number
},{collection:"student"});
    const User=mongoose.model('student',nameSchema1);
    User.find({},function(err,data){
        if(err) throw err;
        else {console.log(data);mongoose.connection.close();}
    })

})
.catch((err)=>console.log("could not connect:",err));
