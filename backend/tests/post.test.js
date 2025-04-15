const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

describe('Post Endpoints', () => {
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
        await Post.deleteMany();

        user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: '123456',
            course: 'ADS',
            registration: '12345'
        });

        token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    });

    describe('POST /api/posts', () => {
        it('should create a new post', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Test post content'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('content', 'Test post content');
            expect(res.body.user).toBe(user.id);
        });

        it('should not create a post without content', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/posts', () => {
        it('should get all posts', async () => {
            await Post.create([
                { content: 'Post 1', user: user.id },
                { content: 'Post 2', user: user.id }
            ]);

            const res = await request(app)
                .get('/api/posts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
        });
    });

    describe('PUT /api/posts/:id', () => {
        it('should update a post', async () => {
            const post = await Post.create({
                content: 'Original content',
                user: user.id
            });

            const res = await request(app)
                .put(`/api/posts/${post.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Updated content'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.content).toBe('Updated content');
        });

        it('should not update a post that does not belong to the user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: '123456',
                course: 'ADS',
                registration: '54321'
            });

            const post = await Post.create({
                content: 'Original content',
                user: otherUser.id
            });

            const res = await request(app)
                .put(`/api/posts/${post.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Updated content'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/posts/:id', () => {
        it('should delete a post', async () => {
            const post = await Post.create({
                content: 'Post to delete',
                user: user.id
            });

            const res = await request(app)
                .delete(`/api/posts/${post.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(await Post.findById(post.id)).toBeNull();
        });
    });
}); 