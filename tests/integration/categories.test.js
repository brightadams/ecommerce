const request = require('supertest');
const { Category } = require('../../models/category');
const { User } = require('../../models/user');
let server;

describe('/api/categories', ()=>{

    beforeEach(()=> { server = require('../../index');})
    afterEach(async()=>{
        await Category.remove({})
        await server.close();
    })
    describe('GET /',()=> {
        it('should return all categories', async()=>{
            await Category.collection.insertMany([
                { name: 'category1'},
                { name: 'category2'}
            ])

            const res = await request(server).get('/api/categories');
            // expect(res.status).toBe(200);
            
            // expect(res.body.length).toBe(2);
            // expect(res.body.some(g=> g.name === 'category1')).toBeTruthy();
            // expect(res.body.some(g=> g.name === 'category2')).toBeTruthy();
        })
    })

    describe('GET /:id',()=>{
        it('should return a category if valid id is passed',async()=>{
            //so we insert something into the db
            const category = new Category({ name: 'category1'});
            await category.save();
            //then we query it and check the details
            const res = await request(server).get('/api/categories/' + category._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name',category.name);
        })

        it('should return 404 if valid id is passed',async()=>{
            //here we do not need to add any doc to the db because we are just inserting an invalid ID
            const res = await request(server).get('/api/categories/1');
            expect(res.status).toBe(404);
        })
    })

    describe('POST /', ()=>{
        //Define the happy path, and then in each test, we change one parameter that clearly aligns with the name of the test.
        let token;
        let name;

        const exec = async()=>{
            return await request(server).post('/api/categories').set('x-auth-token',token).send({name});
        }

        beforeEach(()=>{
            token = new User().generateAuthToken();
            name = 'category1'
        })

        it('should return 401 if client is not logged in',async()=>{
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        })

        it('should return 400 if category name is less than 5',async()=>{
            name = '1234'
            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should return 400 if category is more than 50',async()=>{

            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should save genere if it is valid',async()=>{ 
            await exec()

            const category = await Category.find({ name:'category1'});

            expect(category).not.toBeNull();
        })

        it('should return the category if it is valid',async()=>{
            //checking if the genre is in the body of the response
            const res = await exec()

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'category1');
        })
    })
})