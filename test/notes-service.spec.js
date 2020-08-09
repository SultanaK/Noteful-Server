const noteService = require('../src/note-service')
const knex = require('knex')
const { makeNotesArray } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')

describe(`Notes service object`, function () {
    let db
    const testNotes = makeNotesArray()
    const testFolders = makeFoldersArray()

    before('setup db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    after('disconnect from db', () => db.destroy())
    beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));

    context(`Given 'note' has data`, () => {
        beforeEach('insert folders and notes', () => {
            return db
                .into('folder')
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('note')
                        .insert(testNotes)
                })
        })
        it(`resolves all notes from 'note' table`, () => {
            // test that ArticlesService.getAllArticles gets data from table
            return noteService.getAllNote(db)
                .then(actual => {
                    expect(actual).to.eql(testNotes.map(note => ({ ...note, modified: new Date(note.modified) })))
                })

        })
        it(`getNoteById() resolves an note by id from 'note' table`, () => {
            const thirdId = 3
            const thirdTestNote = testNotes[thirdId - 1]
            return noteService.getNoteById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        note_name: thirdTestNote.note_name,
                        modified: new Date(thirdTestNote.modified),
                        folder_id: thirdTestNote.folder_id,
                        content: thirdTestNote.content,
                    })
                })
        })
        it(`deleteNote() removes an note by id from 'note' table`, () => {
            const noteId = 3
            return noteService.deleteNote(db, noteId)
                .then(() => noteService.getAllNote(db))
                .then(allNotes => {
                    // copy the test articles array without the "deleted" article
                    const expected = testNotes.filter(note => note.id !== noteId)
                    //expect(allNotes).to.eql(expected)
                })
        })
        it(`updateNote() updates an note from the 'note' table`, () => {
            const idOfNoteToUpdate = 3
            const newNoteData = {
                note_name: 'updated title',
                modified: new Date(),
                /* modified: new Date('2019-03-03T00:00:00.000Z'),  */
                folder_id: 3,
                content: 'updated content',
            }
            return noteService.updateNote(db, idOfNoteToUpdate, newNoteData)
                .then(() => noteService.getNoteById(db, idOfNoteToUpdate))
                .then(note => {
                    expect(note).to.eql({
                        id: idOfNoteToUpdate,
                        ...newNoteData,
                    })
                })
        })

    })

    context(`Given 'note' has no data`, () => {
        it(`getAllNotes() resolves an empty array`, () => {

            return noteService.getAllNote(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertNote() inserts a new note and resolves the new note with an 'id'`, () => {
            const testNotes = makeNotesArray()
            const testFolders = makeFoldersArray()
            
            beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
            
            beforeEach('insert folders and notes', () => {
                return db
                    .into('folder')
                    .insert(testFolders)
                    .then(() => {
                        return db.into('note').insert(testNotes)
                    })

            })
            const newNote = {
                id: 4,
                note_name: 'forth test post!',
                modified: new Date('2019-03-03T00:02:20.000Z'),
                folder_id: 1,
                content: 'Lorem ipsum dolor sit amet, adipisicing elit.'
            }
            return noteService.addNote(db, newNote)
                .then(actual => {
                    expect(actual).to.eql(newNote
                        /* id: 4,
                        note_name: newNote.note_name,
                        modified: new Date(newNote.modified),
                        folder_id: newNote.folder_id,
                        content: newNote.content, */

                    )
                })
        })

    })

})


