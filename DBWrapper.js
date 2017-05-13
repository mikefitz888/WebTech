(function(){
	/* Pre-Requisites */
	var fs = require('fs');
	var file = "site.db";
	var exists = fs.existsSync(file);
	var sqlite3 = require("sqlite3").verbose();

	var DBClass = function(){
		/* Database Settings */
		this.db = new sqlite3.Database(file);
	}

	/* Database Helper Methods */
	DBClass.prototype.getUser = function(username, password){
		return new Promise((resolve, reject)=>{
			this.db.serialize(()=>{
				this.db.get("SELECT id FROM users WHERE username = ? AND password = ?", username, password, (err, row)=>{
					if(row) resolve();
					else reject("Unable to retrieve user.");
				});
			});
		});
	}

	module.exports = new DBClass();
})();