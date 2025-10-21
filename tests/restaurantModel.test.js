jest.mock('../bin/bdd', () => {
    return {
        all: jest.fn(),
        get: jest.fn(),
        run: jest.fn()
    };
});

const dbMock = require('../bin/bdd');
const Restaurant = require('../models/restaurantModel');

describe('Restaurant model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll returns', done => {
        const rows = [
            { id: 1, name: 'Resto A', address: 'Addr', phone: '123', opening_hours: '18-22' }
        ];
        dbMock.all.mockImplementationOnce((sql, params, cb) => cb(null, rows));
        dbMock.get.mockImplementationOnce((sql, params, cb) => cb(null, { total: 1 }));

        Restaurant.getAll({ sort: 'name', limit: 5, offset: 0 }, (err, result) => {
            expect(err).toBeNull();
            expect(result).toBeDefined();
            expect(result.total).toBe(1);
            expect(result.data).toEqual(rows);
            expect(dbMock.all).toHaveBeenCalled();
            expect(dbMock.get).toHaveBeenCalled();
            done();
        });
    });



    test('create inserts and returns', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.lastID = 100;
            cb.call(this, null);
        });

        const payload = { name: 'New Resto', address: 'addr', phone: '000', opening_hours: '10-22' };
        Restaurant.create(payload, (err, resto) => {
            expect(err).toBeNull();
            expect(resto).toBeDefined();
            expect(resto.id).toBe(100);
            expect(resto.name).toBe(payload.name);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('findById returns a restaurant', done => {
        const row = { id: 2, name: 'Resto B', address: 'Addr B', phone: '456', opening_hours: '8-20' };
        dbMock.get.mockImplementationOnce((sql, params, cb) => cb(null, row));

        Restaurant.findById(2, (err, resto) => {
            expect(err).toBeNull();
            expect(resto).toEqual(row);
            expect(dbMock.get).toHaveBeenCalled();
            done();
        });
    });

    test('update returns number', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.changes = 1;
            cb.call(this, null);
        });

        Restaurant.update(5, { name: 'Updated Name' }, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(1);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('deleteById returns ', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.changes = 1;
            cb.call(this, null);
        });

        Restaurant.deleteById(7, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(1);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('update with no fields returns 0 changes', done => {
        Restaurant.update(1, {}, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(0);
            done();
        });
    });
});