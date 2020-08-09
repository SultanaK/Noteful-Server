const express = require('express')
const NoteService = require('../note-service')
const notesRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss')

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: note.modified,
    folder_id: note.folder_id,
    content: xss(note.content),
})
/* const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: (note.modified),
    folder_id: (note.folder_id),
    content: xss(note.content),
}) */
notesRouter
    .route('/')
    .get((req, res, next) => {
        NoteService.getAllNote(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { note_name, folder_id, content } = req.body
        const newNote = { note_name, folder_id, content }
        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
        NoteService.addNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })
notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NoteService.getNoteById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist.` }
                    })
                }
                res.note = note // save the article for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(serializeNote(res.note))

        /* const knexInstance = req.app.get('db')
        NoteService.getNoteById(knexInstance, req.params.note_id)
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist.` }
                    })
                }
                res.json(serializeNote(note))
            })
            .catch(next) */
    })
    .delete((req, res, next) => {
        NoteService.deleteNote(
            req.app.get('db'),
            req.params.note_id,
            /* res.note.note_id; */

        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)

    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const updateNoteId = res.note.note_id;
        const { note_name, folder_id,content,  } = req.body;
        const updatedNote = { note_name, folder_id,content,  };

        //check that at least one field is getting updated in order to patch
        const numberOfValues = Object.values(updatedNote).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain either 'note_name', 'content', or 'folder_id'` }
            });
        }

        updatedNote.date_modified = new Date();

        NotesService.updateNote(knexInstance, updateNoteId, updatedNote)
            .then(() => res.status(204).end())
            .catch(next);
    });

module.exports = notesRouter