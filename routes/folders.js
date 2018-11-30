'use strict';
const express = require('express');
const Folder = require('../models/folder');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    const { searchTerm } = req.query;
    const regex = new RegExp(searchTerm, 'i');
    let filter = {};
    filter.$or = [{ 'name': regex}]
        
    Folder.find(filter)
    .sort({ updatedAt: 'desc'})
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
                const err = new Error('Invalid `id`');
                err.status = 400;
                return next(err);
            }
            Folder.findById(id) 
            .then(result =>{
                res.json(result)
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
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
      const err = new Error('Please enter a Valid `id`');
      err.status = 400;
      return next(err);
    }
    /***** Never trust users - validate input *****/
    const updateObj = {};
    const updateableFields = ['name'];
  
    updateableFields.forEach(field => {
        if(field === 'name'){
          updateObj['name'] = req.body[field];
        }else{
          updateObj[field] = req.body[field];
        }
      });
    console.log(updateObj);
    console.log('Update a Folder');
    Folder.findByIdAndUpdate(id, updateObj)
    .then(result => res.status(204).json(result))
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