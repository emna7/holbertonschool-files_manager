/* eslint-disable */
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';

const sha1 = require('sha1');

export async function getConnect(req, res) {
	let authCredentials = '';

	if (!req.headers.authorization) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	authCredentials = (req.headers.authorization).split(' ')[1];

	authCredentials = (Buffer.from(
		authCredentials, 'base64'
	).toString('utf-8')).split(':');

	const email = authCredentials[0];
	const pwd = authCredentials[1];
	const hashedPw = sha1(pwd);

	let user = await dbClient.db.collection('users').findOne({
		'email': email,
		'password': hashedPw
	});

	if (!user) {
		return res.status(401).send({
			error: 'Unauthorized',
		});
	}
	
	let token = uuidv4();
	await redisClient.set(
		`auth_${token}`,
		user._id,
		86400
	);

	return res.status(200).send({
		'token': token,
	});
}

export async function getDisconnect(req, res) {
	let token = req.headers['x-token'] || '';
	let userId = null;
	userId = await redisClient.get(`auth_${token}`);

	if (!userId) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	await redisClient.del(`auth_${token}`);
	return res.status(204);
}
