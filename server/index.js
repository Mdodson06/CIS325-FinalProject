const express = require('express');
    const app = express();
        //Not sure if it's necessary, just copied from previous asg 
        app.use(express.json()); 
        app.use(express.urlencoded({ extended: true })); 
        app.use(express.static('public')); 
const cors = require('cors');
    app.use(cors())
const sqlite3 = require('sqlite3').verbose();

//Where to run code
app.listen(8080, () => { //Can do port 3000? Vite automatically runs on 5173
    console.log('server listening on port 8080')
})


//main page
//TODO: Add button to navigate to login/signup 
app.get('/', (req, res) => {
    res.send('Hello from our server!')
})


//TODO: Connect world/character to login (Add userID foreign key to both)
//SQL-injection prevention reference: https://planetscale.com/blog/how-to-prevent-sql-injection-attacks-in-node-js
const db = new sqlite3.Database('creation.db');
let loggedInUser = null; //ID of the currently signed in user
//TODO: Remove hard coded user 

// Set up character, world, and login tables
db.run(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);

//(outside of scope, push to next update)
    //TODO: Add user id fk and ON DELETE CASCADE for both 
    //TODO: Add an ID for the user to select by so not passing actual id for security but can still have multiple characters/worlds with the exact same info (AUs)
//TODO: Delete tables to update the info on the server 
db.run(`
CREATE TABLE IF NOT EXISTS world (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    landscape LONGTEXT,
    landmarks MEDIUMTEXT, 
    colorPallete TEXT,
    backstory LONGTEXT    
);
`);
db.run(`
CREATE TABLE IF NOT EXISTS character (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age TEXT,
    pronouns TEXT,
    gender TEXT,
    sexuality TEXT,
    race TEXT,
    backstory LONGTEXT,
    colorPallete TEXT,
    worldID INT,
    FOREIGN KEY(worldID) REFERENCES world(id) ON DELETE SET NULL
);
`);



