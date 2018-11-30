'use strict';
const express = require('express');
const Tag = require('../models/tags');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/note');
router.get('/', (req, res, next) => {
    const { searchTerm } = req.query; 
    const regex = new RegExp(searchTerm, 'i'); 
    let filter = {}; 
    filter.$or = [{ 'name':regex}];

    Tag.find(filter)
    .sort({name:'asc'})
    .then(results => {
        res.json(results);
    })
    .catch(err => next(err)); 
});

router.get('/:id', (req,res,next)=>{
    const { id }= req.params; 
    if(!mongoose.Types.ObjectId.isValid(id)){
        const err = new Error('Not Found => Invalid `id`'); 
        err.status = 404; 
        return next(err); 
    }
    Tag.findById(id)
    .then(result=>{
        res.json(result)
    })
    .catch(err => next(err)); 
})
router.post('/', (req,res,next)=>{
    const { name }= req.body; 
    const newObject ={ name }; 
    if(!newObject.name){
        const err = new Error('missing `Title` in request body'); 
        err.status = 400; 
        return next(err); 
    }
    Tag.create(newObject)
        .then(result =>{
            res.location(`httpm://${req.headers.host}/api/tags/${result.id}`).status(201).json(result); 
        })
    .catch(err => {
        if (err.code === 11000) {
          err = new Error('The tag name already exists');
          err.status = 400;
        }
        next(err);
      }); 
});
    

router.put('/:id', (req,res,next)=>{
    const id = req.params.id; 
    if(!mongoose.Types.ObjectId.isValid(id)){
        const err = new Error('Please enter a valid `Id`'); 
        err.status = 400; 
        return next(err); 
    }

    const updateObj = {}; 
    const updateableFields =['name', 'tags']; 

    updateableFields.forEach(field => {
        if(field === 'name'){
            updateObj['name']= req.body[field]; 
        }else{
            updateObj[field] = req.body[field]; 
        }
    });
    Tag.findByIdAndUpdate(id, updateObj)
        .then(result => res.status(204).json(result))
        .catch(err =>{
            if(err.code === 11000){
                err = new Error('The tag `Name` already exists'); 
                err.status = 400; 
            }
            next(err); 
        });
});

router.delete('/:id', (req, res, next) => {
    const { id } = req.params;
  
    Tag.findByIdAndRemove(id)
      .then(() => Note.updateMany({tags: id},{$pull: {tags: id }}))
      .then(() => {
        res.status(204).end();
      })
      .catch(err => {
        next(err);
      });
  
  });

module.exports = router;