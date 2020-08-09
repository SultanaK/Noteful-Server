'use strict';
const FolderService = {
    getAllFolder(knexInstance) {
        return knexInstance
            .select('*')
            .from('folder')
            .then(folder => {
                return folder;
            });
    },
    /* getNoteByFolderId(knexInstance,folder_id) {
        return knexInstance
            .from('note')
            .select('*')
            .where('folder_id', folder_id)
            .first()
        
    }, */
    addFolder(knexInstance, folder) {
        return knexInstance
            .insert(folder)
            .into('folder')
            .returning('*')
            .then(folder => {
                return folder[0];
            });
    },

    getById(knexInstance, id) {
        return knexInstance
            .from('folder')
            .select('*')
            .where('id', id)
            .first();
    },
    deleteFolder(knex, id) {
        return knex('folder')
            .where('id', id)
            .delete();
    },
    updateFolder(knex, id, updatedFolder) {
        return knex('folder')
            .where('id', id)
            .update(updatedFolder)
    }

};
module.exports = FolderService;