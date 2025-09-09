const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('انا حي');
});

function keepAlive() {
  app.listen(3000, '0.0.0.0', () => {
    console.log('server is on 24/7 ✅');
  });
}

module.exports = keepAlive;