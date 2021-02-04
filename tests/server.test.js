import app from '../server';
import chaiHttp from 'chai-http';

const chai = require('chai');

const { assert } = chai;
const { expect } = chai;

chai.use(chaiHttp);

describe('/GET status', () => {
	it('Should verify if the redisClient and the dbClient are running.', async () => {
		chai.request(app)
		.get('/status')
		.end((err, res) => {
			if (err) throw err;
			expect(res.ok).to.be.true;
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('object');
			expect(res.body.redis).to.be.equal(true);
			expect(res.body.db).to.be.equal(true);
		});
	});
});


describe('/GET stats', () => {
	it('Should verify the app stats (number of users and files)', async () => {
		chai.request(app)
		.get('/stats')
		.end((err, res) => {
			if (err) throw err;
			expect(res.ok).to.be.true;
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('object');
			expect(res.body.nbUsers).to.be.a('number');
			expect(res.body.nbFiles).to.be.a('number');
			expect(res.body.nbUsers).to.be.above(0);
			expect(res.body.nbFiles).to.be.above(0);
		});
	});
});
