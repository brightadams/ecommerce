const request = require('supertest');
const { Product } = require('../../models/product');
const { User } = require('../../models/user');
let server;

describe('/api/products', ()=>{

    beforeEach(()=> { server = require('../../index');})
    afterEach(async()=>{
        await Product.remove({})
        await server.close();
        
    })
    describe('GET /',()=> {
        it('should return all products', async()=>{
            await Product.collection.insertMany([
                { 
                 name: 'product1',
                 price:10,
                 description: 'abcdefghijklmnopqrstuv',
                 categoryId: "234567890"
            }, { 
                name: 'product2',
                price:10,
                description: 'abcdefghijklmnopqrstuv',
                categoryId: "234567890"
           }
            ])

            const res = await request(server).get('/api/products');
            expect(res.status).toBe(200);
            
            expect(res.body.length).toBe(2);
            expect(res.body.some(g=> g.name === 'product1')).toBeTruthy();
            expect(res.body.some(g=> g.name === 'product2')).toBeTruthy();
        })
    })

    describe('GET /:id',()=>{
        it('should return a product if valid id is passed',async()=>{
            //so we insert something into the db
            const product = new Product({ 
                name: 'product1',
                price:10,
                description: 'abcdefghijklmnopqrstuv',
                categoryId: "234567890"
           });
            await product.save();
            //then we query it and check the details
            const res = await request(server).get('/api/products/' + product._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name',product.name);
        })

        it('should return 404 if valid id is passed',async()=>{
            //here we do not need to add any doc to the db because we are just inserting an invalid ID
            const res = await request(server).get('/api/products/1');
            expect(res.status).toBe(404);
        })
    })

    describe('POST /', ()=>{
        //Define the happy path, and then in each test, we change one parameter that clearly aligns with the name of the test.
        let token;
        let product = {};

        const exec = async()=>{
            return await request(server).post('/api/products').set('x-auth-token',token).send(product);
        }

        beforeEach(()=>{
            token = new User().generateAuthToken();
            product = { 
                name: 'product1',
                price:10,
                description: 'abcdefghijklmnopqrstuv',
                categoryId: "234567890"
           }
        })

        it('should return 401 if client is not logged in',async()=>{
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        })

        it('should return 400 if product name is not provided',async()=>{
            delete product["name"];
            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should return 400 if product name is less than 5',async()=>{
            product.name = '1234'
            const res = await exec();

            expect(res.status).toBe(400);
        })

        // it('should return 400 if product is more than 50',async()=>{

        //     name = new Array(52).join('a');

        //     const res = await exec();

        //     expect(res.status).toBe(400);
        // })

        it('should save product if it is valid',async()=>{ 
            await exec()

            const product = await Product.find({ name:'product1'});

            expect(product).not.toBeNull();
        })

        it('should return the product if it is valid',async()=>{
            //checking if the genre is in the body of the response
            const res = await exec()

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'product1');
        })
    })

    describe('DELETE /', ()=>{

        it('should return 403 if valid jwt token is provided but isAdmin not set to true',async()=>{ 
            let token = new User().generateAuthToken();
            let product = { 
                name: 'product1',
                price:10,
                description: 'abcdefghijklmnopqrstuv',
                categoryId: "234567890"
            }

            console.log(token)

            let posted = await request(server).post('/api/products').set('x-auth-token',token).send(product);

            console.log(posted.body)

            const res = await request(server).delete(
                "/api/products/"+posted.body._id
              ).set('x-auth-token',token);
            
            expect(res.statusCode).toBe(403);

        })

        it('should return 200 if valid jwt is provided and isAdmin is true',async()=>{ 
            let token = new User({
                name: "Bright",
                isAdmin: true
            }).generateAuthToken();
            let product = { 
                name: 'product1',
                price:10,
                description: 'abcdefghijklmnopqrstuv',
                categoryId: "234567890"
            }

            console.log(token)

            let posted = await request(server).post('/api/products').set('x-auth-token',token).send(product);

            console.log(posted.body)

            const res = await request(server).delete(
                "/api/products/"+posted.body._id
              ).set('x-auth-token',token);
            
            expect(res.statusCode).toBe(200);

        })

        it('should not delete if invalid jwt token is supplied',async()=>{ 
            let token = "abcd"
            let product = { 
                name: 'product1',
                price:10,
                description: 'abcdefghijklmnopqrstuv',
                categoryId: "234567890"
            }

            let posted = await request(server).post('/api/products').set('x-auth-token',token).send(product);

            console.log(posted.body)

            const res = await request(server).delete(
                "/api/products/"+posted.body._id
              ).set('x-auth-token',token);
            
            expect(res.statusCode).toBe(400);

        })
    })
})