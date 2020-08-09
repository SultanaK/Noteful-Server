const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder, } = require('./folders.fixtures')

describe('Folders Endpoints', function () {
    let db
    let testFolders = makeFoldersArray();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)

    })

    after('disconnect from db', () => db.destroy())

/* before('clean the table', () => db('folder').truncate()) */
    before('clean the table', () => db.raw('TRUNCATE note,folder RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE note,folder RESTART IDENTITY CASCADE'))
    
    describe(`GET /api/folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })


        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()
            beforeEach('insert foldrs', () => {
                return db
                    .into('folder')
                    .insert(testFolders)
            })
            it('GET /api/folders responds with 200 and all of the folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })
        })
        context(`Given an XSS attack folder`, () => {
            const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

            beforeEach('insert malicious folder', () => {
                return db
                    .into('folder')
                    .insert([maliciousFolder])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/folders`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].note_name).to.eql(expectedFolder.note_name)
                        
                    })
            })
        })
        describe(`GET /api/folders/:folder_id`, () => {
            context(`Given no folders`, () => {
                it(`responds with 404`, () => {
                    const folderId = 123456
                    return supertest(app)
                        .get(`/api/folders/${folderId}`)
                        .expect(404, { error: { message: `Folder doesn't exist.` } })
                })
            })


            context('Given there are folders in the database', () => {
                const testFolders = makeFoldersArray()

                beforeEach('insert folders', () => {
                    return db
                        .into('folder')
                        .insert(testFolders)
                })

                it('GET /api/folders/:folder_id responds with 200 and the specified note', () => {
                    const folderId = 2
                    const expectedFolder = testFolders[folderId - 1]
                    return supertest(app)
                        .get(`/api/folders/${folderId}`)
                        .expect(200, expectedFolder)
                })
            })

        })
    })

    describe(`POST /api/folders`, () => {
        it(`creates note, responding with 201 and the new note`, function () {
            this.retries(3)
            const newFolder = {
                folder_name: 'Test new article',
            }
            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)     
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                   /*  const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actual = new Date(res.body.modified).toLocaleString('en', { timeZone: 'UTC' }) */
                   /*  expect(actual).to.eql(expected) */


                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/folders/${postRes.body.id}`)
                        .expect(postRes.body)
                )


        })
        const requiredFields = ['folder_name']

        requiredFields.forEach(field => {
            const newFolder = {
                folder_name: 'Test new note',
                
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFolder[field]

                return supertest(app)
                    .post('/api/folders')
                    .send(newFolder)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })

    })
    
})



