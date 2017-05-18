"use strict";
(function(){
    /* Pre-Requisites */
    var fs = require('fs');
    var crypto = require("sjcl");
    var file = "site.db";
    var exists = fs.existsSync(file);
    var sqlite3 = require("sqlite3").verbose();
    // Additional salt which ensures that if the database is stolen, there is still an unknown hash available
    var pepper = "055F5207C6EE27F0A34BF22EB846D3A2CDB7C31C37A7C97F906A2E0C9D805631"

    var DBClass = function(){
        /* Database Settings */
        this.db = new sqlite3.Database(file);
    }

    var toHex = function(x)
    {
        return ("00000000" + (x < 0 ? 0xffffffff + x + 1 : x).toString(16).toUpperCase()).slice(-8);
    }

    var getSecureSalt = function()
    {
        return crypto.random.randomWords(8).map(toHex).join("");
    }

    var hashPassword = function(password, salt)
    {
        return crypto.hash.sha256.hash(salt + password + pepper).map(toHex).join("")
    }

    var validatePassword = function(password, hash, salt)
    {
        return hashPassword(password, salt) == hash
    }

    /* Database Helper Methods */
    /*DBClass.prototype.getUser = function(username, password){
        return new Promise((resolve, reject)=> {
            this.db.serialize(()=> {
                this.db.get("SELECT id FROM users WHERE username = ? AND password = ?", username, password, (err, row)=> {
                    if (row) resolve();
                    else reject("Unable to retrieve user.");
                });
            });
        });
    }*/

    DBClass.prototype.validate = function(username, password)
    {
        return new Promise((resolve, reject)=>
        {
            this.db.serialize(() =>
            {
                this.db.get("SELECT password, salt FROM users WHERE username = ?", username, (err, row) =>
                {
                    if (validatePassword(password, row.password, row.salt))
                    {
                        console.log("Password verified");
                        resolve();
                    }
                    else
                    {
                        console.log("Password or username rejected");
                        reject("Invalid Username or Password");
                    }
                });
            });
        });
    }

    DBClass.prototype.register = function(username, password)
    {
        return new Promise((resolve, reject)=>
        {
            this.db.serialize(() =>
            {
                this.db.get("SELECT id FROM users WHERE username = ?", username, (err, row) =>
                {
                    if (row) reject("Username already taken");
                    else
                    {
                        var salt = getSecureSalt();
                        var hash = hashPassword(password, salt);
                        this.db.run("INSERT INTO users (\"username\", \"password\", \"salt\") VALUES (?, ?, ?)", username, hash, salt);
                        resolve();
                    }
                });
            });
        });
    }

    module.exports = new DBClass();
})();