//Checks for the presences of a given username/email AND password
//returns "pass" for every "value" returned to maintain security
app.get('/api/login/verify', (req, res) => {
    const { username="", email="", password="" } = req.body;
    //If password not provided or neither username nor email provided
    //Should be handled client-side but just in case
    if(password == "" || 
        ((username == "") && (email == ""))
    ) {
        return res.status(500).json({error: "username \/ email or password not provided: {username=" + username + ", email=" + email + "}"}) 
    }
    let query = `SELECT 'pass' AS 'message' FROM user WHERE password = ? AND `; //So it doesn't directly pass what the id is
    let user = "";    
    if (email != "") {
        query += "email = ?";
        user = email;
    } else if(username !="") { //doesn't check if both are provided because both should be unique so shouldn't matter 
        query += "username = ?"; 
        user = username;
    }
    db.all(query, [password, user], (err,rows) =>{
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//Logs user in
//NOTE: Very similar to /verify, only change is that actually signs them in
//Possibly can combine, but believe verify will be needed beyond logging in so separated
// 04/20/2025 changed body to query as GET won't allow body when not in the postman test for some reason??????? 
//Looked it up and something about not best practice but I don't get why and can't find what REST endpoint is best practice instead 
//So just taking the security hit of it being in the url for this project
app.get('/api/login/loginAttempt', (req, res) => {
    console.log("~~~");
    console.log(req.query);
    console.log("Logged in? " + loggedInUser);
    const { username="", email="", password="" } = req.query || ""; //NOTE: || "" prevents errors if the body isn't provided at all
    //If password not provided or neither username nor email provided
    //Should be handled client-side but just in case
    if(password == "" || 
        ((username == "") && (email == ""))
    ) {
        return res.status(500).json({error: "(loginAttempt) username \/ email or password not provided: {username=" + username + ", email=" + email + "}"}) 
    }
    let query = `SELECT id, username FROM user WHERE password = ? AND `; //So it doesn't directly pass what the id is
    let user = "";    
    if (email != "") {
        query += "email = ?";
        user = email;
    } else if(username !="") { //doesn't check if both are provided because both should be unique so shouldn't matter 
        query += "username = ?"; 
        user = username;
    }
    db.all(query, [password, user], (err,rows) =>{
        if (err) return res.status(500).json({ error: err.message });
        if(rows.length == 1) {
            loggedInUser = rows[0].id;
            console.log("Logged in ID: " + loggedInUser);
            return res.json({"entry":"pass", "message" : rows[0].username}); //TODO: just return the username?
        } else if(rows.length == 0) {
            return res.json({"entry" : "denied"});
        } else {
            return res.status(500).json({error: "multiple rows with given user/email and password"});
        }
    });
});

//Updates to specified information
app.put('/api/login/update', (req, res) => {
    const { username="", email="", newPassword="", oldPassword=""} = req.body;
    if(loggedInUser==null) {
        return res.status(500).json({error:"User not logged in"})
    } else if(oldPassword == "") {
        return res.status(500).json({error: "old password not provided"}) 
    } else if(username=="" && email=="" && newPassword=="") {
        return res.status(200).json({message:"No updates to make"})
    }
    let query = "SELECT password FROM user WHERE id=?";
    db.all(query, [loggedInUser],function (err, row) {
        if (err) return res.status(500).json({ error: err.message }); 
        console.log("ROWS: " + row.length);
        if(row.length == 0) {
            return res.json({message:"ID not found"})
        }
        else if (row[0].password != oldPassword) {
            return res.json({message:"denied"});
        }
    });
    
    
    fields = [];
    values = [];
    
    query = "UPDATE user SET ";
    
    //verify which ones (doesn't allow empty strings)
    if(username != "") {
        fields.push("username");
        values.push(username);
    }
    if(email != "") {
        fields.push("email");
        values.push(email);
    }
    if(newPassword != "") { //Already checked that oldPassword != ""
        fields.push("password"); //newPassword saved under password column 
        values.push(newPassword);
    }
    values.push(loggedInUser);
    //let result = "";
    for (let i = 0; i < fields.length; i++) {
        //result += "\n - " + fields[i] + ": " + values[i];
        query += fields[i] + " = ?"
        if (i != (fields.length-1)) {
            query += ", "
        }
    }
    query += " WHERE id = ?"; //NOTE: doesn't properly stop from responding successful if id doesn't exist in the table

    if(loggedInUser!=null) {
        console.log("POST ID: " + loggedInUser);
        console.log("QUERY: " + query);
    }
    
    //UNIQUE check handled by sql error
    db.run(query, values, function (err) { if (err) return res.status(500).json({ error: err.message }); 
    //res.json({ message: "\"" + name + "\" saved successfully!" });
    res.json({ message: "user info updated successfully!" });
    });
});

app.post('/api/login/signup', (req, res) => {
    console.log(req.body);
    const { username="", email="", password=""} = req.body;
    if(password == "" || username == "" || email == "") {
        return res.status(500).json({error: "all fields must be filled"}); 
    }
    let query = "INSERT INTO user (username, email, password) VALUES(?, ?, ?)";
    console.log(query);
    console.log([username, email, password]);
    db.run(query, [username, email, password], function (err) { if (err) return res.status(500).json({ error: err.message }); 
    loggedInUser = this.lastID;
    res.json({ entry: "pass" });
    });
//    res.json({entry:"testing"});
});

//NOTE: only need app.something if navigating backend which we shouldn't
//Handle shifting to a logout screen on the frontend
app.post('/api/login/logout/', (req, res) => {
    console.log("API called");
    if(loggedInUser == null) {
        return res.status(500).json({ error: "No user logged in" });
    } else {
        loggedInUser = null;
        return res.status(200).json({message: "logged out"});
    }
});

app.delete('/api/login/deleteUser', (req, res) => {
    /* const { username="", email="", password=""} = req.body;
    if(password == "" || username == "" || email == "") {
        return res.status(500).json({error: "all fields must be filled"}); 
    } */
    if(loggedInUser == null) {
        return res.status(500).json({error: "No user signed in"}); 
    }

    let query = "DELETE FROM user WHERE id = ?";
    //TODO: Delete all character/world where id=?
    db.run(query, loggedInUser, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        loggedInUser = null;
        res.json({ message: 'Record deleted successfully' }); //NOTE: Currently returns success even if the id didn't exist before
    });
});


//MAIN SITE
//get 

//SQL query displaying name of (all) characters and/or worlds (and the type if both)
app.get('/api/creation', (req, res) => {
    const { tableName, name=""} = req.query;// || ""; //if tableName not included in the query or tableName is undefined
    if(!((tableName == "all") ||
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table: " + tableName})
    }
    console.log("tableName: " + tableName);
    let query = "";
    switch(tableName) {
        case "character":
            query += `SELECT character.id, character.name, 'character' AS type FROM character`;
            query += ` WHERE character.name LIKE "%`;
            query += name +`%"`;
            break;
        case "world":
            query += `SELECT world.id, world.name, 'world' AS type FROM world`;
            query += ` WHERE world.name LIKE "%`;
            query += name +`%"`;
            break;
        case "all":
            query += `SELECT character.id, character.name, 'character' AS type FROM character`;
            query += ` WHERE character.name LIKE "%`;
            query += name +`%"`;
            query += ` UNION ALL 
            SELECT world.id, world.name, 'world' AS type FROM world`;
            query += ` WHERE world.name LIKE "%`;
            query += name +`%"`;
    }
    query += ";";
    
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message + " (tableName = " + tableName + ")"});
        res.json(rows);
        });
});

