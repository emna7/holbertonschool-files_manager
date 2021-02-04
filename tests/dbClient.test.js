import dbClient from '../utils/db';

const chai = require('chai');

const { assert } = chai;
const { expect } = chai;

describe('dbClient Tests', () => {
  it('verifies dbClient Connection', async () => {
    assert.equal(dbClient.isAlive(), true);
  });

  it('verifies the dbClient.nbUsers', async () => {
    expect(await dbClient.nbUsers()).to.be.a('number');
    expect(await dbClient.nbUsers()).to.not.equal(0);
  });

  it('verifies the dbClient.nbFiles', async () => {
    expect(await dbClient.nbFiles()).to.be.a('number');
    expect(await dbClient.nbFiles()).to.not.equal(0);
  });
});
