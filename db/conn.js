const mongoose = require("mongoose")

const DB = "mongodb+srv://vishnusinghrajput34:zguZsUIwJ6u5wuob@cluster0.cszj2n6.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=> console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
})