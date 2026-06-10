// API integration tests with an in-memory MongoDB.
// Set SKIP_DB_TESTS=1 to skip in environments that block binary downloads
// (CI runs them fully).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const SKIP = !!process.env.SKIP_DB_TESTS;

describe.skipIf(SKIP)('API', () => {
    let app, mongod, mongoose;
    let token, userId;

    beforeAll(async () => {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        mongoose = (await import('mongoose')).default;
        await mongoose.connect(mongod.getUri());
        const buildApp = (await import('../../server/app.js')).default;
        app = buildApp();
    });

    afterAll(async () => {
        if (mongoose) await mongoose.disconnect();
        if (mongod) await mongod.stop();
    });

    it('registers a user', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'farmer1', email: 'f1@example.com', password: 'secret123'
        });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
        token = res.body.token;
        userId = res.body.user.id;
    });

    it('logs in and selects a character', async () => {
        const login = await request(app).post('/api/auth/login').send({
            email: 'f1@example.com', password: 'secret123'
        });
        expect(login.status).toBe(200);

        const sel = await request(app)
            .post('/api/game/select-character')
            .set('Authorization', `Bearer ${token}`)
            .send({ characterId: 'sunny' });
        expect(sel.status).toBe(200);
    });

    it('rejects invalid snapshots and accepts valid schema-2 saves', async () => {
        const bad = await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({ gameProgress: { schema: 1, coins: 5 } });
        expect(bad.status).toBe(400);

        const negative = await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({ gameProgress: { schema: 2, coins: -5, level: 1, farms: {} } });
        expect(negative.status).toBe(400);

        const good = await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({
                gameProgress: {
                    schema: 2, saveVersion: 5, coins: 150, level: 2, xp: 10,
                    currentRegion: 'prairie', unlockedRegions: ['prairie'],
                    farms: { prairie: { seed: 1, restoration: 12.5, milestonesClaimed: [], plots: { '2,2': { tilled: true, crop: null } } } }
                }
            });
        expect(good.status).toBe(200);
        expect(good.body.saveVersion).toBe(5);
    });

    it('ignores stale saves (last-write-wins)', async () => {
        const stale = await request(app)
            .post('/api/game/save')
            .set('Authorization', `Bearer ${token}`)
            .send({ gameProgress: { schema: 2, saveVersion: 3, coins: 1, level: 1, farms: {} } });
        expect(stale.status).toBe(200);
        expect(stale.body.message).toMatch(/stale/i);

        const load = await request(app)
            .get('/api/game/load')
            .set('Authorization', `Bearer ${token}`);
        expect(load.body.gameProgress.saveVersion).toBe(5);
        expect(load.body.gameProgress.coins).toBe(150);
    });

    it('processes RevenueCat purchase webhooks and syncs coins', async () => {
        const evt = {
            event: {
                type: 'INITIAL_PURCHASE',
                app_user_id: userId,
                product_id: 'fag_coins_chest',
                price_in_purchased_currency: 4.99,
                transaction_id: 'tx_test_1'
            }
        };
        const unauth = await request(app).post('/api/payments/revenuecat/webhook').send(evt);
        expect(unauth.status).toBe(401);

        const ok = await request(app)
            .post('/api/payments/revenuecat/webhook')
            .set('Authorization', 'Bearer test_webhook_secret')
            .send(evt);
        expect(ok.status).toBe(200);

        // duplicate delivery is deduped
        const dup = await request(app)
            .post('/api/payments/revenuecat/webhook')
            .set('Authorization', 'Bearer test_webhook_secret')
            .send(evt);
        expect(dup.body.duplicate).toBe(true);

        const sync = await request(app)
            .post('/api/payments/sync')
            .set('Authorization', `Bearer ${token}`);
        expect(sync.body.coins).toBe(1500);

        // drained — second sync grants nothing
        const sync2 = await request(app)
            .post('/api/payments/sync')
            .set('Authorization', `Bearer ${token}`);
        expect(sync2.body.coins).toBe(0);

        const history = await request(app)
            .get('/api/payments/history')
            .set('Authorization', `Bearer ${token}`);
        expect(history.body.length).toBe(1);
        expect(history.body[0].charityAmount).toBeCloseTo(0.499, 3);
    });

    it('refund webhooks reverse the transaction', async () => {
        const refund = await request(app)
            .post('/api/payments/revenuecat/webhook')
            .set('Authorization', 'Bearer test_webhook_secret')
            .send({
                event: { type: 'REFUND', app_user_id: userId, transaction_id: 'tx_test_1' }
            });
        expect(refund.status).toBe(200);

        const history = await request(app)
            .get('/api/payments/history')
            .set('Authorization', `Bearer ${token}`);
        expect(history.body[0].status).toBe('refunded');
    });

    it('requires the right password to delete an account, then deletes it', async () => {
        const wrong = await request(app)
            .delete('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ password: 'nope' });
        expect(wrong.status).toBe(401);

        const del = await request(app)
            .delete('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ password: 'secret123' });
        expect(del.status).toBe(200);

        const me = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(me.status).not.toBe(200);
    });
});
