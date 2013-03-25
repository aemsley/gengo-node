module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: {
          'lib/gengo.js': 'src/gengo.litcoffee',
          'examples/getting_started.js': 'src/examples/getting_started.litcoffee'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  // Default task(s).
  grunt.registerTask('default', ['coffee']);
};