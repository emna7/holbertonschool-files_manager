import app from '../server';
import chaiHttp from 'chai-http';
import dbClient from '../utils/db';

const chai = require('chai');

const { assert } = chai;
const { expect } = chai;

chai.use(chaiHttp);

let userEmail = 'testuser@yopmail.com';
let userPassword = '123abc';

describe('/POST users', () => {

	before(() => {
		try {
			dbClient.db.collection('users').deleteOne({
				'email': userEmail,
			});
		} catch (err) {
			throw err;
		}
	});

	it('Should verify that user email is missed', async () => {
		chai.request(app)
		.post('/users')
		.set('Content-Type', 'application/json')
		.send({})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.status).to.equal(400);
			expect(res.body).to.be.an('object');
			expect(res.body.error).to.equal('Missing email');
		});
	});

	it('Should verify that user password is missed', async () => {
		chai.request(app)
		.post('/users')
		.set('Content-Type', 'application/json')
		.send({
			'email': userEmail,
		})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.status).to.equal(400);
			expect(res.body).to.be.an('object');
			expect(res.body.error).to.equal('Missing password');
		});
	});

	it('Should verify that user is properly added.', async () => {
		chai.request(app)
		.post('/users')
		.set('Content-Type', 'application/json')
		.send({
			'email': userEmail,
			'password': userPassword
		})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.ok).to.be.true;
			expect(res.status).to.equal(201);
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.all.keys('id', 'email');
			expect(res.body.email).to.equal(userEmail);
		});
	});

	it('Should verify that user email already exists.', async () => {
		chai.request(app)
		.post('/users')
		.set('Content-Type', 'application/json')
		.send({
			'email': userEmail,
			'password': userPassword
		})
		.end((err, res, body) => {
			if (err) throw err;
			expect(res.status).to.equal(400);
			expect(res.body).to.be.an('object');
			expect(res.body.error).to.equal('Already exist');
		});
	});

});
