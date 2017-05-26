"use strict";
(() => {
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
                this.db.get("SELECT password, salt FROM users WHERE username = ?", username.toLowerCase(), (err, row) =>
                {
                    if (row && validatePassword(password, row.password, row.salt))
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

    DBClass.prototype.getName = function(username)
    {
        console.log('getName('+username+')');
        return new Promise((resolve, reject) =>
        {
            this.db.serialize(() =>
            {
                this.db.get("SELECT givenname FROM users_givenname WHERE userid IN (SELECT id FROM users WHERE username = ?)", username, (err, row) =>
                {
                    if (!row) this.db.get("SELECT fullname FROM users_fullname WHERE userid IN (SELECT id FROM users WHERE username = ?)", username, (err, row) =>
                    {
                        if (row) resolve(row.fullname);
                        else reject("User has no name!");
                    });
                    else resolve(row.givenname);
                });
            });
        });
    }

    DBClass.prototype.register = function(form)
    {
        var username = form.username.toLowerCase();
        var password = form.password;
        var fullname = form.name;
        var givenname = form.given_name;
        var accountno = form.account_number;
        var sortcode = form.sort_code;
        var role;
        switch (form.role)
        {
            case "user":
                role = 1;
                break;
            case "helper":
                role = 2;
                break;
            case "both":
                role = 3;
                break;
        }
        return new Promise((resolve, reject)=>
        {
            this.db.serialize(() =>
            {
                this.db.get("SELECT id FROM users WHERE username = ?", username, (err, row) =>
                {
                    if (row) reject("username fault");
                    else
                    {
                        var salt = getSecureSalt();
                        var hash = hashPassword(password, salt);
                        this.db.serialize(() =>
                        {
                            this.db.run("BEGIN");
                            this.db.run("CREATE TEMPORARY TABLE IF NOT EXISTS ti_users(new_id INTEGER)");
                            this.db.run("DELETE FROM ti_users");
                            this.db.run("INSERT INTO users (\"username\", \"password\", \"salt\") VALUES (?, ?, ?)", username, hash, salt);
                            this.db.run("INSERT INTO ti_users (\"new_id\") VALUES (last_insert_rowid())");
                            this.db.run("INSERT INTO users_fullname (\"userid\", \"fullname\") SELECT new_id, ? FROM ti_users", fullname);
                            if (givenname != "") this.db.run("INSERT INTO users_givenname (\"userid\", \"givenname\") SELECT new_id, ? FROM ti_users", givenname);
                            if (role & 1) this.db.run("INSERT INTO users_role (\"userid\", \"roleid\") SELECT new_id, 1 FROM ti_users");
                            if (role & 2)
                            {
                                this.db.run("INSERT INTO users_role (\"userid\", \"roleid\") SELECT new_id, 2 FROM ti_users");
                                this.db.run("INSERT INTO users_bankdetails (\"userid\", \"accountno\", \"sortcode\") SELECT new_id, ?, ? FROM ti_users", accountno, sortcode);
                            }
                            this.db.run("COMMIT");
                            resolve();
                        });
                    }
                });
            });
        });
    }

    module.exports = new DBClass();
})();
