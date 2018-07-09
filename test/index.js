const stomp = require('../lib/stomp');

// support version 1.1 and 1.2
// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
let stomp_args = {
    port: 61613,
    host: 'localhost',
    'accept-version': stomp.VERSIONS.V1_0,
    // 'heart-beat': '5000,5000',
    debug: false
};

// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages
// and dump it to the client.
// case mu
let headers = {
    // destination: ['/queue/outbound.STC.*', '/queue/test_q2'],
    destination: '/queue/outbound.STC.*',
    // ack: 'client',
    ack: 'client-individual',
    'activemq.prefetchSize': '50'
};

let messages = 0;

let client = new stomp.Stomp(stomp_args);

// start connection with active-mq
client.connect();

client.on('connected', function() {
    console.log('[AMQ] Connected');
    client.subscribe(headers);
});

client.on('disconnected', function(err) {
    console.log('[AMQ] Disconnected');
});

let queue = [];

client.on('message', function(frame) {
    messages++;
    // setTimeout(() => {
    //     if (queue.length <= 50) {
    //         queue.push(frame.headers);
    //         console.log(queue.length + ' - ' + frame.headers.subscription + " : Received message : " + message.body[0]);
    //     }
    //     if (queue.length == 50) {
    //         client.ack(queue[queue.length - 1]);
    //         queue = [];
    //     }
    // }, Math.floor(Math.random() * 2000));

    console.log(frame.headers.subscription + " : Received message : " + frame.body[0]);
    client.ack(frame.headers);
});

client.on('error', function(error_frame) {
    console.log('[AMQ] ERROR : ' + error_frame.headers.message);
    client.disconnect();
});

function unsubscribe(callback) {
    client.unsubscribe(headers);
    setTimeout(callback, 100);
}

function disconnect() {
    unsubscribe(function() {
        setTimeout(function() {
            client.disconnect()
        }, 500);
    });
}

setTimeout(disconnect, 3000);

// exist process on SIGINT
process.on('SIGINT', function() {
    disconnect();
});

process.on('SIGTERM', function() {
    disconnect();
});