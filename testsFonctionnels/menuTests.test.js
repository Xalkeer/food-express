const request = require('supertest');
const express = require('express');
const menuRouter = require('../routes/menuServices');
const Menu = require('../models/menuModel');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/menus', menuRouter);

const SECRET = process.env.JWT_SECRET || 'testsecret';

let adminToken;
let menuId, otherMenuId;

beforeAll(async () => {
    // create initial menus
    await new Promise(resolve => {
        Menu.create({ restaurant_id: 1, name: 'InitMenu', description: 'desc', price: 5.5, category: 'cat' }, (err, menu) => {
            if (menu) menuId = menu.id;
            resolve();
        });
    });
    await new Promise(resolve => {
        Menu.create({ restaurant_id: 1, name: 'OtherMenu', description: '', price: 7.0, category: 'starter' }, (err, menu) => {
            if (menu) otherMenuId = menu.id;
            resolve();
        });
    });

    adminToken = jwt.sign({ id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' }, SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await new Promise(resolve => Menu.deleteAll(() => resolve()));
});

describe('Menu Endpoints', () => {
    it('should create a menu (admin)', async () => {
        const res = await request(app)
            .post('/menus/create')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ restaurant_id: 1, name: 'TestMenu', description: 't', price: 9.99, category: 'main' });
        expect(res.status).toBe(201);
        expect(res.body.menu).toHaveProperty('id');
    });

    it('should get public paginated menus', async () => {
        const res = await request(app)
            .get('/menus')
            .query({ limit: 10, offset: 0 });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get menus for one restaurant (public)', async () => {
        const res = await request(app)
            .get('/menus/restaurant/1');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin should get all menus', async () => {
        const res = await request(app)
            .get('/menus/all')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin should get a menu by id', async () => {
        const res = await request(app)
            .get(`/menus/${menuId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(menuId);
    });

    it('admin should update a menu by id', async () => {
        const res = await request(app)
            .put(`/menus/${menuId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'UpdatedMenu' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/mis à jour/);
    });

    it('admin should delete a menu by id', async () => {
        let tempId;
        await new Promise(resolve => {
            Menu.create({ restaurant_id: 1, name: 'Temp', description: '', price: 4.5, category: 'side' }, (err, menu) => {
                if (menu) tempId = menu.id;
                resolve();
            });
        });

        const res = await request(app)
            .delete(`/menus/${tempId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/supprimé/);
    });

    it('admin should delete all menus', async () => {
        await new Promise(resolve => {
            Menu.create({ restaurant_id: 1, name: 'ToDeleteAll', description: '', price: 3.0, category: 'dessert' }, () => resolve());
        });

        const res = await request(app)
            .delete('/menus')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/menus supprimés/);
    });
});