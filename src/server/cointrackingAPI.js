var crypto = require('crypto');
var fetch = require('node-fetch');
var moment = require('moment');
var FormData = require('form-data');
var http_build_query = require('qhttp/http_build_query');

const key = '93b4f64794e61d230e4e03af5fd0ad58';  // YOUR API KEY
const secret = '2df4ff4fbe03a12baf1157e58a0f88952deec376ba21601c'; // YOUR API SECRET

const url = "https://cointracking.info/api/v1/";

const getHistoricalSummary = async () => {
  var params={};
  var res = await coinTracking('getHistoricalSummary', params);
  return res;
}

async function coinTracking(method, params) {
  params.method = method;
  params.nonce = moment().unix();

  var post_data = http_build_query(params, {leave_brackets: false});

  var hash = crypto.createHmac('sha512', secret);
  hash.update(post_data);
  var sign = hash.digest('hex');

  var headers =  { 'Key': key, 'Sign': sign};

  var form = new FormData();
  for(var paramKey in params) {
    var value = params[paramKey];
    form.append(paramKey, value);
  }

  var result = await fetch(url, {
    method: 'POST',
    body:   form,
    headers: headers,
  });
  var json = await result.json();
  return json;
}

exports.getHistoricalSummary = getHistoricalSummary;