//Gets the id of all matching
//Used for checking before inserting/deleting
//TODO: Update with any other exact specification things found to be needed after starting client-side
app.get('/api/creation/verify', (req, res) => {
    const {tableName, name} = req.query;
    if(name===undefined || !(//(tableName == "all") ||
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table or id {tableName=" + tableName + ", id=" + id + "}"})
    }
    query = "SELECT id FROM " + tableName + " WHERE name=?";

    db.all(query, name, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message + " (tableName = " + tableName + ")"});
            console.log(rows);
            res.json(rows);
            });

});

//Gets advanced search
//TODO: Handle combining character and world search on client-side
//worldName only for when searching characters looking at the worldName associated with them 
app.get('/api/creation/advanced', (req, res) => {
    const {tableName, anyField, name, age, pronouns, gender, sexuality, race, worldName, landscape, landmarks} = req.query; //anyField="" to default to empty string if undefined
    if(!(//(tableName == "all") ||
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table: " + tableName})
    }
    //TODO: Definitely a better way to do this but couldn't figure out how to pass an array yet
    //Run checks for which are defined
    let fields = [];
    let values = [];
    if(!(name === undefined)) {
        fields.push("name");
        values.push(name);
    }
    if(!(age === undefined) && tableName=="character") {
        fields.push("age");
        values.push(age);
    }
    if(!(pronouns === undefined) && tableName=="character") {
        fields.push("pronouns");
        values.push(pronouns);
    }
    if(!(gender === undefined) && tableName=="character") {
        fields.push("gender");
        values.push(gender);
    }
    if(!(sexuality === undefined) && tableName=="character") {
        fields.push("sexuality");
        values.push(sexuality);
    }
    if(!(race === undefined) && tableName=="character") {
        fields.push("race");
        values.push(race);
    }
    if(!(landscape === undefined) && tableName=="world") {
        fields.push("landscape");
        values.push(landscape);
    }
    if(!(landmarks === undefined) && tableName=="world") {
        fields.push("landmarks");
        values.push(landmarks);
    }

    let query = "";
    switch (tableName) {
        case "character":
            query = `SELECT character.id, character.name,character.age,character.pronouns,character.gender, character.sexuality, character.race, character.backstory,character.colorPallete, world.name AS "world" 
                    FROM character
                    LEFT JOIN world
                    ON character.worldID=world.id WHERE `;
            if(anyField === undefined && worldName === undefined && fields.length == 0) { //if no specifications (to make WHEREs easier)
                query += "TRUE";
                break;
            } else {
                query += "FALSE";
            }
            if(!(anyField === undefined)) //anyField different than others so has to be handled separately 
            {
                query += ` OR character.name LIKE "%`;
                query += anyField + `%" OR character.age LIKE "%`;
                query += anyField + `%" OR character.pronouns LIKE "%`;
                query += anyField + `%" OR character.gender LIKE "%`;
                query += anyField + `%" OR character.sexuality LIKE "%`;
                query += anyField + `%" OR character.race LIKE "%`;
                query += anyField + `%" OR world.name LIKE "%`;
                query += anyField + `%"`;
            }
            if(!(worldName === undefined)) { //only for if searching in characters for a world
                query += ` OR world.name LIKE "%`;
                query += worldName + `%"`;
            }
            for (let i = 0; i < fields.length; i++) {
                query += " OR character." + fields[i] + ` LIKE "%` + values[i] + `%"`;
            }
            break;
        case "world":
            query += `SELECT world.id, world.name, world.landscape, world.landmarks, world.colorPallete 
                        FROM world 
                        WHERE `;
            if(anyField === undefined && worldName === undefined && fields.length == 0) { //if no specifications (to make WHEREs easier) (worldName shouldn't be defined for a world but to prevent worse errors)
                query += "TRUE";
                break;
            } else {
                query += "FALSE";
            }
            if(!(anyField === undefined)) //anyField different than others so has to be handled separately 
            {
                query += ` OR world.name LIKE "%`;
                query += anyField + `%" OR world.landscape LIKE "%`;
                query += anyField + `%" OR world.landmarks LIKE "%`;
                query += anyField + `%"`;
            }
            for (let i = 0; i < fields.length; i++) {
                query += " OR world." + fields[i] + ` LIKE "%` + values[i] + `%"`;
            }
            break;
        default:
            break;
    }
    query += ";";
    
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message + " (tableName = " + tableName + ")"});
        console.log(rows);
        res.json(rows);
        });
});

