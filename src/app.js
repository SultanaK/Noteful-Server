require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
//const noteService = require('./note-service')
//const jsonParser = express.json()
const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/notes', notesRouter);
app.use('/api/folders', foldersRouter);

app.get('/', (req, res) => {
  res.send('Hello, From Noteful server!!')
})
/* app.get('/notes', (req, res, next) => {
  const knexInstance = req.app.get('db')
  noteService.getAllNote(knexInstance)
    .then(notes => {
      res.json(notes)
    })
    .catch(next)
})

app.get('/notes/:note_id', (req, res, next) => {
  //res.json({ 'requested_id': req.params.note_id, this: 'should fail' })
  const knexInstance = req.app.get('db')
  noteService.getNoteById(knexInstance, req.params.note_id)
    .then(note => {
      if (!note) {
        return res.status(404).json({
          error: { message: `Note doesn't exist.` }
        })
      }
      res.json(note)
    })
    .catch(next)
})
app.post('/notes', jsonParser, (req, res, next) => {
  const { note_name, modified, folder_id, content } = req.body
  const newNote = { note_name, modified, folder_id, content }
      noteService.addNote(
            req.app.get('db'),
            newNote
          )
          .then(note => {
              res
                .status(201)
                .location(`/notes/${note.id}`)

                  .json(note)
              })
          .catch(next)

    }) */
app.use(function errorHandler(error, req, res, next) {

  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)

})


module.exports = app;
