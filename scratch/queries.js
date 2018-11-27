const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// const NoteModel = mongoose.model('Note', notesSchema, 'note'); 
const searchTerm = 'Posuere';  
const regex = new RegExp(searchTerm, 'i'); 

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {

    // let filter = {};

    // if (searchTerm) {
    //   filter.title = regex;
    // }

    return Note.find(
        {
            $or:[
                {title:regex}, 
                {content:regex} 
            ]
        }
    )
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//   mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '5bfda311ce3f5f403857ef43';

//     return Note.findById(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//   Create a new note using Note.create

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const newObject = {
//         title:'remarkable', 
//         content: 'hmmmmm yea i think this counts as new content'
//     };

//     return Note.create(newObject);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//   Update a note by id using Note.findByIdAndUpdate

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '5bfda311ce3f5f403857ef43';
//     const newObject = {
//         title:'updated by id', 
//         content: 'hmmmmm yea i think this counts as new new content'
//     };

//     return Note.findByIdAndUpdate(id, newObject);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//   Delete a note by id using Note.findByIdAndRemove

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '5bfda311ce3f5f403857ef43';

//     return Note.findByIdAndRemove(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
