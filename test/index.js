const stomp = require('../lib/stomp');

// support version 1.1 and 1.2
// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
let stomp_args = {
    port: 61613,
    host: 'localhost',
    /* additional header */
    debug: false,
    'client-id': 'my-client-id',
    'accept-version': stomp.VERSIONS.V1_0,
    // 'heart-beat': '5000,5000',
};

// 'activemq.prefetchSize' is optional.
// case multi-dest/Wildcards recommended to set ack to : client-individual
let headers = {
    destination: '/queue/test',
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

    let message = frame.body[0];
    let messageId = frame.headers['message-id'];
    let subscription = frame.headers.subscription;

    console.log(messages + " - Received message Id   : " + messageId);
    console.log(messages + " - Received message sub  : " + subscription);
    console.log(messages + " - Received message body : " + message);

    client.send({
        destination: '/queue/received,/queue/received_1',
        expires: 0,
        priority: 9,
        persistent: 'true',
        body: message,
    }, false);

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

// client.heartbeat.outgoing = 20000; // client will send heartbeats every 20000ms
// client.heartbeat.incoming = 0;     // client does not want to receive heartbeats  from the server
// client.send("/queue/test", {priority: 9}, "Hello, STOMP");