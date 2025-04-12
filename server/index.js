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


//CREATION DATABASE
const db = new sqlite3.Database('creation.db');

// Set up character and world tables
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
    age INT,
    pronouns TEXT,
    gender TEXT,
    sexuality TEXT,
    race TEXT,
    backstory LONGTEXT,
    colorPallete TEXT,
    worldID INT,
    FOREIGN KEY(worldID) REFERENCES world(id)
);
`);

//get 

//SQL query displaying name of (all) characters and/or worlds (and the type if both)
app.get('/api/creation', (req, res) => {
    const tableName = req.query.tableName;// || ""; //if tableName not included in the query or tableName is undefined
    if(!((tableName == "all") ||
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table: " + tableName})
    }

    let query = "SELECT name";
    if(tableName == "character") {
        query += " FROM character";
    } else if(tableName == "world") {
        query += " FROM world";
    } else if(tableName == "all") {
        query += `, 'character' AS type FROM character 
                  UNION ALL 
                  SELECT name, 'world' AS type FROM world`;
    }
    query += ";";
    
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message + "(tableName = " + tableName + ")"});
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
    console.log("ID = " + id + "\ntableName = " + tableName);

    if(id== -1 || 
        !(
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid table or id {tableName=" + tableName + ", id=" + id + "}"})
    }
    
    let query; 
    if(tableName == "character") {
        query = `SELECT character.name, age, pronouns, gender, sexuality, race, backstory, character.colorPallete, world.name AS "world" 
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
        console.log("ID = " + id + "tableName = " + tableName);
        query += " WHERE character.id =?"
    } else if (id != -1 && tableName == "world") {
        console.log("ID = " + id + "tableName = " + tableName);
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
        let {name, age, pronouns, gender, sexuality, race, backstory, colorPallete, worldID} = req.body || null; //"NA"; fixes error if use form-data but returns undefined not "NA" (didn't check with null)
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
    const tableName = req.params.tableName;
    const id = req.params.id; // || -1 doesn't work; 
    let fields = [];
    let values = [];
    //let name = req.body.name || "ERROR";
    if(!(tableName == "character" || tableName == "world")) {
        return res.status(500).json({error: "invalid table or id {tableName=" + tableName + ", id=" + id + "}"})
    } else if (tableName == "character") {
        //Assign and check for empty variables
        let {name, age, pronouns, gender, sexuality, race, backstory, colorPallete, worldID} = req.body || null; 

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
        if(!(worldID === undefined)) {
            fields.push("worldID");
            values.push(worldID);
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