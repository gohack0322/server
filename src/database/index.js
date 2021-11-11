const mysql      = require('mysql');

const connections = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'game'
});

module.exports = connections