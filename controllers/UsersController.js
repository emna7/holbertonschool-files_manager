import dbClient from '../utils/db';

const sha1 = require('sha1');

/* eslint-disable */
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
		
		await dbClient.db.collection('users').findOne(
			{ email: userEmail }, (err, result) => {
				if (err) {
					console.log(err);
				} else if (result) {
					return res.status(400).send({
						error: 'Already exist',
					});					
				}
			},
		);

		let userId;
		const hashedPw = sha1(userPassword);
		const newUser = {
			email: userEmail,
			password: hashedPw,
		};

		await dbClient.db.collection('users').insertOne(newUser, (err, res) => {
			if (err) {
				return res.send(err);
			} else {
				userId = newUser._id;
				return res.status(201).send({
					email: userEmail,
					id: userId,
				});
			}
		});

	} catch (error) {
		return res.status(500).send({
			error: 'Server error',
		});
	}
}
