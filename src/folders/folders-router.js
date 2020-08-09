const express = require('express')
const FolderService = require('../folder-service')
const foldersRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss')

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: folder.folder_name,
    
})
/* const serializefolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name),
    modified: (folder.modified),
    folder_id: (folder.folder_id),
    content: xss(folder.content),
}) */
foldersRouter
    .route('/')
    .get((req, res, next) => {
        FolderService.getAllFolder(req.app.get('db'))
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { folder_name} = req.body
        const newFolder = { folder_name }
        for (const [key, value] of Object.entries(newFolder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
        FolderService.addFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })
foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FolderService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist.` }
                    })
                }
                res.folder = folder // save the article for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
/* foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FolderService.getNoteByFolderId(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist.` }
                    })
                }
                res.folder = folder // save the article for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    }) */

    .get((req, res, next) => {
        res.json({
            id: res.folder.id,
            folder_name: xss(res.folder.folder_name), 
            
        })
    })
    
        
    
    
module.exports = foldersRouter