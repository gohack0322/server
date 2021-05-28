const path = require('path')

module.exports = {
    chainWebpack: config => {
        config.resolve.alias.set('@utils', path.join(__dirname, 'src/utils'));
    }
}