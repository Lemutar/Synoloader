module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        qunit: {
            all: ['test/*.html']
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    moz: true
                }
            }

        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'src/**/*.js']
        }
    });


    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('test', [ 'qunit']);

    grunt.registerTask('default', ['jsbeautifier', 'jshint','qunit']);

};
