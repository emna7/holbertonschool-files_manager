const imageThumbnail = require('image-thumbnail');

path = '/tmp/files_manager/6cbd62fc-2116-4a77-aea4-758cba7bef7c';	

imageThumbnail(path)
.then(thumbnail => { console.log(thumbnail) })
.catch(err => console.error(err));

// import { ObjectId } from 'mongodb';
// import dbClient from './utils/db';

// const Queue = require('bull');
// const imageThumbnail = require('image-thumbnail');

// const fileQueue = new Queue('fileQueue');

// fileQueue.process(async (job) => {
// 	console.log(
// 		'#################################################################'
// 	)
//   if (!job.fileId) {
//     throw new Error('Missing fileId');
//   }
//   if (!job.userId) {
//     throw new Error('Missing userId');
//   }
//   let file = null;
//   let filePath = '';
//   file = await dbClient.db.collection('files').findOne({
//     userId: ObjectId(job.userId),
//     fileId: ObjectId(job.fileId),
//   });
//   if (!file) {
//     throw new Error('File not found');
//   } else {
//     filePath = file.localPath;
//     let f1 = await imageThumbnail(`${filePath}_${100}`, { width: 100 });
//     let f2 = await imageThumbnail(`${filePath}_${250}`, { width: 250 });
// 		let f3 = await imageThumbnail(`${filePath}_${250}`, { width: 250 });
// 		if (f1) console.log('------------------------- f1 created -------------------------');
// 		if (f2) console.log('------------------------- f2 created -------------------------');
// 		if (f3) console.log('------------------------- f3 created -------------------------');
//   }
// });
