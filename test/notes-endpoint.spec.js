const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray, makeMaliciousNote, makeNewNote, makeUpdatedNote } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')

describe('Notes Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)

    })
    //console.log(process.env.TEST_DB_URL)
    after('disconnect from db', () => db.destroy())
    beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));


    describe(`GET /api/notes`, () => {
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })
        })


        context('Given there are articles in the database', () => {
            const testNotes = makeNotesArray()
            const testFolders = makeFoldersArray()
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
            it('responds with 200 and the specified article', () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200, expectedNote)
            })

            /* it('GET /api/notes responds with 200 and all of the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            }) */
        })
        context(`Given an XSS attack article`, () => {
            const { maliciousNote, expectedNote } = makeMaliciousNote()
            const testNotes = makeNotesArray()
            const testFolders = makeFoldersArray()
            beforeEach('insert malicious note', () => {
                return db
                    .into('folder')
                    .insert(testFolders)
                    .then(() => {
                        return db.into('note').insert([maliciousNote])
                    })
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/notes`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].note_name).to.eql(expectedNote.note_name)
                        expect(res.body[0].modified).to.eql(expectedNote.modified)
                        expect(res.body[0].folder_id).to.eql(expectedNote.folder_id)
                        expect(res.body[0].content).to.eql(expectedNote.content)
                    })
            })
        })
        describe(`GET /api/notes/:note_id`, () => {
            context(`Given no notes`, () => {
                it(`responds with 404`, () => {
                    const noteId = 123456
                    return supertest(app)
                        .get(`/api/notes/${noteId}`)
                        .expect(404, { error: { message: `Note doesn't exist.` } })
                })
            })


            context('Given there are notes in the database', () => {
                const testNotes = makeNotesArray()
                const testFolders = makeFoldersArray()
                beforeEach('insert notes', () => {
                    return db
                        .into('folder')
                        .insert(testFolders)
                        .then(() => {
                            return db.into('note').insert(testNotes)
                        })
                })

                it('GET /api/notes/:note_id responds with 200 and the specified note', () => {
                    const noteId = 2
                    const expectedNote = testNotes[noteId - 1]
                    return supertest(app)
                        .get(`/api/notes/${noteId}`)
                        .expect(200, expectedNote)
                })
            })

        })
    })

    describe(`POST /api/notes`, () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray()

        beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));

        beforeEach('insert folders and notes', () => {
            return db.into('folder').insert(testFolders)
                //.then(() => {
                //    return db.into('note').insert(testNotes)
               // })
        })
        it(`responds with 200 and the created note`, () => {
            
            const testNotes = makeNewNote()[0]; //get object from array
            console.log(testNotes)
            return supertest(app)
                .post('/api/notes')
                .send(testNotes)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(testNotes.note_name)
                    expect(res.body.content).to.eql(testNotes.content)
                    expect(res.body.folder_id).to.eql(testNotes.folder_id)
                });
        });
        //});

        it(`creates note, responding with 201 and the new note`, function () {
            this.retries(3)
            const newNote = {
                note_name: 'Test new article',
                modified: ('2019-01-03T00:00:00.000Z'),
                folder_id: 1,
                content: 'Test new article content...'
            }
            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name)
                   // expect(res.body.modified).to.eql(newNote.modified)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                    const expected = new Intl.DateTimeFormat('en-US').format(new Date())
                    const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.modified))
                    expect(actual).to.eql(expected)


                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                )


        })
        const requiredFields = ['note_name', 'folder_id', 'content']

        requiredFields.forEach(field => {
            const newNote = {
                note_name: 'Test new note',
                modified: '2019-01 - 03T00: 00: 00.000Z',
                folder_id: 1,
                content: 'Test new note content...'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newNote[field]

                return supertest(app)
                    .post('/api/notes')
                    .send(newNote)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })
})
describe(`DELETE /api/notes/:note_id`, () => {
    const testNotes = makeNotesArray()
    const testFolders = makeFoldersArray()
    
    context(`Given no notes`, () => {
        before('make knex instance', () => {
            db = knex({
                client: 'pg',
                connection: process.env.TEST_DB_URL,
            })
            app.set('db', db)

        })  
        beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
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
        it(`responds with 404`, () => {
            const noteId = 123456
            return supertest(app)
                .delete(`/api/notes/${noteId}`)
                .expect(404, { error: { message: `Note doesn't exist.` } })
        })
    })

    context('Given there are notes in the database', () => {
        const testNotes = makeNotesArray()
        const testFolders=makeNotesArray()
        
        before('make knex instance', () => {
            db = knex({
                client: 'pg',
                connection: process.env.TEST_DB_URL,
            })
            app.set('db', db)

        }) 
       /*  beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
        beforeEach('insert folders and notes', () => {
            return db
                .into('folder')
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('note')
                        .insert(testNotes)
                })
        }) */
        it('responds with 204 and removes the note', () => {
            beforeEach('clean the table', () => db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
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
            const testNotes = makeNotesArray()
            const testFolders = makeNotesArray()
            
            const idToRemove = 2
            const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
            return supertest(app)
                .delete(`/api/notes/${idToRemove}`)
                .expect(204)
                .then(() =>
                    supertest(app)
                        .get(`/api/notes`)
                        .expect(expectedNotes)
                )
        })
    })

})
    /* describe(`PATCH /api/notes`, () => {
context(`Given no notes in the database`, () => {
    it(`responds with 400 error when non-existent note is patched`, () => {
        const fakeNoteId = 8696886;

        return supertest(app)
            .patch(`/api/notes/${fakeNoteId}`)
            .expect(404);
    });
});

context(`Given notes in the database`, () => {
    const testFolders = makeFoldersArray();
    const testNotes = makeNotesArray();

    beforeEach('insert folders and notes', () => {
        return db.into('folders')
            .insert(testFolders)
            .then(() => {
                return db
                    .into('notes')
                    .insert(testNotes)
            });
    });

    it(`responds with 400 error when wrong field is sent`, () => {
        const fakeNote = makeFakeNote()[0]; //extract note for object

        return supertest(app)
            .patch(`/api/notes/${fakeNote.note_id}`)
            .send(fakeNote)
            .expect(400);
    });

    it(`responds with 200 message when note is updated succesfully`, () => {
        const updatedNote = makeUpdatedNote()[0];

        return supertest(app)
            .patch(`/api/notes/${updatedNote.note_id}`)
            .send(updatedNote)
            .expect(204)
            .then(() => {
                supertest(app)
                    .get(`/api/notes/${updatedNote.note_id}`)
                    .expect(201)
                    .expect(res => { //test case when all fields were updated
                        expect(res.body.note_name).to.eql(testNote.note_name)
                        expect(res.body.content).to.eql(testNote.content)
                        expect(res.body.folder_id).to.eql(testNote.folder_id)
                    })
            });
    });
});
}); */





