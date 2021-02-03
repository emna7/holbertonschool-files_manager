import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
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

    imageThumbnail(filePath, { width: 100 })
      .then(async (thumbnail) => {
        await fs.writeFile(`${filePath}_${100}`, thumbnail, (error) => {
          if (error) {
            throw error;
          }
        });
      })
      .catch((error) => console.log(error));

    imageThumbnail(filePath, { width: 250 })
      .then(async (thumbnail) => {
        await fs.writeFile(`${filePath}_${250}`, thumbnail, (error) => {
          if (error) {
            throw error;
          }
        });
      })
      .catch((error) => console.log(error));

    imageThumbnail(filePath, { width: 250 })
      .then(async (thumbnail) => {
        await fs.writeFile(`${filePath}_${250}`, thumbnail, (error) => {
          if (error) {
            throw error;
          }
        });
      })
      .catch((error) => console.log(error));
  }
});
