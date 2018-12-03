'use strict';
const express = require('express');
const Folder = require('../models/folder');
const router = express.Router();
const Note = require('../models/note');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    const { searchTerm } = req.query;
    const regex = new RegExp(searchTerm, 'i');
    let filter = {};
    filter.$or = [{ 'name': regex}]
        
    Folder.find(filter)
    .sort({ updatedAt: 'asc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
  });
  
  /* ========== GET/READ A SINGLE ITEM ========== */
    router.get('/:id', (req, res, next) => {
        const { id } = req.params;
        console.log(id);  
            if(!mongoose.Types.ObjectId.isValid(id)){
                const err = new Error('The `id` is not valid');
                err.status = 400;
                return next(err);
            }
            // console.log(Folder.find({_id:id}));
            Folder.findOne({_id:id}).then(identifyYourself => {
              console.log(identifyYourself);
              if(!identifyYourself) {
                  const err = new Error('no folder with that id'); 
                  err.status = 404; 
                  return next(err); 
              }
            })
              .catch(function(err) {
               console.log(err); 
              });

            Folder.findById(id) 
            .then(result =>{
                if(!result){
                  console.log(result);
                }
              else{
              return res.json(result)
              }
              }) 
            .catch(err => next(err));
    });
  
  /* ========== POST/CREATE AN ITEM ========== */
  router.post('/', (req, res, next) => {
    const { name } = req.body; 
    const newObject = { name };
    if (!newObject.name) {
      const err = new Error('Missing `name` in request body');
      err.status = 400;
      return next(err);
    }
    Folder.create(newObject)
    .then(result=>{
      res.location(`http://${req.headers.host}/api/folders/${result.id}`).status(201).json(result);
    })
    .catch(err => {
        if (err.code === 11000) {
          err = new Error('The folder name already exists');
          err.status = 400;
        }
        next(err);
      }); 
    console.log('Create a Folder');
  });
  
  /* ========== PUT/UPDATE A SINGLE ITEM ========== */
  router.put('/:id', (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
  
    /***** Never trust users - validate input *****/
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Please enter a Valid `id`');
      err.status = 400;
      return next(err);
    }
  
    if (!name) {
      const err = new Error('Missing `name` in request body');
      err.status = 400;
      return next(err);
    }
  
    const updateFolder = { name };
  
    Folder.findByIdAndUpdate(id, updateFolder, { new: true })
      .then(result => {
        if (result) {
          res.json(result)
          .status(204); 
        } else {
          next();
        }
      })
      .catch(err => {
        if (err.code === 11000) {
          err = new Error('The folder name already exists');
          err.status = 400;
        }
        next(err);
      });
  });
  
  /* ========== DELETE/REMOVE A SINGLE ITEM ========== */
  router.delete('/:id', (req, res,next) => {
    Folder   
      .findByIdAndRemove(req.params.id)
      .then(() => res.status(204).end())
      .catch(err => next(err));
  });
module.exports = router;