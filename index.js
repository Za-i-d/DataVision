const express=require("express");
const path=require("path");
const bodyParser = require('body-parser');
const rutas=require("./routes/rutas");

const app=express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/",express.static(path.join(__dirname,"/web")));
app.set("view engine", "ejs"); //esta no puede ir despues de app.use("/",usuariosRutas);
app.use(express.urlencoded({extended:true})); //ni esta no puede ir despues de app.use("/",usuariosRutas);, es para los formularios
app.use("/",rutas);

const port=process.env.PORT || 4000; 
// para que nos entrege el sistema operativo
app.listen(port,()=>{
    console.log("Servidos en http://127.0.0.1:"+port);
});