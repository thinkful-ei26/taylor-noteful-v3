'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagsId } = req.query;

  let filter = {};

  if (searchTerm) {
     const re = new RegExp(searchTerm, 'i');
     filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if(tagsId){
    filter.tagsId = tagsId;
  }

  Note.find(filter)
    .sort({ updatedAt: 'desc' })
    .populate('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .populate('folderId', 'tagsId')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, tags, folderId} = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (tags){
    tags.forEach(element=>{
      if (!mongoose.Types.ObjectId.isValid(element)) {
        const err = new Error('The `tagId` is not valid');
        err.status = 400;
        return next(err);
   }
  });
  };

  const newNote = { title, content, folderId, tags };
    if(newNote.folderId ===''){
      delete newNote.folderId;
    }

  Note.create(newNote)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const thingsToUpdate = {}; 
  const updatedableFields = ['title', 'content', 'folderId', 'tags'];
  updatedableFields.forEach(field => {
    if(field in req.body){
      thingsToUpdate[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!thingsToUpdate.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (thingsToUpdate.folderId && !mongoose.Types.ObjectId.isValid(thingsToUpdate.folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (thingsToUpdate.tags){
    const badTagIds = thingsToUpdate.tags.filter((tag)=> !mongoose.Types.ObjectId.isValid(tag));
    if(badTagIds.length){
        const err = new Error('The `tagId` is not valid');
        err.status = 400;
        return next(err);
    }
  };


  // const updateNote = { title, content, folderId, tags };

  Note.findByIdAndUpdate(id, thingsToUpdate, { new: true })
    .then(result => {
      if (result) {
        res.status(204).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;