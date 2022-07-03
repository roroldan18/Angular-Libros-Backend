import mongoose from 'mongoose';



//Creo el Schema de Persona
const PersonaSchema = new mongoose.Schema({ 
    nombre: String,
    apellido: String,
    alias: String,
    email: String,
    celu: String
})

export const PersonaModel = mongoose.model("persona", PersonaSchema);
