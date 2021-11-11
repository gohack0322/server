var Promise = require('bluebird')
const database = require('../database')
const pushLogs = require('../pushLogs.js');

module.exports = {
    // 新增郵件
    create: (from_unique_id, to_unique_id, signature, title, content, is_read = false, is_notify = false) =>  {
        from_unique_id = from_unique_id.split('-')
        to_unique_id = to_unique_id.split('-')

        return new Promise((resolve, reject) => {
            database.getConnection(function(err, connection) {
                if (err) {
                    reject(err)
                } else {
                    connection.query(`INSERT INTO \`mailletter\` (\`from_type\`, \`from_id\`, \`to_type\`, \`to_id\`, \`signature\`, \`title\`, \`content\`, \`is_read\`, \`is_notify\`, \`created_at\`, \`updated_at\`)
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [from_unique_id[0], from_unique_id[1], to_unique_id[0], to_unique_id[1], signature, title, content, is_read ? 1 : 0, is_notify ? 1 : 0], (err, rows) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(rows)
                        }
                        connection.release()
                    })
                }
            })
        })
    }
}