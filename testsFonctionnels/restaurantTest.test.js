const request = require('supertest');
const express = require('express');
const restaurantRouter = require('../routes/restaurantServices');
const Restaurant = require('../models/restaurantModel');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/restaurants', restaurantRouter);

const SECRET = process.env.JWT_SECRET || 'testsecret';

let adminToken;
let restaurantId, otherRestaurantId;

beforeAll(async () => {
    await new Promise(resolve => {
        Restaurant.create({ name: 'InitRestaurant', address: '1 Main St', phone: '0101010101', opening_hours: '09:00-21:00' }, (err, restaurant) => {
            if (restaurant) restaurantId = restaurant.id;
            resolve();
        });
    });
    await new Promise(resolve => {
        Restaurant.create({ name: 'OtherRestaurant', address: '2 Side St', phone: '0202020202', opening_hours: '08:00-20:00' }, (err, restaurant) => {
            if (restaurant) otherRestaurantId = restaurant.id;
            resolve();
        });
    });

    adminToken = jwt.sign({ id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' }, SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await new Promise(resolve => Restaurant.deleteAll(() => resolve()));
});

describe('Restaurant Endpoints', () => {
    it('should create a restaurant (admin)', async () => {
        const res = await request(app)
            .post('/restaurants/create')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'TestRestaurant', address: '3 Test Ave', phone: '0303030303', opening_hours: '10:00-22:00' });
        expect(res.status).toBe(201);
        expect(res.body.restaurant).toHaveProperty('id');
    });

    it('should get public paginated restaurants', async () => {
        const res = await request(app)
            .get('/restaurants')
            .query({ limit: 10, offset: 0 });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('admin should get all restaurants', async () => {
        const res = await request(app)
            .get('/restaurants/all')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin should get a restaurant by id', async () => {
        const res = await request(app)
            .get(`/restaurants/${restaurantId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(restaurantId);
    });

    it('admin should update a restaurant by id', async () => {
        const res = await request(app)
            .put(`/restaurants/${restaurantId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'UpdatedRestaurant' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/mis à jour/);
    });

    it('admin should delete a restaurant by id', async () => {
        let tempId;
        await new Promise(resolve => {
            Restaurant.create({ name: 'TempResto', address: '4 Temp St', phone: '0404040404', opening_hours: '11:00-23:00' }, (err, restaurant) => {
                if (restaurant) tempId = restaurant.id;
                resolve();
            });
        });

        const res = await request(app)
            .delete(`/restaurants/${tempId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/supprimé/);
    });

    it('admin should delete all restaurants', async () => {
        await new Promise(resolve => {
            Restaurant.create({ name: 'ToDeleteAll', address: '5 Delete Ln', phone: '0505050505', opening_hours: '07:00-19:00' }, () => resolve());
        });

        const res = await request(app)
            .delete('/restaurants')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/restaurants supprimés/);
    });
});