import app from '../server';
import chaiHttp from 'chai-http';

const chai = require('chai');

const { assert } = chai;
const { expect } = chai;
const sha1 = require('sha1');

chai.use(chaiHttp);

// authCredentials of the user { "email": "bob@dylan.com", "password": "toto1234!" }
let authCredentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
let token = null;

// describe('/GET connect', () => {
// 	it('Should successfully connect.', async () => {
// 		let res = await chai.request(app)
// 		.get('/connect')
// 		.set('Authorization', authCredentials)
// 		.send()
// 		.end((err, res, body) => {
// 			if (err) throw err;
// 			expect(res.ok).to.be.true;
// 			expect(res.status).to.equal(200);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body).to.have.all.keys('token');
// 			expect(res.body.token).to.be.a('string');
// 			token = res.body.token;
// 		});
// 	});

// });

describe('POST /files', () => {

	before(() => {
		it('Should successfully connect.', async () => {
			chai.request(app)
			.get('/connect')
			.set('Authorization', authCredentials)
			.send()
			.end((err, res, body) => {
				if (err) {
					throw err;
				}
				expect(res.ok).to.be.true;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('token');
				expect(res.body.token).to.be.a('string');
				token = res.body.token;
			});
		});
	});

	it('Should successfully post a new file', () => {
		chai.request(app)
		.post('/files')
		.set('X-Token', token)
		.set('Content-Type', 'application/json')
		.send({
			'name': 'testFile.txt',
			'type': 'file',
		})
		.end((err, res, body) => {
			expect(res.status).to.equal(201);
			expect(res.body).to.have.all.keys('id', 'userId', 'name', 'type', 'isPublic', 'parentId');
		});
	});
});
