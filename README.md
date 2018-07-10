# node-stomp

STOMP Client for Node.js

[![Build status](https://travis-ci.org/mseld/node-stomp.svg?branch=master)](https://travis-ci.org/mseld/node-stomp)

```js
const stomp = require('node-stomp');

// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
let stomp_args = {
    port: 61613,
    host: 'localhost',
    'accept-version': stomp.VERSIONS.V1_1,
    debug: false,
    login: 'guest',
    passcode: 'guest',
};

// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages
// and dump it to the client.
let headers = {
    destination: '/queue/test',
    ack: 'client-individual',
    // 'activemq.prefetchSize': '10'
};

// Multi-Destinations
{
    destination: [
        '/queue/test_1',
        '/queue/test_2',
    ],
    ack: 'client-individual',
}

// Wildcards
{
    destination: '/queue/test.>'
    ack: 'client-individual',
}

let messages = 0;
let client = new stomp.Stomp(stomp_args);

// start connection with active-mq
client.connect();

client.on('connected', function () {
    console.log('[AMQ] Connected');
    client.subscribe(headers);
});

client.on('disconnected', function () {
    console.log('[AMQ] Disconnected');
});

client.on('message', function (message) {
    messages++;
    console.log("received message : " + message.body[0]);
    client.ack(message.headers['message-id']);
});

client.on('error', function (error_frame) {
    console.log('[AMQ] message : ' + error_frame);
    client.disconnect();
});
```

## TODO
- [x] Support Multi-Destinations
- [x] Support [Wildcards](http://activemq.apache.org/wildcards.html)
- [x] Support Composite Destinations
- [x] Support version [1.1](https://stomp.github.io/stomp-specification-1.1.html)
- [ ] Support version [1.2](https://stomp.github.io/stomp-specification-1.2.html)
- [ ] Support Reconnecting
- [ ] Support Fail-Over
- [ ] Validate
    - [ ] headers.ack (auto, client, client-individual)
    - [ ] headers.destination
