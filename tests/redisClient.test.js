import redisClient from '../utils/redis';

const chai = require('chai');

const { assert } = chai;
const { expect } = chai;

describe('redisClient Tests', () => {
  it('verifies redisClient Connection', async () => {
    assert.equal(redisClient.isAlive(), true);
  });

  it('verifies the redisClient set and get and del', async () => {
    expect(await redisClient.set('myTestKey', 666, 300));
    expect(await redisClient.get('myTestKey')).to.be.a('string');
    expect(await redisClient.get('myTestKey')).to.equal('666');
    expect(await redisClient.del('myTestKey'));
    expect(await redisClient.get('myTestKey')).to.be.null;
  });
});
