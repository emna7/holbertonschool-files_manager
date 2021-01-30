/* eslint-disable */
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const sha1 = require('sha1');

// POST /users should create a new user in DB
export async function postNew(req, res) {

	try {
		const userEmail = req.body.email;
		if (!userEmail) {
			return res.status(400).send({
				error: 'Missing email',
			});
		}

		const userPassword = req.body.password;
		if (!userPassword) {
			return res.status(400).send({
				error: 'Missing password',
			});
		}
		
		let existingEmail = await dbClient.db.collection('users').findOne({ email: userEmail });
		if (existingEmail) {
			return res.status(400).send({
				error: 'Already exist',
			});
		}

		let userId;
		const hashedPw = sha1(userPassword);
		const newUser = {
			email: userEmail,
			password: hashedPw,
		};

		try {
			await dbClient.db.collection('users').insertOne(newUser, (err) => {
				userId = newUser._id;
				return res.status(201).send({
					email: userEmail,
					id: userId,
				});
			});
		} catch (err) {
			return res.status(err.status).send({
				'error': err,
			});
		}

	} catch (error) {
		return res.status(500).send({
			error: 'Server error',
		});
	}
}

// GET /users/me should retrieve the user base on the token used
export async function getMe(req, res) {
	let token = req.headers['x-token'] || '';

	if (!token) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}
	
	let userId = await redisClient.get(`auth_${token}`);
	let user;

	if (!userId) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId), });

	return res.status(200).send({
		'id': user._id,
		'email': user.email,
	});
}
