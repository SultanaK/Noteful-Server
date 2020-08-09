function makeFoldersArray() {
    return [
        {
            id: 1,
            folder_name: 'First test post!',
            
        },
        {
            id: 2,
            folder_name: 'second test post!',
            
        },
        {
            id: 3,
            folder_name: 'third test post!',
            
        },
        {
            id: 4,
            folder_name: 'forth test post!',
           
        },
    ]
}
function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        folder_name: 'How-to',
        
    }
    const expectedFolder = {
        ...maliciousFolder,
        folder_name: 'How-to',
        
    }
    return {
        maliciousFolder,
        expectedFolder,
    }
}

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder,
}