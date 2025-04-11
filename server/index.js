const express = require('express');
    const app = express();
        //Not sure if it's necessary, just copied from previous asg 
        app.use(express.json()); 
        app.use(express.urlencoded({ extended: true })); 
        app.use(express.static('public')); 
const cors = require('cors');
    app.use(cors())
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('creation.db');

//Where to run code
app.listen(8080, () => { //Can do port 3000? Vite automatically runs on 5173
    console.log('server listening on port 8080')
})


// Set up character and world tables
db.run(`
CREATE TABLE IF NOT EXISTS world (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    landscape LONGTEXT,
    landmarks MEDIUMTEXT
);
`);
db.run(`
CREATE TABLE IF NOT EXISTS character (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    pronouns TEXT,
    gender TEXT,
    sex TEXT,
    sexuality TEXT,
    race TEXT,
    backstory LONGTEXT,
    colorPallete TEXT,
    worldID TEXT,
    FOREIGN KEY(worldID) REFERENCES world(id)
);
`);


//main page
//TODO: Add button to navigate to login/signup 
app.get('/', (req, res) => {
    res.send('Hello from our server!')
})

 
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

    if(id==-1 || 
        !(
        (tableName == "character") || 
        (tableName == "world"))) 
    {
        return res.status(500).json({error: "invalid or id {tableName=" + tableName + ", id=" + id + "}"})
    }
    
    let query; 
    if(tableName == "character") {
        query = `SELECT character.name, age, pronouns, gender, sex, sexuality, race, backstory, character.colorPallete, world.name AS "world" 
        FROM character 
        LEFT JOIN world
        ON character.worldID=world.id`;
        //WHERE character.id=?`;
    } else if(tableName == "world") { //TODO: Add SELECT for all character info for that world either here or separate call
        query = `SELECT world.name AS "world", landscape, landmarks, colorPallete 
        FROM world`;
        //WHERE id=?`;
    } else{
        res.status(500).json({error: "tableName check failed"}); //Shouldn't be reached, just in case
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
    let query = `SELECT character.name, age, pronouns, gender, sex, sexuality, race
        FROM character 
        LEFT JOIN world
        ON character.worldID=world.id
        WHERE world.id=?`;
    db.all(query, id, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
        });
});