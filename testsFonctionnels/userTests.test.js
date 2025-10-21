// food-express/testsFonctionnels/userTests.test.js
const request = require('supertest');
const express = require('express');
const userRouter = require('../routes/userServices');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/users', userRouter);

const SECRET = process.env.JWT_SECRET || 'testsecret';

let userToken, adminToken, userId, adminId;

beforeAll(async () => {
    await new Promise(resolve => {
        User.create({ name: 'User', email: 'user@example.com', password: 'pass' }, (err, user) => {
            userId = user.id;
            userToken = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'user' }, SECRET, { expiresIn: '1h' });
            resolve();
        });
    });
    await new Promise(resolve => {
        User.create({ name: 'Admin', email: 'admin@example.com', password: 'adminpass', role: 'admin' }, (err, user) => {
            adminId = user.id;
            adminToken = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'admin' }, SECRET, { expiresIn: '1h' });
            resolve();
        });
    });
});

afterAll(async () => {
    await new Promise(resolve => User.deleteAll(() => resolve()));
});

describe('User Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({ name: 'Test', email: 'pierre@example.com', password: 'pass', role: 'admin' });
        expect(res.status).toBe(201);
        expect(res.body.user).toHaveProperty('id');
    });

    it('should login and return a token', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ email: 'user@example.com', password: 'pass' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('user@example.com');
    });

    it('should update current user profile', async () => {
        const res = await request(app)
            .put('/users/me')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ name: 'UserUpdated' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('newtoken');
    });

    it('should delete current user account', async () => {
        let delUserId, delUserToken;
        await new Promise(resolve => {
            User.create({ name: 'DelUser', email: 'deluser@example.com', password: 'pass' }, (err, user) => {
                delUserId = user.id;
                delUserToken = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'user' }, SECRET, { expiresIn: '1h' });
                resolve();
            });
        });
        const res = await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${delUserToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/supprimé/);
    });

    it('admin should get all users', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin should update a user by id', async () => {
        const res = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'AdminUpdatedUser' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/modifié/);
    });

    it('admin should delete a user by id', async () => {
        let tempUserId;
        await new Promise(resolve => {
            User.create({ name: 'Temp', email: 'temp@example.com', password: 'pass' }, (err, user) => {
                tempUserId = user.id;
                resolve();
            });
        });
        const res = await request(app)
            .delete(`/users/${tempUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/supprimé/);
    });

    it('admin should delete all users', async () => {
        await new Promise(resolve => {
            User.create({ name: 'ToDelete', email: 'todelete@example.com', password: 'pass' }, () => resolve());
        });
        const res = await request(app)
            .delete('/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Tous les utilisateurs/);
    });
});