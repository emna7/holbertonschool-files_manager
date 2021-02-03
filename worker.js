import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');

let fn = () => fileQueue.process(async (job) => {
	console.log(
		'#################################################################'
	);

	console.log(job);

  if (!job.fileId) {
    throw new Error('Missing fileId');
  }
  if (!job.userId) {
    throw new Error('Missing userId');
  }
  let file = null;
  let filePath = '';
  file = await dbClient.db.collection('files').findOne({
    userId: ObjectId(job.userId),
    fileId: ObjectId(job.fileId),
  });
  if (!file) {
    throw new Error('File not found');
  } else {
		filePath = file.localPath;
		
		imageThumbnail(`${filePath}_${100}`, { width: 100 })
		.then(thumbnail => console.log(thumbnail))
		.catch(error => console.log(error));

		imageThumbnail(`${filePath}_${250}`, { width: 250 })
		.then(thumbnail => console.log(thumbnail))
		.catch(error => console.log(error));

		imageThumbnail(`${filePath}_${250}`, { width: 250 })
		.then(thumbnail => console.log(thumbnail))
		.catch(error => console.log(error));


    // let f1 = await imageThumbnail(`${filePath}_${100}`, { width: 100 });
    // let f2 = await imageThumbnail(`${filePath}_${250}`, { width: 250 });
		// let f3 = await imageThumbnail(`${filePath}_${250}`, { width: 250 });
		// if (f1) console.log('------------------------- f1 created -------------------------');
		// if (f2) console.log('------------------------- f2 created -------------------------');
		// if (f3) console.log('------------------------- f3 created -------------------------');
  }
});

fn();
