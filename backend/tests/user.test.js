const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('User Endpoints', () => {
    let token;
    let user;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany();

        user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: '123456',
            course: 'ADS',
            registration: '12345'
        });

        token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    });

    describe('GET /api/users', () => {
        it('should get all users', async () => {
            await User.create({
                name: 'Another User',
                email: 'another@example.com',
                password: '123456',
                course: 'ADS',
                registration: '54321'
            });

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]).not.toHaveProperty('password');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get a user by id', async () => {
            const res = await request(app)
                .get(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Test User');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should return 404 if user not found', async () => {
            const res = await request(app)
                .get('/api/users/123456789012345678901234')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update a user', async () => {
            const res = await request(app)
                .put(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Name',
                    email: 'updated@example.com'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Updated Name');
            expect(res.body.email).toBe('updated@example.com');
        });

        it('should not update another user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: '123456',
                course: 'ADS',
                registration: '54321'
            });

            const res = await request(app)
                .put(`/api/users/${otherUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Name'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete a user', async () => {
            const res = await request(app)
                .delete(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(await User.findById(user.id)).toBeNull();
        });

        it('should not delete another user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: '123456',
                course: 'ADS',
                registration: '54321'
            });

            const res = await request(app)
                .delete(`/api/users/${otherUser.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(401);
        });
    });
}); 