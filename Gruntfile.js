module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concurrent: {
        server: {
            tasks: ['nodemon', 'watch' ],
            options: {
                logConcurrentOutput: true
            }
        }
    },

	// Restart the server if any of these files changes
    nodemon: {
        dev: {
          options: {
            file: 'app.js',
            ignoredFiles: [ "package.json", "README.md", ".idea/*", "db", "test/db" ]
          }          
        }
    },

    jshint: {
      // define the files to lint
  	  files: ['./lib/**/*.js'],
  	  // configure JSHint (documented at http://www.jshint.com/docs/)
  	  options: {
  	      // more options here if you want to override JSHint defaults
  	    globals: {
  	      console: true,
  	      module: true
  	    }
  	  }
    },

    nodeunit: {
		// unit tests
      	unit: ['test/*.js'],
		// integration test suite
      	integration: [ 'test/integration/*.js']
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
		all: {
			files: [ '**/*.js' ],
			tasks: [ 'test', 'integration-test' ]
		}
    }   
  });

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', ['concurrent:server'])
  grunt.registerTask('test', ['nodeunit:unit'])
  grunt.registerTask('integration-test', ['nodeunit:integration'])
};