//SQL query displaying all info of a specific character or world (by id)
//Currently no reason to select all info of all characters/worlds (separate, can't do union without complications)
//But present, just commented out
//TODO: Gather id info onClick from client side
app.get('/api/creation/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    const id = req.query.id || -1;
    //console.log("ID = " + id + "\ntableName = " + tableName);
    
    if(id== -1 || 
        !(
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table or id {tableName=" + tableName + ", id=" + id + "}"})
    }
    
    let query; 
    if(tableName == "character") {
        query = `SELECT character.name, character.age, character.pronouns, character.gender, character.sexuality, character.race, character.backstory, character.colorPallete, world.name AS "world" 
        FROM character 
        LEFT JOIN world
        ON character.worldID=world.id`;
        //WHERE character.id=?`;
    } else if(tableName == "world") { //TODO: Add SELECT for all character info for that world either here or separate call
        query = `SELECT world.name AS "world", landscape, landmarks, colorPallete 
        FROM world`;
        //WHERE id=?`;
    } else{
        return res.status(500).json({error: "tableName check failed"}); //Shouldn't be reached, just in case
    }
    
    //If looking for a specific world/character
    if(id != -1 && tableName == "character") {
        //("ID = " + id + "tableName = " + tableName);
        query += " WHERE character.id =?"
    } else if (id != -1 && tableName == "world") {
        //console.log("ID = " + id + "tableName = " + tableName);
        query += " WHERE world.id =?"
    }
    /* if(id == -1) {
        db.all(query, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
            });
    } else { */
        db.all(query, id, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
            });
    //}
});

//SQL query displaying all info character info from a world (by id)
app.get('/api/creation/world/:id/', (req, res) => {
    const {id} = req.params;
    let query = `SELECT character.name, age, pronouns, gender, sexuality, race
        FROM character 
        LEFT JOIN world
        ON character.worldID=world.id
        WHERE world.id=?`;
    db.all(query, id, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
        });
});
//TODO: GET a world/character by name to help users who may accidentally try to make a new when they want to update


//post
//Using x-www-form-urlencoded, NOT form-data (throws error that the post parameters (not what's given, what is checked, like name not nameTest) don't exist)
    //Updated note: Seems to actually have to do with the way postman handles things on their side? 
