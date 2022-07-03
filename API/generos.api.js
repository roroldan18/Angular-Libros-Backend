import { Router } from 'express';
import { GeneroModel } from '../model/genero.model.js';
import { LibroModel } from '../model/libro.nodel.js';


export const generosRoutes = Router();

//------------- LISTAR TODOS LOS GENEROS ----------------------

generosRoutes.get('/genero', async (req, res) => {
    try{
        const generos = await GeneroModel.find();
        res.status(200).send(generos);
    }
    catch(error) {
        console.error(error);
    }
})

//------------- LISTAR POR ID ----------------------

generosRoutes.get('/genero/:id', async (req, res) => {
    try{

        //Valido si el genero existe
        const unGenero = await RecetasModel.findById(req.params.id);

        if (unGenero == undefined || !unGenero){
            res.status(404).send('No existe un genero con ese ID');
        }

        res.status(200).send(unGenero);
    }
    catch(error) {
        console.error(error);
        res.status(404).send('No existe el genero');
    }
})

//------------- ALTA NUEVO GENERO ----------------------

generosRoutes.post('/genero', async (req, res) => {
    try{

        //Reviso si me mando los datos
        if(!req.body.nombre){
            throw new Error('Falta el genero a dar de alta');
        }

        //Reviso si el genero ya existe
        const generoExiste = await GeneroModel.findOne({nombre: req.body.nombre});

        if (generoExiste){
            res.status(404).send('El genero que intentas dar de alta ya existe.');
            return;
        }

        // Para Mongo DB debo mandarle siempre un JSON
        const genero = {
            nombre : req.body.nombre
        };

        const newGenero = await GeneroModel.create(genero);

        res.status(200).send('Se agregó el genero ' + newGenero);
    }

    catch(error) {
        console.error(error);
    }
})

//------------- ELIMINO  GENERO ----------------------

generosRoutes.delete('/genero/:id', async (req, res) => {
    try{
        //Valido si el genero existe
        const unGenero = await GeneroModel.findById(req.params.id);
        if (unGenero == undefined || !unGenero){
            res.status(413).send('No existe un genero con ese ID');
            return;
        };

        //Valido que el genero no esté usado en un libro
        const elGenero = await LibroModel.findOne({genero: req.params.id})
        if (elGenero){
            res.status(413).send('No podes eliminar un genero que está siendo usado en un libro');
            return;
        }

        await GeneroModel.findByIdAndDelete(req.params.id);

        res.status(200).send('Se borró satisfactoriamente')
    }
    catch {
        console.error(error);
    }
})

//------------- MODIFICACION DE GENERO ----------------------

generosRoutes.put('/genero/:id', async (req, res) => {
    try{
        //Valido si el genero existe
        const unGenero = await GeneroModel.findById(req.params.id);
        if(unGenero == undefined || !unGenero){
            throw new Error('No existe un genero con ese ID');
        }

        if(!req.body.nombre){
            throw new Error('No enviaste el genero');
        }

        /* Toda esta linea de codigo es para cambiar el Nombre del genero y actualizarlo. */
        const generoCambiado = await GeneroModel.findByIdAndUpdate(req.params.id, {nombre: req.body.nombre}, {new: true});


        res.status(200).send('Se modificó satisfactoriamente al genero: ' + req.body.nombre);
    }
    catch {
        console.error(error);
    }
})

