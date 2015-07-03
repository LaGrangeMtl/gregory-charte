'use strict';

module.exports = function(grunt) {

	require('jit-grunt')(grunt);
	require('time-grunt')(grunt);

	var browserifyPackages = {};
	browserifyPackages['js/app.js'] = ['app/charte/App.js'];

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;'+
			'*/\n\n',
		// Task configuration.
		
		bowercopy: {
			options: {
				srcPrefix: 'bower_components',
			},
			bootmoilastrap: {
				 files: {
					'scss/common/bootstrap' : 'bootstrap-sass/assets/stylesheets/bootstrap',
				}
			},
			
			vendor: {
				options: {
					destPrefix: 'js/vendor',
				},
				 files: {
					'jquery.js' : 'jquery/dist/jquery.min.js',
					'es5-shim.js' : 'es5-shim/es5-shim.min.js',
					'es5-sham.js' : 'es5-shim/es5-sham.min.js',
					'imagesloaded.js' : 'imagesloaded/imagesloaded.js',
					'jquery.selectric.min.js' : 'jquery-selectric/public/jquery.selectric.min.js'
					
				}
			}
				
			
		},
		
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			placeholder: {
				src: [
					"bower_components/placeholder.js/lib/utils.js",
					"bower_components/placeholder.js/lib/main.js",
					"bower_components/placeholder.js/lib/adapters/placeholders.jquery.js"
				],
				dest: "js/vendor/placeholders.jquery.js"
			},
		},
		
		uglify: {
			options: {
				banner:  '<%= banner %>'
			},
			
			prebuild : {
				files: {
					'js/vendor/modernizr.js': ['bower_components/modernizr/modernizr.js'],
					'js/vendor/lodash.js': ['bower_components/lodash/lodash.js'],
					'js/vendor/placeholders.jquery.js': ['js/vendor/placeholders.jquery.js'],
					
				}
			},
			
			prod: {
				src: 'js/app.js',
				dest: 'js/app.js'
			},
			common: {
				src: 'js/common.js',
				dest: 'js/common.js'
			}
			
		},
		
		watch: {
			
			scss: {
				files: 'scss/**/*.scss',
			
				tasks: ['sass']
			
			},
			js: {
				files: 'app/charte/**/*.js',
				tasks: ['browserify:prod'/*, 'uglify:prod'*/]
			},
			commonjs: {
				files: 'app/vendorShim.js',
				tasks: ['browserify:common', 'uglify:common']
			},
		},
		
		sass: {
			development: {
				options: {
					style : 'compressed'
				},
				files: {
					"css/main.css": "scss/main.scss"
				}
			},
		},

		browserify : {
			options : {
				external: ['greensock', 'jquery', 'gsapScrollToPlugin', 'promise', 'neutrino', 'imagesloaded', 'lodash', 'slick-carousel', 'selectric'],
				browserifyOptions : {
					debug: true
				},
				//
			},
			dev : {
				files: browserifyPackages,
				options : {
					transform: [],
					browserifyOptions : {
						debug: true
					},
				}
			},
			prod : {
				files: browserifyPackages,
				options : {
					transform: [],
				}
			},
			common: {
				src: 'app/vendorShim.js',
				dest: 'js/common.js',
				options: {
					alias:[
						':lodash',
						':imagesloaded',
						':jquery',
						':greensock',
						':gsapScrollToPlugin',
						'bluebird:promise',
						':console-polyfill',
						':slick-carousel',
						':es5-shim',
						':selectric'
					],
					debug: true,
					external : null
				},
			}
		},
		
	});

	// Default task.
	grunt.registerTask('default', ['browserify:dev']);
	grunt.registerTask('prod', ['browserify:prod', 'uglify:prod']);
	grunt.registerTask('jslibs', ['browserify:common', 'uglify:common']);
	grunt.registerTask('prebuild', ['concat:placeholder', 'bowercopy', 'uglify:prebuild']);
	
};
