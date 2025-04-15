const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');

describe('Comment Endpoints', () => {
    let token;
    let user;
    let post;

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
        await Comment.deleteMany();

        user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: '123456',
            course: 'ADS',
            registration: '12345'
        });

        token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);

        post = await Post.create({
            content: 'Test post',
            user: user.id
        });
    });

    describe('POST /api/comments', () => {
        it('should create a new comment', async () => {
            const res = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Test comment',
                    postId: post.id
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('content', 'Test comment');
            expect(res.body.author).toBe(user.id);
            expect(res.body.post).toBe(post.id);
        });

        it('should not create a comment without content', async () => {
            const res = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    postId: post.id
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/comments/post/:postId', () => {
        it('should get all comments for a post', async () => {
            await Comment.create([
                { content: 'Comment 1', author: user.id, post: post.id },
                { content: 'Comment 2', author: user.id, post: post.id }
            ]);

            const res = await request(app)
                .get(`/api/comments/post/${post.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.comments).toHaveLength(2);
        });
    });

    describe('PUT /api/comments/:commentId', () => {
        it('should update a comment', async () => {
            const comment = await Comment.create({
                content: 'Original comment',
                author: user.id,
                post: post.id
            });

            const res = await request(app)
                .put(`/api/comments/${comment.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Updated comment'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.content).toBe('Updated comment');
        });

        it('should not update a comment that does not belong to the user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: '123456',
                course: 'ADS',
                registration: '54321'
            });

            const comment = await Comment.create({
                content: 'Original comment',
                author: otherUser.id,
                post: post.id
            });

            const res = await request(app)
                .put(`/api/comments/${comment.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Updated comment'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/comments/:commentId', () => {
        it('should delete a comment', async () => {
            const comment = await Comment.create({
                content: 'Comment to delete',
                author: user.id,
                post: post.id
            });

            const res = await request(app)
                .delete(`/api/comments/${comment.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(await Comment.findById(comment.id)).toBeNull();
        });
    });

    describe('POST /api/comments/:commentId/like', () => {
        it('should toggle like on a comment', async () => {
            const comment = await Comment.create({
                content: 'Test comment',
                author: user.id,
                post: post.id
            });

            // Like the comment
            const likeRes = await request(app)
                .post(`/api/comments/${comment.id}/like`)
                .set('Authorization', `Bearer ${token}`);

            expect(likeRes.statusCode).toBe(200);
            expect(likeRes.body.likes).toContain(user.id);

            // Unlike the comment
            const unlikeRes = await request(app)
                .post(`/api/comments/${comment.id}/like`)
                .set('Authorization', `Bearer ${token}`);

            expect(unlikeRes.statusCode).toBe(200);
            expect(unlikeRes.body.likes).not.toContain(user.id);
        });
    });
}); 