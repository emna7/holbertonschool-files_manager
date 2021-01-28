import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export function getStatus(req, res) {
  if (redisClient.isAlive() && dbClient.isAlive()) {
    res.status(200).send({ redis: true, db: true });
  } else {
    res.send({ redis: false, db: false });
  }
}

export async function getStats(req, res) {
  const nbUsers = await dbClient.nbUsers();
  const nbFiles = await dbClient.nbFiles();
  const result = {
    users: nbUsers,
    files: nbFiles,
  };

  // console.log("----------------------------------------");

  // console.log(typeof(nbUsers));

  // console.log("----------------------------------------");
  res.status(200).send(result);
}
