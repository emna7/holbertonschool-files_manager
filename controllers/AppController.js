import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export function getStatus(req, res) {
  if (redisClient.isAlive() && dbClient.isAlive()) {
    res.status(200).send({ redis: true, db: true });
  }
}

export function getStats(req, res) {
  const nbUsers = dbClient.nbUsers();
  const nbFiles = dbClient.nbFiles();
  const result = {
    users: nbUsers,
    files: nbFiles,
  };
  res.status(200).send(result);
}

// export default { getStatus, getStats };
