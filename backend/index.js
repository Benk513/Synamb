import dotenv from "dotenv"
dotenv.config({path:'./config.env'});
import { app } from "./app.js";
import { connectDB } from "./db/connectDB.js";


// definition du port
let port = 5001

//lancement du serveur
app.listen(port, ()=>{
    connectDB()
    console.log(`le serveur tourne sur le port ${port}`)
})