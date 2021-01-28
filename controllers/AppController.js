import redisClient from './utils/redis';
import dbClient from './utils/dbClient';

function getStatus(req, res, next) {
	if (redisClient.isAlive() && dbClient.isAlive()) {
		res.status(200).send({ "redis": true, "db": true });
	}
}

function getStats(req, res, next) {
	let nbUsers = await dbClient.nbUsers();
	let nbFiles = await dbClient.nbFiles();
	let result = {
		"users": nbUsers,
		"files": nbFiles
	};
	res.status(200).send(result);
}

export default { getStatus, getStats };
