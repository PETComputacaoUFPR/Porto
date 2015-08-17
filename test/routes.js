var should = require('should')
var assert = require('assert')
var request = require('supertest')
var faker = require('faker')

var libs = process.cwd() + '/libs/'
var log = require(libs + 'log')(module)
var db = require(libs + 'db/mongoose')
var config = require(libs + 'config')

faker.locale = 'pt_BR'

describe('Routes', function() {
    var url = 'http://localhost:3000'
    var token = null

    before(function(done) {
        var payload = {
            grant_type: 'password',
            client_id: config.get('default:client:clientId'),
            client_secret: config.get('default:client:clientSecret'),
            username: config.get('default:usuario:username'),
            password: config.get('default:usuario:password')
        }

        request(url)
        .post('/v1/oauth/token')
        .send(payload)
        .end(function(err, res) {
            if(err) {
                throw err
            }

            token = res.body.access_token
            done()
        })
    })

    describe('Materias', function() {
        it('should return all', function(done) {
            request(url)
            .get('/v1/materias')
            .expect(200)
            .end(function(err, res) {
                if(err) {
                    throw err
                }

                res.body.should.be.an.instanceOf(Array)
                done()
            })
        })

        it('should create a new one', function(done) {
            var materia = {
                codigo: 'az123',
                nome: faker.finance.accountName()
            }

            request(url)
            .post('/v1/materias')
            .set('Authorization', 'Bearer ' + token)
            .send(materia)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err
                }

                res.body.should.have.property('status')
                res.body.should.have.property('materia')
                res.body.materia.codigo.should.equal(materia.codigo)
                res.body.materia.nome.should.equal(materia.nome)
                done()
            })
        })

        it('should return error when using an invalid code', function(done) {
            var materia = {
                codigo: 'huehue',
                nome: faker.finance.accountName()
            }

            request(url)
            .post('/v1/materias')
            .set('Authorization', 'Bearer ' + token)
            .send(materia)
            .expect(400)
            .end(function(err, res) {
                if (err) {
                    throw err
                }
                done()
            })
        })
    })

    describe('Usuario', function() {
        it('should create and return a new user', function(done) {
            var usuario = {
                nome: faker.name.findName(),
                email: faker.internet.userName() + '@inf.ufpr.br',
                username: faker.internet.userName(),
                password: faker.internet.password()
            }

            request(url)
            .post('/v1/u')
            .send(usuario)
            .expect(200)
            .end(function(err, res) {
                if(err) {
                    throw err
                }

                res.body.should.have.property('status')
                res.body.should.have.property('usuario')
                res.body.usuario.nome.should.equal(usuario.nome)
                res.body.usuario.email.should.equal(usuario.email)
                res.body.usuario.username.should.equal(usuario.username)
                res.body.usuario.criado.should.not.equal(null)
                done()
            })
        })

        it('should get a 401 status when requesting info about itself', function(done) {
            request(url)
            .get('/v1/u/me')
            .send()
            .expect(401)
            .end(function(err, res) {
                if(err) {
                    throw err
                }

                done()
            })
        })

        it('should get info about itself', function(done) {
            request(url)
            .get('/v1/u/me')
            .set('Authorization', 'Bearer ' + token)
            .send()
            .expect(200)
            .end(function(err, res) {
                if(err) {
                    throw err
                }

                res.body.should.have.property('nome').and.equal(config.get('default:usuario:nome'))
                res.body.should.have.property('username').and.equal(config.get('default:usuario:username'))
                done()
            })
        })

        it('should return error when creating a user with a non-ufpr e-mail', function(done) {
            var user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
                password: faker.internet.password()
            }

            request(url)
            .post('/v1/u')
            .send(user)
            .expect(400)
            .end(function(err, res) {
                if(err) {
                    throw err
                }

                done()
            })
        })
    })
})
