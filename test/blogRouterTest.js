const chai = require('chai');
const chaiHTTP = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHTTP);

describe('Blog Posts', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();     
    });

    it('should list posts on GET', function() {

        return chai.request(app)
          .get('/blog-posts')
          .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a('array');
              expect(res.body.length).to.be.at.least(1);
              const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
              res.body.forEach(function(item) {
                  expect(item).to.be.a('object');
                  expect(item).to.include.keys(expectedKeys);
              });
          });
    });

    it('should add post on POST', function() {
        const newPost = {title: 'new post', content: 'hello world', author: 'Reed'};
        return chai.request(app)
          .post('/blog-posts')
          .send(newPost)
          .then(function(res) {
              expect(res).to.have.status(201);
              expect(res).to.be.json;
              expect(res.body).to.be.a('object');
              expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
              expect(res.body.id).to.not.equal(null);
              expect(res.body).to.deep.equal(Object.assign(newPost, {id: res.body.id}, {publishDate: res.body.publishDate}));
          });
    });

    it('should update post on PUT', function() {
        const updatePost = {
            title: 'Changed Title',
            content: 'Hello world updated',
            author: 'Reed',
            publishDate: Date.now()
        };
        return chai.request(app)
          .get('/blog-posts')
          .then(function(res) {
              updatePost.id = res.body[0].id;
              return chai.request(app)
                .put(`/blog-posts/${updatePost.id}`)
                .send(updatePost);
          })
          .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a('object');
              expect(res.body).to.deep.equal(updatePost);
          });
    });

    it('should delete items on DELETE', function() {
        return chai.request(app)
          .get('/blog-posts')
          .then(function(res) {
              return chai.request(app)
                .delete(`/blog-posts/${res.body[0].id}`);
          })
          .then(function(res) {
              expect(res).to.have.status(204);
          });
    });
});