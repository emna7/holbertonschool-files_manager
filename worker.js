// /* eslint-disable */
import dbClient from './utils/db';
import { ObjectId } from 'mongodb';

const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
	if (!job.fileId) {
		throw new Error('Missing fileId');
	}
	if (!job.userId) {
		throw new Error('Missing userId');
	}
	let file = full, filePath = '';
	file = await dbClient.db.collection('files').findOne({
		userId: ObjectId(job.userId),
		fileId: ObjectId(job.fileId),
	});
	if (!file) {
		throw new Error('File not found');
	} else {
		filePath = file.localPath;
		
		// const widths = [500, 250, 100];		
		// widths.forEach((width) => {
		// 	await imageThumbnail(`${filePath}_${width}`, { width: width, });
		// });

		await imageThumbnail(`${filePath}_${100}`, { width: 100 });
		await imageThumbnail(`${filePath}_${250}`, { width: 250 });
		await imageThumbnail(`${filePath}_${250}`, { width: 250 });
	}
});
