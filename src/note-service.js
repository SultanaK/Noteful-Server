'use strict'
const NotesService = {
    getAllNote(knexInstance) {
        return knexInstance
            .select('*')
            .from('note')
            .then(note => {
                return note;
            });
    },
    addNote(knexInstance, note) {
        return knexInstance
            .insert(note)
            .into('note')
            .returning('*')
            .then(note => {
                return note[0];
            });
    },

    getNoteById(knexInstance, id) {
        return knexInstance
            .from('note')
            .select('*')
            .where('id', id)
            .first();
    },

    deleteNote(knexInstance, id) {
        return knexInstance('note')
            .where({ id })
            .delete();
    },
    updateNote(knexInstance, id, newNoteFields) {
        return knexInstance('note')
            .where({ id })
            .update(newNoteFields);
        
    },
    /* insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('note')
            .returning('*')
            .then(rows => {
                return rows[0]
            })

    }, */
}

module.exports = NotesService
