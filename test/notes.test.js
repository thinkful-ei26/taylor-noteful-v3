const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('notes API resource', function(){
    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
          .then(() => mongoose.connection.db.dropDatabase());
      });
    
      beforeEach(function () {
        return Note.insertMany(notes);
      });
    
      afterEach(function () {
        return mongoose.connection.db.dropDatabase();
      });
    
      after(function () {
        return mongoose.disconnect();
      });

    describe('GET endpoint', function() {

        it('should return all existing notes', function() {

        let res;
        return chai.request(app)
            .get('/api/notes')
            .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
            expect(res.body).to.have.lengthOf.at.least(1);
            return Note.count();
            })
            .then(function(count) {
            expect(res.body).to.have.lengthOf(count);
            });
        });


        it('should return notes with right fields', function() {
        // Strategy: Get back all notes, and ensure they have expected keys

        let resNotes;
        return chai.request(app)
            .get('/api/notes')
            .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.lengthOf.at.least(1);

            res.body.forEach(function(note) {
                expect(note).to.be.a('object');
                expect(note).to.include.keys(
                'id', 'title', 'content');
            });
            resNotes = res.body[0];
            return Note.findById(resNotes.id);
            })
            .then(function(note) {
                console.log(note); 
            expect(resNotes.id).to.equal(note.id);
            expect(resNotes.title).to.equal(note.title);
            expect(resNotes.content).to.equal(note.content);
            });
        });
    });
    describe('POST endpoint', function() {

        it('should add a new note', function() {
    
          const newNote = {
            "title": "some new title",  
            "content":"some new content"
          };
    
          return chai.request(app)
            .post('/api/notes')
            .send(newNote)
            .then(function(res) {
              expect(res).to.have.status(201);
              expect(res).to.be.json;
              expect(res.body).to.be.a('object');
              expect(res.body).to.include.keys(
                'title', 'content');    
              expect(res.body.id).to.not.be.null;
              expect(res.body.title).to.equal(newNote.title);
              expect(res.body.content).to.equal(newNote.content);
              return Note.findById(res.body.id);
            })
            .then(function(note) {
              expect(note.title).to.equal(newNote.title);
              expect(note.content).to.equal(newNote.content);
            });
        });
    });

    describe('PUT endpoint', function() {

        it('should update a note', function() {
    
          const updatedNote = {
            "title": "some updated title",  
            "content":"some updated content"
          };
          return Note
          .findOne()
          .then(function(note) {
            updatedNote.id = note.id;

            return chai.request(app)
              .put(`/api/notes/${note.id}`)
              .send(updatedNote);
          })
          .then(function(res) {
            expect(res).to.have.status(204);
  
            return Note.findById(updatedNote.id);
          })
          .then(function(note) {
            expect(note.name).to.equal(updatedNote.name);
            expect(note.cuisine).to.equal(updatedNote.cuisine);
          });
      });
    });

    describe('DELETE endpoint', function() {

        it('delete a note by id', function() {
          let note;
          return Note
            .findOne()
            .then(function(_note) {
              note = _note;
              return chai.request(app).delete(`/api/notes/${note.id}`);
            })
            .then(function(res) {
              expect(res).to.have.status(204);
              return Note.findById(note.id);
            })
            .then(function(_note) {
              expect(_note).to.be.null;
            });
        });
      });
})

