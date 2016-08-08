require('./mock-server');
const tests = require('./tests');
const assert = require('assert');
const path = require('path');
const BigNumber = require('bignumber.js');

const rel = './' + path.relative('', process.argv[1]);
const done = name => console.log(`[32;1m[Done][0m [0;1m${rel} ${name}[0m`);

tests.push(client => {
  let data = {
    list1: [ { a: 1 }, { a: 2 } ],
    map1: { 'a': { 'one': 1 }, 'b': { 'two': 2 } },
    map2: { '{"a":1}': 'one', '{"a":2}': 'two' }
  };
  return client.call('test', data).then(result => {
    assert.deepEqual(data, result);
    done('object as a key');
  });
});

tests.push(client => {
  return client.call('test', {}).then(result => {
    throw result;
  }, error => {
    done('throw an error');
    return error;
  });
});

tests.push(client => {
  let data = { list1: [ { a: 999 } ] };
  return client.call('test', data).then(result => {
    throw result;
  }, error => {
    assert.equal(JSON.stringify(data), error.data.message);
    done('object in list');
  });
});

tests.push(client => {
  let data = new Buffer([ 1, 2, 3, 4, 5 ]);
  return client.call('bin', { data }).then(result => {
    assert.deepEqual(result, data);
    done('binary data');
  });
});

tests.push(client => {
  let data = new Buffer([ 1, 2, 3, 4, 5 ]);
  return client.call('unknown', { data }).then(result => {
    throw result;
  }, error => {
    assert.equal(error.type, 1);
    done('exception on unknown method');
  });
});

tests.push(client => {
  let str = '-1234567890123456789';
  return client.call('bignumber', { data: new BigNumber(str) }).then(result => {
    assert.equal(result + '', str);
    done('i64 within BigNumber');
  });
});

tests.push(client => {
  return client.call('void_call').then(result => {
    assert.equal(result, null);
    done('void result');
  }, console.error);
});
