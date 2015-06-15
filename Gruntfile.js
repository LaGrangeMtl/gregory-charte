'use strict';

module.exports = function(grunt) {

	require('jit-grunt')(grunt);
	require('time-grunt')(grunt);

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
						
						
					}
				},
				
			
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
			
		},
		
		watch: {
			
			scss: {
				files: 'scss/**/*.scss',
			
				tasks: ['sass']
			
			}
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
			}
		
	});

	// Default task.
	
	grunt.registerTask('prebuild', ['concat:placeholder', 'bowercopy', 'uglify:prebuild']);
	
};