//SQL query to insert the (verified) form data into the (param) table  
app.post('/api/creation/:tableName/', (req, res) => {
    const {tableName} = req.params;
    if(!(tableName == "character" || tableName == "world")) {
        return res.status(500).json({error: "not a valid table: " + tableName});
    } else if (tableName == "character") {
        //Assign and check if there are undefined variables
        let {name, age, pronouns, gender, sexuality, race, backstory, colorPallete, worldID} = req.body || ""; //"NA"; fixes error if use form-data but returns undefined not "NA" (didn't check with null)
        if(name === undefined || age === undefined || pronouns === undefined || 
            gender === undefined || sexuality === undefined || race === undefined || 
            backstory === undefined || colorPallete === undefined || worldID === undefined) {
                return res.status(500).json({error: "All fields need to be defined. Are one of the fields missing?"});
            }

        //all assigned a value; convert empty strings to nulls then insert
        //character name should be ensured client-side, but backup check server-side as well
        //TODO: Handle check if age or worldID are a number, or if worldID is a real world, on client-side
        else {
            if(name == "") name = "untitled";
            if(age == "") age = null; //**NEEDS to be set, other okay to be empty string 
            if(pronouns == "") pronouns = null;
            if(gender == "") gender = null;
            if(sexuality == "") sexuality = null;
            if(race == "") race = null;
            if(backstory == "") backstory = null;
            if(colorPallete == "") colorPallete = null; //Probably needs to be set?
            if(worldID == "") worldID = null;//**NEEDS to be set, other okay to be empty string 
        }
        //let result = "\n - Name: " + name + "\n - Age: " + age + "\n - Pronouns: " + pronouns + "\n - Gender: " + gender + "\n - Sexuality: " + sexuality + "\n - Race: " + race + "\n - Backstory: " + backstory + "\n - colorPallete: " + colorPallete +"\n - worldID: " + worldID;
        //res.send("Character variables: " + result);
        const query = ` INSERT INTO character (name, age, pronouns, gender, sexuality, race, backstory, colorPallete, worldID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `;
        db.run(query, [name, age, pronouns, gender, sexuality, race, backstory, colorPallete, worldID], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "\"" + name + "\" saved successfully!" });
        }); 
    } else {
        let {name, landscape, landmarks, colorPallete, backstory} = req.body;
        if(name === undefined || landscape === undefined || landmarks === undefined || 
            colorPallete === undefined || backstory === undefined) {
                return res.status(500).json({error: "All fields need to be defined. Are one of the fields missing?"});
        }
        
        //all assigned a value; convert empty strings to nulls then insert
        //world name should be ensured client-side, but backup check server-side as well
        else {
            if(name == "") name = "untitled";
            if(landscape == "") landscape = null;
            if(landmarks == "") landmarks = null;
            if(backstory == "") backstory = null;
            if(colorPallete == "") colorPallete = null; //Probably needs to be set?
        }
        //let result = "\n - Name: " + name + "\n - landscape: " + landscape + "\n - landmarks: " + landmarks + "\n - colorPallete: " + colorPallete + "\n - Backstory: " + backstory;
        //res.send("World variables: " + result);
        const query = ` INSERT INTO world (name, landscape, landmarks, backstory, colorPallete) VALUES (?, ?, ?, ?, ?) `;
        db.run(query, [name, landscape, landmarks, backstory, colorPallete], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "\"" + name + "\" saved successfully!" });
        }); 
    }
  });

//update

