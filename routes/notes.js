'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();
const date = new Date();
/* ========== GET/READ ALL ITEMS ========== */

router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  const regex = new RegExp(searchTerm, 'i');
  let filter = {};
  filter.$or = [{ 'title': regex}, { 'content': regex}]
      
  Note.find(filter)
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
   Note.findById(id) 
  .then(result =>{
    res.json(result)
  }) 
  .catch(err => next(err)); 
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folder_id } = req.body; 
  const newObject = { title, content, folder_id };
  if (!newObject.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  Note.create(newObject)
  .then(result=>{
    res.location(`http://${req.headers.host}/api/notes/${result.id}`).status(201).json(result);
  })
  .catch(err => next(err)); 
  console.log('Create a Note');
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  if(!id){
    const err = new Error('Invalid `id`');
    err.status = 400;
    return next(err);
  }
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folderId'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      if(field === 'folderId'){
        updateObj['folder_id'] = req.body[field];
      }else{
        updateObj[field] = req.body[field];
      }
    }
  });
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  
  console.log(updateObj);
  console.log('Update a Note');
  Note.findByIdAndUpdate(id, updateObj)
  .then(result => res.status(204).json(result))
  .catch(err => next(err)); 


});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res,next) => {
  Note   
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;