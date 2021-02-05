import app from '../server';
import chaiHttp from 'chai-http';

const chai = require('chai');

const { assert } = chai;
const { expect } = chai;
const sha1 = require('sha1');

chai.use(chaiHttp);

let userEmail = 'testuser@yopmail.com';
let userPassword = '123abc';
const hashedPassword = sha1(userPassword);
// const credentials = new Buffer(`${hashedPassword}:${userEmail}`).toString('base64');
// let authCredentials = `Basic ${credentials}`;

// authCredentials of the user { "email": "bob@dylan.com", "password": "toto1234!" }
let authCredentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
let token = null;

describe('/GET connect', () => {

	it('Should not connect because of missed base64Auth', async () => {
		chai.request(app)
		.get('/connect')
		.set('Authorization', '')
		.send({})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.status).to.equal(401);
			expect(res.body).to.be.an('object');
			expect(res.body.error).to.equal('Unauthorized');
		});
	});

	it('Should not connect because of the wrong base64Auth (no corresponding user)', async () => {
		chai.request(app)
		.get('/connect')
		.set('Authorization', 'randomToken')
		.send({})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.status).to.equal(401);
			expect(res.body).to.be.an('object');
			expect(res.body.error).to.equal('Unauthorized');
		});
	});

	it('Should successfully connect.', async () => {
		
		chai.request(app)
		.get('/connect')
		.set('Authorization', authCredentials)
		.send()
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.ok).to.be.true;
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.all.keys('token');
			expect(res.body.token).to.be.a('string');
			token = res.body.token;
		});
	});

});

describe('/GET disconnect', () => {

	it('Should succesfully disconnect.', async () => {
		chai.request(app)
		.get('/disconnect')
		.set('X-Token', token)
		.send({})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.ok).to.be.true;
			expect(res.status).to.equal(204);
			expect(res.body).to.be.an('object');
		});
	});

	it('Should fail disconnecting', async () => {
		chai.request(app)
		.get('/disconnect')
		.set('X-Token', token)
		.send({})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.status).to.equal(401);
			expect(res.body).to.be.an('object');
			expect(res.body.error).to.equal('Unauthorized');
		});
	});

});
