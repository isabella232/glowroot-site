/* global require, module */

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: 'site',
    dist: 'dist'
  };

  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      less: {
        files: ['<%= yeoman.app %>/styles/*.less'],
        tasks: ['less']
      },
      bake: {
        files: ['<%= yeoman.app %>/{,*/}*.html'],
        tasks: 'bake:server'
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/*.css',
          '<%= yeoman.app %>/images/**/*'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729,
        open: true,
        middleware: function (connect) {
          var serveStatic = require('serve-static');
          return [
            serveStatic('.tmp'),
            connect().use('/bower_components', serveStatic('./bower_components')),
            serveStatic(appConfig.app),
            connect().use('/fonts', serveStatic('<%= yeoman.app %>/bower_components/bootstrap/dist/fonts'))
          ];
        }
      },
      livereload: true,
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },

    less: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/styles',
            src: '*.less',
            dest: '.tmp/styles',
            ext: '.css'
          }
        ]
      }
    },

    uncss: {
      options: {
        ignore: [
          // this explicit ignore is needed since uncss is run prior to bake
          '.navbar-inverse .navbar-nav > .active > a',
          // this is used by blog index
          'h2 a'
        ],
        report: 'gzip'
      },
      main: {
        options: {
          stylesheets: ['../.tmp/concat/styles/site.css']
        },
        files: {
          '.tmp/concat/styles/site.css': [
            '<%= yeoman.app %>/*.html',
            '<%= yeoman.app %>/_includes/*.html'
          ]
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/*.js',
          '<%= yeoman.dist %>/styles/*.css',
          '<%= yeoman.dist %>/images/**/*',
          '<%= yeoman.dist %>/*.{ico,png}'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      dist: {
        files: {
          '<%= yeoman.dist %>/_includes/head.html': '<%= yeoman.app %>/_includes/head.html',
          '<%= yeoman.dist %>/_includes/footer.html': '<%= yeoman.app %>/_includes/footer.html'
        },
        options: {
          dest: '<%= yeoman.dist %>'
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: [
        '<%= yeoman.dist %>/{,*/}*.html'
      ],
      css: ['<%= yeoman.dist %>/styles/*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
      }
    },

    bake: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            dest: '<%= yeoman.dist %>',
            src: '*.html'
          },
          {
            expand: true,
            cwd: '<%= yeoman.dist %>/_blog/_includes',
            dest: 'blog/_includes',
            src: '*.html'
          }
        ]
      },
      server: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>',
            dest: '.tmp',
            src: '*.html'
          }
        ]
      }
    },

    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '**/*.{gif,jpeg,jpg,png}',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: '*.html',
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '*.css'
      },
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.ico',
              '{,*/,*/*/}*.html',
              'overhead/jmh-result.zip',
              'javadoc/**'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'bower_components/bootstrap/dist',
            dest: '<%= yeoman.dist %>',
            src: ['fonts/*.*']
          }
        ]
      }
    }
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'less',
      'copy:styles',
      'bake:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'less',
    'copy:styles',
    'imagemin',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'filerev',
    'usemin',
    'bake',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
