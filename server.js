const routes = require('./routes');
const express = require('express');
const app = express();

const port = process.env.PORT || 5000;

app.use('/', routes);

app.listen(port);
