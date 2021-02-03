/* eslint-disable */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const fs = require('fs');
const mime = require('mime-types');
const Queue = require('bull');

// const UsersController = require('../controllers/UsersController');
// const AuthController = require('../controllers/AuthController');

// POST /files should create a new file in DB and in disk
export async function postUpload(req, res) {
	const acceptedTypes = ['folder', 'file', 'image'];
	let token = req.headers['x-token'] || '';
	let userId = await redisClient.get(`auth_${token}`);
	let user, file, folder_path, file_path, currentData;

	if (!userId) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId), });

	let { name, type, parentId = 0, isPublic = false, data = undefined } = req.body;

	if (!name) {
		return res.status(400).send({
			'error': 'Missing name',
		});
	}

	if (!type || acceptedTypes.indexOf(type) == -1) {
		return res.status(400).send({
			'error': 'Missing type',
		});
	}

	if (!data && type != 'folder') {
		return res.status(400).send({
			'error': 'Missing data',
		});
	}

	if (parentId) {
		let isValidParentId = ObjectId.isValid(parentId);	
		if (isValidParentId) {
			file = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
			if (!file) {
				return res.status(400).send({
					'error': 'Parent not found',
				})
			} else if (file.type != 'folder') {
				return res.status(400).send({
					'error': 'Parent is not a folder',
				});
			}	
		} else {
			return res.status(400).send({
				'error': 'Parent not found',
			});
		}
	}

	if (type === 'folder') {
		try {
			currentData = {
				userId: ObjectId(userId),
				name,
				type,
				isPublic,
			};
			await dbClient.db.collection('files').insertOne(currentData, (err, result) => {
				if (err) return err;
				return res.status(201).send({
					'id': currentData._id,
					'userId': currentData.userId,
					'name': currentData.name,
					'type': currentData.type,
					'isPublic': currentData.isPublic,
					'parentId': currentData.parentId,
				});
			});
		} catch (err) {
			return res.status(err.status).send({
				'error': err,
			});
		}
	}

	folder_path = process.env.FOLDER_PATH || '/tmp/files_manager';
	file_path = uuidv4();

	if (!fs.existsSync(folder_path)) {
		fs.mkdirSync(folder_path);
	}

	fs.writeFile(`${folder_path}/${file_path}`, Buffer.from(data, 'base64'), (err) => {
		if (err) {
			return res.send({
				'error': err,
			});
		}
	});

	try {
		currentData = {
			userId: ObjectId(userId),
			name,
			type,
			isPublic,
			parentId,
			localPath: `${folder_path}/${file_path}`,
		};
		await dbClient.db.collection('files').insertOne(currentData, (err, result) => {
			if (currentData.type === 'image') {
				let fileQueue = new Queue('fileQueue');
				let fileId = currentData._id;
				fileQueue.add({
					userId: userId.toString(),
					fileId: fileId.toString(),
				});	
			}
			return res.status(201).send({
				'id': currentData._id,
				'userId': currentData.userId,
				'name': currentData.name,
				'type': currentData.type,
				'isPublic': currentData.isPublic,
				'parentId': currentData.parentId,
			});
		});
	} catch (err) {
		// return res.send({
		// 	'error': err,
		// });
		throw err;
	}
}


// GET /files/:id should retrieve the file document based on the ID
export async function getShow(req, res) {
	let token = req.headers['x-token'] || '';
	let userId = await redisClient.get(`auth_${token}`);
	let file, fileId;

	if (!userId || !ObjectId.isValid(userId)) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	fileId = req.params.id;

	if (ObjectId.isValid(fileId) && ObjectId.isValid(userId)) {
		file = await dbClient.db.collection('files').findOne({
			_id: ObjectId(fileId),
			userId: ObjectId(userId),
		});
		if (file) {
			return res.send({
				id: file._id,
				userId: file.userId,
				name: file.name,
				type: file.type,
				isPublic: file.isPublic,
				parentId: file.parentId,
			});
		}
	}
	return res.status(404).send({
		'error': 'Not found',
	});
}


