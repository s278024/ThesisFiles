'use strict';

const db = require('./db');

exports.getWordInfo = function(words){
    return new Promise((resolve, reject) =>{
        let query = '';
        for(var i = 0; i < words.length; i++){
            if(i == 0){
                query = ' wordName = ? ';
            } else {
                query += 'OR wordName = ? ';
            }
        }
        const sql = "SELECT relationValue, wordName FROM WORDS WHERE"+query;
        db.all(sql, [...words], (err, rows) =>{
            if(err){
                reject(err);
            } else {
                let vett = [];
                let isPresent = 0;
                var result = rows.map(elem => elem.relationValue);
                for(var i in words){
                    for(var j in rows){
                        if(words[i] == rows[j].wordName){
                            isPresent = 1;
                            break;
                        }
                        isPresent = 0;
                    }
                    if(isPresent == 0){
                        vett.push(words[i]); 
                    }
                    isPresent = 0;
                }
                resolve({vettConcept: vett, resultQuery: result});
            }
        })
    })
}

exports.writeInfoInDB = function(hasContext, word){
    return new Promise((resolve, reject) =>{
        const sql = 'INSERT INTO WORDS(wordName, relationType, relationValue) VALUES(?, ?, ?)';
        db.run(sql, [word, "hasContext", hasContext], function(err){
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve(true);
            }
        })
    })
}

exports.getGasFunction = function(gas){
    return new Promise((resolve, reject) =>{
        let sql = "SELECT functionName, gasCost FROM GAS WHERE fileName = ? AND (";
        for(var i = 0; i < gas.functions.length; i++){
            if(i == 0){
                sql += "functionName = ? ";
            } else {
                sql += "OR functionName = ? ";
            }
        }
        sql += ")";
        db.all(sql, [gas.file, ...gas.functions], (err, rows) =>{
            if(err){
                console.log(err);
                reject(err);
            } else {
            let toCalculate = [];
            let isPresent = 0;
            let res = rows.map((el) => {return {name: el.functionName, gas: el.gasCost}});
            for(var i = 0; i < gas.functions.length; i++){
                for(var j = 0; j < rows.length; j++){
                    if(gas.functions[i] == rows[j].functionName){
                        isPresent = 1;
                        break;
                    }
                }
                if(isPresent == 0){
                    toCalculate.push(gas.functions[i]);
                }
                isPresent = 0;
            }
            resolve({result: res, toCalculate: toCalculate, file: gas.file});
        }
        })
    })
}

exports.writeGasOnDb = function(gas, functionName, fileName){
    return new Promise((resolve, reject) =>{
        const sql = 'INSERT INTO GAS(functionName, fileName, gasCost) VALUES(?, ?, ?)';
        db.run(sql, [functionName, fileName, gas], function(err){
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve(true);
            }
        }) 
    })
}