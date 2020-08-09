const folderService = require('../src/folder-service')
const knex = require('knex')
const { makeFoldersArray } = require('./folders.fixtures')


describe(`Folders service object`, function () {
    let db
    const testFolder = makeFoldersArray()
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })
    after(() => db.destroy())
    beforeEach(() => db.raw('TRUNCATE note,folder RESTART IDENTITY CASCADE'))
        //db('folder').truncate())
    afterEach('cleanup', () => db.raw('TRUNCATE note,folder RESTART IDENTITY CASCADE'))
   // beforeEach(() => db.into('folder').insert(testFolder))

    context(`Given 'folder' has data`, () => {
        beforeEach(() => {
            return db
                .into('folder')
                .insert(testFolder)
        })
        it(`resolves all Folder from 'folder' table`, () => {
            // test that ArticlesService.getAllArticles gets data from table
            return folderService.getAllFolder(db)
                .then(actual => {
                    expect(actual).to.eql(testFolder)
                })

        })
        it(`getfolderById() resolves an folder by id from 'folder' table`, () => {
            const thirdId = 3
            const thirdTestfolder = testFolder[thirdId - 1]
            return folderService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        folder_name: thirdTestfolder.folder_name,

                    })
                })
        })


    })




    context(`Given 'folder' has no data`, () => {
        it(`getAllFolder() resolves an empty array`, () => {
            return folderService.getAllFolder(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
    })
    it(`insertfolder() inserts a new folder and resolves the new noye with an 'id'`, () => {
        const newfolder = {
            id: 4,
            folder_name: 'forth test post!',
        }
        return folderService.addFolder(db, newfolder)
            .then(actual => {
                expect(actual).to.eql({
                    id: 4,
                    folder_name: newfolder.folder_name,


                })
            })


    })

})


