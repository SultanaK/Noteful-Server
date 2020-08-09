function makeNotesArray() {
    return [
        {
            id: 1,
            note_name: 'First test post!',
            modified: '2019-01-03T00:00:00.000Z',
            folder_id: 1,
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
        },
        {
            id: 2,
            note_name: 'second test post!',
            modified: '2019-03-03T00:00:00.000Z',
            folder_id: 1,
            content: 'Lorem ipsum dolor sit amet, elit.'
        },
        {
            id: 3,
            note_name: 'third test post!',
            modified: '2019-03-03T00:00:00.000Z',
            folder_id: 3,
            content: 'Lorem ipsum dolor sit amet, adipisicing elit.'
        },
        {
            id: 4,
            note_name: 'forth test post!',
            modified: '2019-02-03T00:00:00.000Z',
            folder_id: 3,
            content: 'Lorem ipsum dolor sit amet forth, adipisicing elit.'
        }, 
   ] 
}
function makeNewNote() {
    return [
        {
            note_name: 'New Test Note 3',
            folder_id: 1,
            content: 'New Test Note 3 Content',
        }
    ]
}

function makeUpdatedNote() {
    return [
        {
            note_id: 1,
            note_name: 'Updated Test Note 3',
            folder_id: 2,
            content: 'Updated Test Note 3 Content',
        }
    ]
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        note_name: 'How-to',
        modified: '2019-02-03T00:00:00.000Z',
        folder_id: 2,
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.` 
    }
    const expectedNote= {
        ...maliciousNote,
        note_name: 'How-to',
        modified: '2019-02-03T00:00:00.000Z',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousNote,
        expectedNote,
    }
}

module.exports = {
    makeNotesArray,
    makeNewNote,
    makeUpdatedNote,
    makeMaliciousNote,
}