const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Config = require('webpack-chain');

const resolve = target => path.resolve(__dirname, target);
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

const config = new Config();

config
    .entry('index')
        .add(resolve('src/index.ts'))
    .end()
    .output
        .path(resolve('dist'))
        .filename('[name].bundle.js')
        .library('mah-storage')
        .libraryTarget('umd')
    .end()
    .resolve
        .extensions
            .add('.ts')
            .add('.js')
        .end()
        .alias
            .set('$constants', resolve('src/constants'))
            .set('$types', resolve('src/types'))
            .set('$utils', resolve('src/utils'))
            .set('$storage', resolve('src/storage'))
        .end()
    .end()
    .module
        .rule('ts')
            .test(/\.ts$/)
                .use('ts')
                .loader('ts-loader')
            .end()
        .end();

if (IS_DEVELOPMENT) {
    config
        .mode('development')
        .plugin('clean')
            .use(CleanWebpackPlugin)
        .end()
        .plugin('html')
            .use(HtmlWebpackPlugin, [{ title: 'Development' }])
        .end();
} else {
    config
        .mode('production')
        .devtool('source-map');
}

module.exports = config.toConfig();
