module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concurrent: {
        server: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    },

    nodemon: {
        dev: {
          options: {
            file: 'app.js',
            ignoredFiles: [ "package.json", "README.md" ]  
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

    mochaTest: {
      test: {
        src: [ 'test/*.js' ]
      }
    },

    nodeunit: {
      all: ['test/*.js']
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['app.js,lib/*.js'],
        tasks: ['newer:jshint:all']
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    }   
  });

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', ['concurrent:server'])
  grunt.registerTask('test', ['nodeunit'])
};