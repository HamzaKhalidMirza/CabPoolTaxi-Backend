const fs = require('fs');

module.exports = file => {
    console.log('Hello');
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if(err) reject (`Could not found the file ${file}`);
            resolve(data);
        })
    });
};