// GET /files should retrieve all users file documents for a specific parentId and with pagination.
export async function getIndex(req, res) {
	let token = req.headers['x-token'] || '';
	let userId = await redisClient.get(`auth_${token}`);
	let parent, files = [];

	if (!userId || !ObjectId.isValid(userId)) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	let { parentId = 0, page = 0, } = req.query;

	page = Number(page);

	if (parentId !== 0) {
		parent = await dbClient.db.collection('files').findOne({
			type: 'folder',
			_id: ObjectId(parentId),
		});
		
		if (!parent) {
			return res.send([]);
		}
	}

	await dbClient.db.collection('files').aggregate([
		{ $match: { parentId, } },
		{ $skip: page * 20 },
		{ $limit: 20 },
	], function(err, data) {
		if (err) return err;
		files = data;
	});

	if (files) {
		let results = [];
		await files.forEach((elem) => {
			results.push({
				id: elem._id,
				userId: elem.userId,
				name: elem.name,
				type: elem.type,
				isPublic: elem.isPublic,
				parentId: elem.parentId
			});
		});
		if (results) {
			return res.send(results);
		}
	}

	return res.send([]);
}


// PUT /files/:id/publish should set isPublic to true on the file document based on the ID
export async function putPublish(req, res) {
	let token = req.headers['x-token'] || '';
	let userId = await redisClient.get(`auth_${token}`);
	let file, fileId;

	if (!userId || !ObjectId.isValid(userId)) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	fileId = req.params.id;

	if (ObjectId.isValid(fileId)) {
		await dbClient.db.collection('files').findOneAndUpdate(
			{
				_id: ObjectId(fileId),
				userId: ObjectId(userId),
			},
			{
				$set: {
					isPublic: true,
				},
			}, function (err, data) {
				if (err) {
					return err;
				}
			}
		);
	}

	file = await dbClient.db.collection('files').findOne({
		_id: ObjectId(fileId),
		userId: ObjectId(userId),
	});
	if (file) {
		return res.send({
			id: file._id,
			userId: file.userId,
			name: file.name,
			type: file.type,
			isPublic: file.isPublic,
			parentId: file.parentId,
		});
	}

	return res.status(404).send({
		'error': 'Not found',
	});
}


// PUT /files/:id/unpublish should set isPublic to false on the file document based on the ID
export async function putUnpublish(req, res) {
	let token = req.headers['x-token'] || '';
	let userId = await redisClient.get(`auth_${token}`);
	let file, fileId;

	if (!userId || !ObjectId.isValid(userId)) {
		return res.status(401).send({
			'error': 'Unauthorized',
		});
	}

	fileId = req.params.id;

	if (ObjectId.isValid(fileId)) {
		await dbClient.db.collection('files').findOneAndUpdate(
			{
				_id: ObjectId(fileId),
				userId: ObjectId(userId),
			},
			{
				$set: {
					isPublic: false,
				},
			}, function (err, data) {
				if (err) {
					return err;
				}
			}
		);
	}

	file = await dbClient.db.collection('files').findOne({
		_id: ObjectId(fileId),
		userId: ObjectId(userId),
	});
	if (file) {
		return res.send({
			id: file._id,
			userId: file.userId,
			name: file.name,
			type: file.type,
			isPublic: file.isPublic,
			parentId: file.parentId,
		});
	}

	return res.status(404).send({
		'error': 'Not found',
	});
}


// GET /files/:id/data should return the content of the file document based on the ID
export async function getFile(req, res) {
	let token = req.headers['x-token'] || '';
	let file, fileId, userId, filePath, dataType, fileSize;

	fileId = req.params.id;

	if (ObjectId.isValid(fileId)) {
		file = await dbClient.db.collection('files').findOne({
			_id: ObjectId(fileId),
		});
	}

	if (!file) {
		return res.status(404).send({
			'error': 'Not found',
		});
	}

	if (!file.isPublic) {
		userId = await redisClient.get(`auth_${token}`);

		if (!userId || !ObjectId.isValid(userId) || file.userId != userId) {
			return res.status(404).send({
				'error': 'Not found',
			});
		}
	}

	if (file.type === 'folder') {
		return res.status(400).send({
			'error': "A folder doesn't have content",
		});
	}

	if (req.params.size) {
		fileSize = req.params.size;
		filePath = `${file.localPath}_${fileSize}`;
	} else {
		filePath = file.localPath;
	}

	try {
		if (fs.existsSync(filePath)) {
			dataType = mime.lookup(filePath);
			fs.readFile(filePath, (err, data) => {
				if (err) {
					throw err;
				}
				res.setHeader('Content-Type', dataType);
				return res.status(200).send(data);	
			})
		} else {
			return res.status(404).send({
				'error': 'Not found',
			});	
		}
	} catch(err) {
		return res.status(404).send({
			'error': 'Not found',
		});
	}
}
