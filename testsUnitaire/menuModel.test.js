// Faire des tests avec de la merde dedans

jest.mock('../bin/bdd', () => {
    return {
        all: jest.fn(),
        get: jest.fn(),
        run: jest.fn()
    };
});

const dbMock = require('../bin/bdd'); // get the mocked instance
const Menu = require('../services/menuModel');

describe('Menu model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll returns object', done => {
        const rows = [
            { id: 1, restaurant_id: 2, name: 'Menu A', description: '', price: 10, category: 'main' }
        ];
        dbMock.all.mockImplementationOnce((sql, params, cb) => cb(null, rows));
        dbMock.get.mockImplementationOnce((sql, params, cb) => cb(null, { total: 1 }));

        Menu.getAll({ sort: 'name', limit: 5, offset: 0 }, (err, result) => {
            expect(err).toBeNull();
            expect(result).toBeDefined();
            expect(result.total).toBe(1);
            expect(result.data).toEqual(rows);
            expect(dbMock.all).toHaveBeenCalled();
            expect(dbMock.get).toHaveBeenCalled();
            done();
        });
    });



    test('create inserts and returns created object', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.lastID = 42;
            cb.call(this, null);
        });

        const payload = { restaurant_id: 3, name: 'New Menu', description: 'desc', price: 12.5, category: 'dessert' };
        Menu.create(payload, (err, menu) => {
            expect(err).toBeNull();
            expect(menu).toBeDefined();
            expect(menu.id).toBe(42);
            expect(menu.name).toBe(payload.name);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('update returns number of changed rows', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.changes = 1;
            cb.call(this, null);
        });

        Menu.update(5, { name: 'Updated' }, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(1);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('deleteById returns changes count', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.changes = 1;
            cb.call(this, null);
        });

        Menu.deleteById(7, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(1);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('update with no fields returns 0 changes', done => {
        Menu.update(1, {}, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(0);
            done();
        });
    });
});
