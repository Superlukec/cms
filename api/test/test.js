var supertest = require('supertest');
var should = require('should');

// This agent refers to PORT where program is runninng.

var server = supertest.agent('http://localhost:1339');

var fakeUser  = { 'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjowLCJhY3RpdmF0ZWQiOnRydWUsInZhbGlkYXRlZCI6dHJ1ZSwiX2lkIjoiNWRlOTAwZmZjYzY1ZWExMDBjYTJlNzIzIiwicGFzc3dvcmRfY2hhbmdlZCI6IjE1ODUyMTA2NDQ4OTUiLCJmdWxsX25hbWUiOiJMdWthIFNlbW9sacSNIiwic2l0ZV9pZCI6IjVkZTkwMGZmY2M2NWVhMTAwY2EyZTcyMiIsIl9fdiI6MCwicGFzc3dvcmRfcmVxdWVzdF9kYXRlIjoiMTU5MTAwNjU1NzIxNSIsInBhc3N3b3JkX3JlcXVlc3RfbGluayI6Imtod2Y5Z3Jtd3cwMCIsImNvbG9yIjoiI2U2MDA2MyIsImluaXRpYWxzIjoiTFMiLCJpYXQiOjE2MDYzMDk4NDEsImV4cCI6MTYwODkwMTg0MX0.CpALArKoMe84-TUXiTLMDWYa30jDnOnNy45jz1ZKCrU' };

var superadminUser  = { 'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjowLCJhY3RpdmF0ZWQiOnRydWUsInZhbGlkYXRlZCI6dHJ1ZSwiX2lkIjoiNWU0ZmI1M2I4MTI0N2U0NGU2MzQ0MzFjIiwiZnVsbF9uYW1lIjoiTHVrYSBTZW1vbGnEjSIsInNpdGVfaWQiOiI1ZGU5MDBmZmNjNjVlYTEwMGNhMmU3MjIiLCJfX3YiOjAsImNvbG9yIjoiI2EwZTkyYiIsImluaXRpYWxzIjoiTFMiLCJwYXNzd29yZF9jaGFuZ2VkIjoiMTYwNjcyOTgzMjMwNSIsInBhc3N3b3JkX3JlcXVlc3RfZGF0ZSI6IjE2MDY3Mjk3NTc4OTgiLCJwYXNzd29yZF9yZXF1ZXN0X2xpbmsiOiIiLCJpYXQiOjE2MDY3Mjk5MjcsImV4cCI6MTYwOTMyMTkyN30.A6STCzUAirrkBfZChvVfUdUeYBB0Mcig46AMYwV8d0Y' };
var adminUser  = { 'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoxLCJhY3RpdmF0ZWQiOnRydWUsInZhbGlkYXRlZCI6dHJ1ZSwiX2lkIjoiNWZjODkyYTRmMDA3MWQzODcwOTJiYzMyIiwicGFzc3dvcmRfY2hhbmdlZCI6IjE2MDY5ODAyNjA1MDkiLCJmdWxsX25hbWUiOiJMIFMiLCJzaXRlX2lkIjoiNWRlOTAwZmZjYzY1ZWExMDBjYTJlNzIyIiwiY29sb3IiOiIjODJhYzA2IiwiaW5pdGlhbHMiOiJMUyIsIl9fdiI6MCwiaWF0IjoxNjA3MzIzNTQ4LCJleHAiOjE2MDk5MTU1NDh9.N0ldkD4x2e7a_ozjzJqw1c1wZTMTIpO7TNB82-ilQ-w' };

var authorUser = { 'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjozLCJhY3RpdmF0ZWQiOnRydWUsInZhbGlkYXRlZCI6dHJ1ZSwiX2lkIjoiNWZjNGNlZDZlYjk0ZjI1MTkwMjQ4Njk3IiwicGFzc3dvcmRfY2hhbmdlZCI6IjE2MDY3MzM1MjYwNDEiLCJmdWxsX25hbWUiOiJMdWthIFRlc3RuaSIsInNpdGVfaWQiOiI1ZGU5MDBmZmNjNjVlYTEwMGNhMmU3MjIiLCJjb2xvciI6IiM2YWJlYWEiLCJpbml0aWFscyI6IkxUIiwiX192IjowLCJpYXQiOjE2MDY3MzM1OTUsImV4cCI6MTYwOTMyNTU5NX0.nd7BIJJ-2ipyX9X0cK444bHQceI-6WLYiJnVv7owmc8' };

