import mongoose from "mongoose";

// creation d'une fonction asynchrone de connexion de base de donnée
export const connectDB = async () =>{

    try {
        //definition de la DB et remplacement du mot de passe
        const DB = process.env.MONGO_URI.replace(
            "<password>", process.env.MONGO_PASSWORD
        );

        //connexion de la DB au serveur 
        const conn = await mongoose.connect(DB);
        console.log(`MongoDB connecté avec succes : ${conn.connection.host}`)

    
    } catch (error) {
        //affiche le message d'erreur
        console.log("Erreur de connexion a MongoDB: " , error.message);
        
        //arret de l'application
        process.exit(1)
        
    }

}