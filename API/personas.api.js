import { Router } from 'express';
import { LibroModel } from '../model/libro.nodel.js';
import { PersonaModel } from '../model/persona.model.js';

export const personasRoutes = Router();



//-----------------API PERSONAS-----------------------

//-----------------LISTO TODAS LAS PERSONAS-----------------------

personasRoutes.get('/persona', async (req, res) => {
    try{
        let personas = await PersonaModel.find();
        res.status(200).send(personas);
    }
    catch {
        console.log(error);
    }
})


//-----------------BUSCO UNA PERSONA POR ID-----------------------

personasRoutes.get('/persona/:id', async(req, res) => {
    try {
        const unaPersona = await PersonaModel.findById(req.params.id);

        if (unaPersona == undefined || !unaPersona){
        res.status(404).send('No existe una persona con ese ID');
        return; }

        res.status(200).send(unaPersona);

    }
    catch(error) {
    console.log(error);
    }
})

//-----------------BUSCO UNA PERSONA POR NOMBRE-----------------------

personasRoutes.get('/persona/search/:nombre', async(req, res) => {
    try {
        const unaPersona = await PersonaModel.find({nombre: req.params.nombre});

        if (unaPersona == undefined || !unaPersona || unaPersona.length == 0){
        res.status(404).send('No existe una persona con ese nombre');
        return; }

        res.status(200).send(unaPersona);

    }
    catch(error) {
    console.log(error);
    }
})


//----------------- ALTA DE PERSONA -----------------------

personasRoutes.post('/persona', async (req, res) => {
    try{

        if(!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.email || !req.body.celu){
            throw new Error('No me enviaste todos los datos de la persona');
        }   

        const mailExiste = await PersonaModel.findOne({email: req.body.email});

        if (mailExiste){
            res.status(413).send('Ya existe una persona con ese email');
            return;
        }


        const personaNueva = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            alias: req.body.alias,
            email: req.body.email,
            celu: req.body.celu
        };

        const newPersona = await PersonaModel.create(personaNueva);

        res.status(200).send('Se dio de alta a la persona: ' + personaNueva.nombre + ' ' + personaNueva.apellido);
    }
    catch(error){
        console.log(error);
    }
})

//----------------- BORRO UNA PERSONA -----------------------

personasRoutes.delete('/persona/:id', async (req, res) => {
    try{
        
        //Valido que la persona exista
        const persona = await PersonaModel.findById(req.params.id);

        if (persona == undefined || !persona){
        res.status(404).send('No existe una persona con ese ID');
        return; }

        //Valido que la persona no tenga un libro
        const unaPersona = await LibroModel.findOne({persona: req.params.id})
        if (unaPersona){
            res.status(413).send('No podes eliminar una persona que tiene un libro');
            return;
        }
        
        await PersonaModel.findByIdAndDelete(req.params.id);

        res.status(200).send('Se borró satisfactoriamente la persona: ' + persona);
    }
    catch(error){
        console.log(error);
    }
})

//----------------- MODIFICAR UNA PERSONA  - SOLO CELULAR -----------------------

personasRoutes.put('/persona/:id', async (req, res) => {
    try{
        //Valido si la persona existe
        const unaPersona = await PersonaModel.findById(req.params.id);

        if(unaPersona == undefined || !unaPersona){
            throw new Error('No existe la persona');
        };

        if(!req.body.celu){
            throw new Error('No enviaste el celular a cambiar');
        };
        
        const personaCambiada = await PersonaModel.findByIdAndUpdate(req.params.id,{celu: req.body.celu} ,{new: true});

        res.status(200).send('Se modificó con exito el celular!');
    }
    catch(error) {
        console.log(error);
    }
})

