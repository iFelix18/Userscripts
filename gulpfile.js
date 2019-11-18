'use strict'

const gulp = require('gulp')
const minify = require('gulp-minify')

const paths = {
  libraries: {
    src: 'src/lib/**/*.js',
    dest: 'lib/'
  }
}

function compress () {
  return gulp.src(paths.libraries.src)
    .pipe(minify({
      ext: {
        min: '.min.js'
      },
      noSource: true,
      preserveComments: (node, comment) => {
        if (comment.value.startsWith('*')) return false
        else return true
      }
    }))
    .pipe(gulp.dest(paths.libraries.dest))
}

function watch () {
  gulp.watch(paths.libraries.src, {
    ignoreInitial: false
  }, gulp.series(compress))
}

exports.default = watch
