module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'Integration/**/*.js'],
            options: {
                jshintrc: '.jshintrc' // relative to Gruntfile
                    // options here to override JSHint defaults
            }
        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'Integration/**/*.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.registerTask('default', ['jsbeautifier', 'jshint']);
};