// UNIT test begin

describe('Testing for guest queries', function () {

    describe('Testing super admin API functions (management.js)', function () {

        // add site

        it('createSite() - public - should return 401', function (done) {

            server
                .post('/api/management/site')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        // delete site

        it('deleteSite() - public - should return 401', function (done) {

            server
                .delete('/api/management/12')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

    });

    describe('Website CRUD functions (site.js)', function () {

        // add post

        it('addPost() - public - should return 401', function (done) {

            server
                .post('/api/site/post')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        // update post

        it('updatePostContent() - public - should return 401', function (done) {

            server
                .put('/api/site/update/post')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        // delete post

        it('deletePost() - public - should return 401', function (done) {

            server
                .delete('/api/site/post/delete/1/2')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        // get posts
        it('getPosts() - public - should return 401', function (done) {

            server
                .get('/api/site/pages/1/2/3/4/5/6/7')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

    });

    describe('User CRUD functions (site.js)', function () {

        // add user

        it('addUser() - public - should return 401', function (done) {

            server
                .post('/api/site/add/user')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        it('updateUser() - public - should return 401', function (done) {

            server
                .put('/api/site/update/user/123')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        it('deleteUser() - public - should return 401', function (done) {

            server
                .delete('/api/site/delete/user/111/222')
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        it('getUsers() - public - should return 401', function (done) {

            server
            .get('/api/site/get/users/111')
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });

        });

    });

    describe('Files & Shareables CRUD functions (site.js)', function () {


        it('uploadImage() - public - should return 401', function (done) {
            server
            .post('/api/site/upload/image')
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });
        });

        it('uploadAsset() - public - should return 401', function (done) {
            server
            .post('/api/site/upload/asset')
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });
        });

        it('uploadShareable() - public - should return 401', function (done) {
            server
            .post('/api/site/upload/shareable')
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });
        });

        it('deleteFile() - public - should return 401', function (done) {
            server
            .delete('/api/site/file/delete/1/2')
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });
        });

        it('safeDeleteFile() - public - should return 401', function (done) {
            server
            .delete('/api/site/file/safe/delete/1/2')
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });
        });


    });

});

describe('Testing with REAL cookie (SUPER ADMIN) - empty data (if doesn\'t work - change realUser cookie)', function () {


    describe('Testing super admin API functions (management.js)', function () {

        // add site

        it('createSite() - should return 422', function (done) {

            server
                .post('/api/management/site')                
                .send({num1 : 10, num2 : 20})
                .set(superadminUser)
                .expect('Content-type', /json/)
                .expect(422)
                .end(function (err, res) {
                    res.status.should.equal(422);
                    done();
                });

        });

        // delete site

        it('deleteSite() - fakeid - should return 200 - site not found', function (done) {

            server
                .delete('/api/management/5de900ffcc65ea100ca2e007')
                .set(superadminUser)
                .expect('Content-type', /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    res.body.success.should.equal(false);
                    done();
                });

        });

    });


});


describe('Testing with FAKE cookie - empty data', function () {


    describe('Testing super admin API functions (management.js)', function () {

        // add site

        it('createSite() - should return 401', function (done) {

            server
                .post('/api/management/site')                
                .send({num1 : 10, num2 : 20})
                .set(fakeUser)
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

        // delete site

        it('deleteSite() - fakeid - should return 401', function (done) {

            server
                .delete('/api/management/5de900ffcc65ea100ca2e007')
                .set(fakeUser)
                .expect('Content-type', /json/)
                .expect(401)
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });

        });

    });


});

describe('Testing admin functions - with AUTHOR user', function () {

    // add site

    it('createSite() - should return 403 (forbidden)', function (done) {

        server
            .post('/api/management/site')                
            .send({num1 : 10, num2 : 20})
            .set(authorUser)
            .expect('Content-type', /json/)
            .expect(403)
            .end(function (err, res) {
                res.status.should.equal(403);
                done();
            });

    });

    // delete site

    it('deleteSite() - should return 403 (forbidden)', function (done) {

        server
            .delete('/api/management/5de900ffcc65ea100ca2e007')
            .set(authorUser)
            .expect('Content-type', /json/)
            .expect(403)
            .end(function (err, res) {
                res.status.should.equal(403);
                done();
            });

    });

});


describe('Testing resolve page - PUBLIC ENDPOINT', function () {

    it('resolvePage() - not found', function (done) {

        server
            .put('/api/site/resolve')
            .send({slug : 'bla32132'})
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                done();
            });

    });

    it('resolvePage() - found', function (done) {

        server
            .put('/api/site/resolve')
            .send({slug : 'domov'})
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                done();
            });

    });

});


describe('Test API - management.js', function () {

    var createSiteId = null;

    it('createSite()', function (done) {

        server
            .post('/api/management/site')
            .send({
                'domain' : 'joey.com',
                'title' : 'Joey\'s website',
                'configuration' : true
            })
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {                
                createSiteId = res.body.data;

                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('deleteSite()', function (done) {

        server
            .delete('/api/management/' + createSiteId)   
            .set(superadminUser)         
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

});

describe('Test API - shareables.js', function () {

    it('prepareShareable()', function (done) {

        server
            .get('/api/shareables/prepare/5e4fb53b81247e44e634431b/5f8ff72ec4fd6d5fc8276d74/5f8ff720c4fd6d5fc8276d71')
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                res.status.should.equal(200);
                res.body.success.should.equal(false);
                done();
            });

    });

});


describe('Test API - site.js', function () {

    var postId = null;

    it('addPost()', function (done) {

        server
            .post('/api/site/post')
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'type': 'post',
                'blocks': [111],
                'slug' : 'test',
                'title' : 'test'
            })
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                postId = res.body.data;

                res.status.should.equal(200);
                res.body.success.should.equal(true);

                done();
            });

    });
    
    it('updatePost()', function (done) {

        server
            .put('/api/site/update/post')
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'id': postId,
                'blocks': [{
                    'type': true,
                    'value': '1111'
                }],
                'slug' : 'test11',
                'title' : 'test11'
            })
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                res.status.should.equal(200);
                done();
            });

    });

    
    it('deletePost()', function (done) {

        server
            .delete('/api/site/post/delete/5de900ffcc65ea100ca2e722/' + postId)
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                res.status.should.equal(200);
                done();
            });

    });


    it('uploadImage()', function (done) {

        server
            .post('/api/site/upload/image')
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(422)
            .end(function (err, res) { 

                res.status.should.equal(422);
                done();
            });

    });

    it('uploadAsset()', function (done) {

        server
            .post('/api/site/upload/asset')
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(422)
            .end(function (err, res) { 

                res.status.should.equal(422);
                done();
            });

    });

    var userId = null;

    it('addUser()', function (done) {

        server
            .post('/api/site/add/user')
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'registrationType': 'nevem',                
                'email' : 'hello@kompas-telekom.com',
                'role' : 3, 
                'first_name' : '  ',
                'last_name' : '  ',
                'full_name' : 'Kenyo Burek',
                'password' : '123456'
            })
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                if(res.body && res.body.data) {
                    userId = res.body.data._id;
                }
                res.body.success.should.equal(true);
                res.status.should.equal(200);
                done();
            });

    });

    it('addUser() - admin - can\'t add superadmin', function (done) {

        server
            .post('/api/site/add/user')
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'registrationType': 'nevem',                
                'email' : 'hello2@kompas-telekom.com',
                'role' : 0, 
                'first_name' : '  ',
                'last_name' : '  ',
                'full_name' : 'Kenyo Burek',
                'password' : '123456'
            })
            .set(adminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {                 
                res.body.success.should.equal(false);
                res.status.should.equal(200);
                done();
            });

    });

    it('addUser() - same email', function (done) {

        server
            .post('/api/site/add/user')
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'registrationType': 'nevem',                
                'email' : 'hello@kompas-telekom.com',
                'role' : 3, 
                'first_name' : '  ',
                'last_name' : '  ',
                'full_name' : 'Kenyo Burek',
                'password' : '123456'
            })
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                res.body.success.should.equal(false);

                res.status.should.equal(200);
                done();
            });

    });

    
    it('updateUser() - superadmin', function (done) {

        server
            .put('/api/site/update/user/' + userId)
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'registrationType': 'nevem',                
                'email' : 'hello@kompas-telekom.com',
                'role' : 0, 
                'first_name' : 'Benko',
                'last_name' : 'Burek',
                'full_name' : 'Benko Burek',
                'password' : '123456'
            })
            .set(superadminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);                
                done();
            });

    });

    it('updateUser() - admin - can\'t add superadmin', function (done) {

        server
            .put('/api/site/update/user/' + userId)
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'registrationType': 'nevem',                
                'email' : 'hello@kompas-telekom.com',
                'role' : 0, 
                'first_name' : 'Benko',
                'last_name' : 'Burek',
                'full_name' : 'Benko Burek',
                'password' : '123456'
            })
            .set(adminUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                done();
            });

    });

    
    it('deleteUser()', function (done) {

        server
            .delete('/api/site/delete/user/5de900ffcc65ea100ca2e722/' + userId)     
            .set(superadminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('getFiles()', function (done) {

        server
            .put('/api/site/file/5de900ffcc65ea100ca2e722')    
            .send({
                'public': true
            }) 
            .set(superadminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('getSiteTemplate()', function (done) {

        server
            .put('/api/site/template/5de900ffcc65ea100ca2e722')    
            .send({
                'slug': 'burek'
            }) 
            .set(superadminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    var formId = null;

    it('addForm()', function (done) {

        server
            .post('/api/site/form')    
            .send({
                'name': 'prva',
                'site_id': '5de900ffcc65ea100ca2e722',
                'elements': []
            }) 
            .set(superadminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 

                formId = res.body.data;

                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('updateForm()', function (done) {

        server
            .put('/api/site/form/' + formId)    
            .send({
                'name': 'Prva',
                'site_id': '5de900ffcc65ea100ca2e722',
                'elements': [{
                    'type': 'text',
                    'name': 'username',
                    'label': 'Username'
                }]
            }) 
            .set(superadminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('deleteForm() - authorUser', function (done) {

        server
            .delete('/api/site/form/delete/5de900ffcc65ea100ca2e722/' + formId)        
            .set(authorUser)                  
            .expect('Content-type', /json/)
            .expect(403)
            .end(function (err, res) { 
                res.status.should.equal(403);
                done();
            });

    });

    it('getFormPublic()', function (done) {

        server
            .get('/api/site/form/p/5de900ffcc65ea100ca2e722/' + formId)        
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('postFormPublic()', function (done) {

        server
            .post('/api/site/form/p')   
            .send({
                'site_id': '5de900ffcc65ea100ca2e722',
                'form_id': formId,
                'data': {
                    'lol': 'lel'
                }
            })      
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    it('deleteFormSubmissions() - public', function (done) {

        server
            .delete('/api/site/forms/submissions/5de900ffcc65ea100ca2e722/' + formId)        
            .expect('Content-type', /json/)
            .expect(401)
            .end(function (err, res) { 
                res.status.should.equal(401);
                done();
            });
    });

    it('deleteFormSubmissions() - admin', function (done) {

        server
            .delete('/api/site/forms/submissions/5de900ffcc65ea100ca2e722/' + formId)        
            .set(adminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });
    });

    it('deleteForm() - admin', function (done) {

        server
            .delete('/api/site/form/delete/5de900ffcc65ea100ca2e722/' + formId)        
            .set(adminUser)                  
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) { 
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                done();
            });

    });

    

});