//Client-side, pass empty string to change a value to null
//Don't call the key if you don't want to change 
//TODO: Handle client-side making everything properly int and worldID actual worldID
//TODO: Handle if id is not properly provided
//Oh wait okay I think postman takes it as literally ":id" if a value isn't provided; shouldn't cause issues when I actually call if it's properly handled client-side 
app.put('/api/creation/:tableName/:id', (req, res) => {
    console.log("IN UPDATE API");
    const tableName = req.params.tableName || "";
    const id = req.params.id || -1; //doesn't work; 
    let fields = [];
    let values = [];
    //let name = req.body.name || "ERROR";
    if(!(tableName == "character" || tableName == "world") || id == -1) {
        return res.status(500).json({error: "invalid table or id {tableName=" + tableName + ", id=" + id + "}"})
    } else if (tableName == "character") {
        //Assign and check for empty variables
        let {name, age, pronouns, gender, sexuality, race, backstory, colorPallete, worldID} = req.body || ""; 

        //character name should be ensured client-side, but backup check server-side as well
        if(name == "") name = "untitled";
        if(age == "") age = null;//**NEEDS to be set, other okay to be empty string 
        if(pronouns == "") pronouns = null;
        if(gender == "") gender = null;
        if(sexuality == "") sexuality = null;
        if(race == "") race = null;
        if(backstory == "") backstory = null;
        if(colorPallete == "") colorPallete = null; //Probably needs to be set?
        if(worldID == "") worldID = null;//**NEEDS to be set, other okay to be empty string
        
        //only query the fields that they want to update
        if(!(name === undefined)) {
            fields.push("name");
            values.push(name);
        }
        if(!(age === undefined)) {
            fields.push("age");
            values.push(age);
        }
        if(!(pronouns === undefined)) {
            fields.push("pronouns");
            values.push(pronouns);
        }
        if(!(gender === undefined)) {
            fields.push("gender");
            values.push(gender);
        }
        if(!(sexuality === undefined)) {
            fields.push("sexuality");
            values.push(sexuality);
        }
        if(!(race === undefined)) {
            fields.push("race");
            values.push(race);
        }
        if(!(backstory === undefined)) {
            fields.push("backstory");
            values.push(backstory);
        }
        if(!(colorPallete === undefined)) {
            fields.push("colorPallete");
            values.push(colorPallete);
        }
        if(!(worldID === undefined)) {
            fields.push("worldID");
            values.push(worldID);
        }        
    } else {
        let {name, landscape, landmarks, colorPallete, backstory} = req.body;
        
        //world name should be ensured client-side, but backup check server-side as well
        if(name == "") name = "untitled";
        if(landscape == "") landscape = null;
        if(landmarks == "") landmarks = null;
        if(backstory == "") backstory = null;
        if(colorPallete == "") colorPallete = null; //Probably needs to be set?
        let result = "\n - Name: " + name + "\n - landscape: " + landscape + "\n - landmarks: " + landmarks + "\n - colorPallete: " + colorPallete + "\n - Backstory: " + backstory;
        res.send("World variables: " + result);


        //only query the fields that they want to update
        if(!(name === undefined)) {
            fields.push("name");
            values.push(name);
        }
        if(!(landscape === undefined)) {
            fields.push("landscape");
            values.push(landscape);
        }
        if(!(landmarks === undefined)) {
            fields.push("landmarks");
            values.push(landmarks);
        }
        if(!(colorPallete === undefined)) {
            fields.push("colorPallete");
            values.push(colorPallete);
        }
        if(!(backstory === undefined)) {
            fields.push("backstory");
            values.push(backstory);
        }

        /* const query = ` INSERT INTO world (name, landscape, landmarks, backstory, colorPallete) VALUES (?, ?, ?, ?, ?) `;
        db.run(query, [name, landscape, landmarks, backstory, colorPallete], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "\"" + name + "\" saved successfully!" });
        });  */
    }
    values.push(id);
    let query = "UPDATE character SET ";
    //let result = "";
    for (let i = 0; i < fields.length; i++) {
        //result += "\n - " + fields[i] + ": " + values[i];
        query += fields[i] + " = ?"
        if (i != (fields.length-1)) {
            query += ", "
        }
    }
    query += " WHERE id = ?"
    db.run(query, values, function (err) { if (err) return res.status(500).json({ error: err.message }); 
    //res.json({ message: "\"" + name + "\" saved successfully!" });
    res.json({ message: tableName + " saved successfully!" });
    });
});


//delete

//TODO: Handle client-side check when world being deleted if there are any characters
//Give option to delete the characters or make them homeless (worldID=null)
//TODO: Handle client-side check if the character/world exists (too complicated to have custom error here)
//deletes all data for the given ID
app.delete('/api/creation/:tableName/:id', (req, res) => {
    console.log("DELETE called");
    const { tableName, id } = req.params;
    if(!((tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table or id {tableName=" + tableName + ", id=" + id + "}"})
    }

    /* 
    //Failed attempt at check first
    query = "SELECT id FROM " + tableName + " WHERE id=?;"
    db.run(query, id, function (err, rows) {
        if (err) return res.status(500).json({ error: err.message });
        //res.json({ message: 'Record deleted successfully' });
        const check = 2;
        if(check === undefined) {
            console.log("ID does not exist: " + id);
            return res.json({ message: tableName + " does not exist so cannot be deleted" });
        } else {

        }
    }); */
    
    //Actually delete
    let query = "DELETE FROM "  + tableName + " WHERE id = ?";
    db.run(query, id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Record deleted successfully' });
    });
  });