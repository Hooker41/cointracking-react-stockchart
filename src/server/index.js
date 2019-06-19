const express = require('express');
const os = require('os');

const { getHistoricalSummary } = require('./cointrackingAPI');

const app = express();

app.use(express.static('dist'));

app.get('/api/getHistoricalSummary', async (req, res) => {
  var type = req.query.type;
  const result = await getHistoricalSummary(type);
  res.send({result});
});

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
