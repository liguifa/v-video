const webpack = require('webpack');
const path = require('path');

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

/*
 * We've enabled ExtractTextPlugin for you. This allows your app to
 * use css modules that will be moved into a separate CSS file instead of inside
 * one of your module entries!
 *
 * https://github.com/webpack-contrib/extract-text-webpack-plugin
 *
 */

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	entry: './src/index.js',

	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					presets: ['env']
				}
			},
			{
				test: /\.vue$/,
				exclude: /node_modules/,
				loader: 'vue-loader',
			},
			{
				test: /\.css$/,

				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						}
					],
					fallback: 'style-loader'
				})
			}
		]
	},

	devtool: "source-map",

	plugins: [
		//new UglifyJSPlugin(),
		new ExtractTextPlugin('v-video.[contentHash].css')
	]
};
