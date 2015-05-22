module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: 'build',
        concat: {
            basic: {
                src: ['src/core.js',
                    'src/config.js',
                    'src/compat.js',
                    'src/navigation.js',
                    'src/view-engine.js',
                    'src/annotation.js',
                    'src/error.js',
                    'src/formatting.js',
                    'src/input-formatting.js',
                    'src/pagination.js',
                    'src/popup.js',
                    'src/serialization.js',
                    'src/tabview.js',
                    'src/tutorial.js',
                    'src/utility.js',
                    'src/validation.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true
            },
            dist: {
                files: {
                    'build/<%= pkg.name %>.min.js': ['<%= concat.basic.dest %>']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['concat', 'uglify']);

};
