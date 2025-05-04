const request = require ('supertest');
const index = require('../server/index.js');
const app = index.app;
const db = index.db;
const listener = index.listener;

describe("Connection tests", () => {
    test('check file found', () => {
        expect(index.checkingIndex()).toBe("success");
    });
    test('main page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });
    /* used to make sure npm run start:test auto stopped
    test('auto fail', async() => {
        const response = await request(app).get('/');
        expect(response.status).toBe(500);
    }); */
});

describe("User interactions", () => {
    const signUpUser = {username: "testUser1", email:"testEmail@email.com", password:"1234"};
    test('signup', async () => {
        const response = await request(app)
        .post('/api/login/signup')
        .send(signUpUser);
        /* 
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        */
       expect(response.status).toBe(200);
    });
    test('log out', async () => {
        const response = await request(app)
        .post('/api/login/logout');
        expect(response.status).toBe(200);
    });
    test('login' ,async () => {
        const response = await request(app)
        .get('/api/login/loginAttempt')
        .query(signUpUser);
        expect(response.status).toBe(200);
    });
    test('update' ,async () => {
        const updateUser = {username:"updatedUser1",email:"", newPassword:"",oldPassword:"1234"};
        const response = await request(app)
        .put('/api/login/update')
        .send(updateUser);
        expect(response.status).toBe(200);
    });
    test('delete', async() =>{
        const response = await request(app)
        .delete('/api/login/deleteUser');
        expect(response.status).toBe(200);
    });

});

describe("character checks", () => {
    const character = {name:"characterTest1",age:"100",pronouns:"he/him",gender:"male",sexuality:"",race:"",backstory:"",colorPallete:"",worldID:""};
    test('new character' ,async () => {
        const response = await request(app)
        .post('/api/creation/character')
        .send(character);
        expect(response.status).toBe(200);
    });
    test('general character search' ,async () => {
        const search = {tableName:"character", name:"Test"};
        const response = await request(app)
        .get('/api/creation')
        .query(search);
        expect(response.status).toBe(200);
    });
    test('advanced character search' ,async () => {
        const search = {tableName:"character", name:"Test"};
        const response = await request(app)
        .get('/api/creation/advanced')
        .query(search);
        expect(response.status).toBe(200);
    });
    test('update character',async () => {
        const updateUser = {name:"updateCharacter1"};
        const response = await request(app)
        .put('/api/creation/character/1')
        .send(updateUser);
        expect(response.status).toBe(200);
    });
});

describe("world checks", () => {
    const world = {name:"worldTest1",landscape:"landscapeTest",landmarks:"landmarksTest", backstory:"",colorPallete:""};
    test('new world' ,async () => {
        const response = await request(app)
        .post('/api/creation/world')
        .send(world);
        expect(response.status).toBe(200);
    });
    test('general world search' ,async () => {
        const search = {tableName:"world", name:"Test"};
        const response = await request(app)
        .get('/api/creation')
        .query(search);
        expect(response.status).toBe(200);
    });
    test('advanced world search' ,async () => {
        const search = {tableName:"world", name:"Test"};
        const response = await request(app)
        .get('/api/creation/advanced')
        .query(search);
        expect(response.status).toBe(200);
    });
    test('update world',async () => {
        const updateUser = {name:"updateWorld1"};
        const response = await request(app)
        .put('/api/creation/world/1')
        .send(updateUser);
        expect(response.status).toBe(200);
    });
});

describe("final creation checks", () => {
    test('general all search',async () => {
        const search = {tableName:"all", name:"Test"};
        const response = await request(app)
        .get('/api/creation')
        .query(search);
        expect(response.status).toBe(200);
    });
    test('delete character', async () => {
        const response = await request(app)
        .delete('/api/creation/character/1');
        expect(response.status).toBe(200);
    });
    test('delete world', async () => {
        const response = await request(app)
        .delete('/api/creation/world/1');
        expect(response.status).toBe(200);
    });
});

afterAll(() => {
    db.run(`DROP TABLE user;`);
    db.run(`DROP TABLE world;`);
    db.run(` DROP TABLE character;`);
    listener.close();
});