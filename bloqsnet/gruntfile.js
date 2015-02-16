module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            // options: {
            //     separator: ';'
            // },
            dist: {
                src: [
                    'bloqsnet.js',
                    'bloqs/base.js',
                    'bloqs/svg_proto.js',
                    'bloqs/svg_svg.js',
                    'bloqs/svg_g.js',
                    'bloqs/svg_rect.js',
                    'bloqs/svg_circle.js',

                    'bloqs/svg_ellipse.js',
                    
                    'bloqs/svg_text.js',
                        //'bloqs/svg_animate.js',
                        //'bloqs/svg_image.js',
                    
                    'bloqs/bn_root.js',
                    'bloqs/svg_each.js'
                ],
                dest: 'dist/built.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat']);

};
