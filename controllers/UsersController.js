import dbClient from '../utils/db';

const sha1 = require('sha1');

/* eslint-disable */
export async function postNew(req, res) {
  try {
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    if (!userEmail) {
      res.status(400).send({
        error: 'Missing email',
      });
      return;
    }

    if (!userPassword) {
      res.status(400).send({
        error: 'Missing password',
      });
      return;
    }

    const existingEmail = dbClient.collection('users').findOne(
      { email: userEmail }, (err) => {
        if (err) throw err;
      },
    );

    if (existingEmail) {
      res.status(400).send({
        error: 'Already exist',
      });
      return;
    }

    let userId;
    const hashedPw = sha1(userPassword);
    const newUser = {
      email: userEmail,
      password: hashedPw,
    };

    await dbClient.collection('users').insertOne(newUser, (err) => {
      if (err) throw err;
      userId = newUser._id;
    });

    res.json({
      email: userEmail,
      id: userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: 'Server error',
    });
  }
}
