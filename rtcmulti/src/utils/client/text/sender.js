import { getRandomString, isString } from '@/utils/client/globals'

export default {
    send: function(config) {
        var connection = config.connection;

        var channel = config.channel,
            remoteUserId = config.remoteUserId,
            initialText = config.text,
            packetSize = connection.chunkSize || 1000,
            textToTransfer = '',
            isobject = false;

        if (!isString(initialText)) {
            isobject = true;
            initialText = JSON.stringify(initialText);
        }

        // uuid is used to uniquely identify sending instance
        var uuid = getRandomString();
        var sendingTime = new Date().getTime();

        sendText(initialText);

        function sendText(textMessage, text) {
            var data = {
                type: 'text',
                uuid: uuid,
                sendingTime: sendingTime
            };

            if (textMessage) {
                text = textMessage;
                data.packets = parseInt(text.length / packetSize);
            }

            if (text.length > packetSize) {
                data.message = text.slice(0, packetSize);
            } else {
                data.message = text;
                data.last = true;
                data.isobject = isobject;
            }

            channel.send(data, remoteUserId);

            textToTransfer = text.slice(data.message.length);

            if (textToTransfer.length) {
                setTimeout(function() {
                    sendText(null, textToTransfer);
                }, connection.chunkInterval || 100);
            }
        }
    }
}