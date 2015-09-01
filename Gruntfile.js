module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'tests*/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'src/**/*.js', 'tests*/**/*.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.registerTask('default', ['jsbeautifier', 'jshint']);
};
