jest.mock('../bin/bdd', () => {
    return {
        all: jest.fn(),
        get: jest.fn(),
        run: jest.fn()
    };
});

const dbMock = require('../bin/bdd');
const User = require('../models/userModel');

describe('User model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('all returns list of users', done => {
        const rows = [
            { id: 1, name: 'Alice', email: 'a@x.com', role: 'user' }
        ];
        dbMock.all.mockImplementationOnce((sql, params, cb) => cb(null, rows));

        User.all((err, users) => {
            expect(err).toBeNull();
            expect(users).toEqual(rows);
            expect(dbMock.all).toHaveBeenCalled();
            done();
        });
    });

    test('create inserts and returns created user', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.lastID = 55;
            cb.call(this, null);
        });

        const payload = { name: 'Bob', email: 'b@x.com', password: 'secret' };
        User.create(payload, (err, user) => {
            expect(err).toBeNull();
            expect(user).toBeDefined();
            expect(user.id).toBe(55);
            expect(user.name).toBe(payload.name);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('findById returns a user', done => {
        const row = { id: 2, name: 'Carol', email: 'c@x.com', role: 'admin' };
        dbMock.get.mockImplementationOnce((sql, params, cb) => cb(null, row));

        User.findById(2, (err, user) => {
            expect(err).toBeNull();
            expect(user).toEqual(row);
            expect(dbMock.get).toHaveBeenCalled();
            done();
        });
    });

    test('update returns number', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.changes = 1;
            cb.call(this, null);
        });

        User.update(5, { name: 'Updated Name' }, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(1);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('deleteById returns', done => {
        dbMock.run.mockImplementationOnce(function (sql, params, cb) {
            this.changes = 1;
            cb.call(this, null);
        });

        User.deleteById(7, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(1);
            expect(dbMock.run).toHaveBeenCalled();
            done();
        });
    });

    test('update with no fields returns 0 changes', done => {
        User.update(1, {}, (err, changes) => {
            expect(err).toBeNull();
            expect(changes).toBe(0);
            done();
        });
    });
});