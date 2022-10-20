'use strict';

const sqlite = require('sqlite3').verbose();
const DBSOURCE = './db/conceptNet.db';

const db = new sqlite.Database(DBSOURCE, (err) => {
    if(err){
        console.error(err.message);
        throw err;
    }
})

module.exports = db;

