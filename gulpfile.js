'use strict'

const gulp = require('gulp')
const minify = require('gulp-minify')

const paths = {
  lib: {
    src: 'src/lib/**/*.js',
    dest: 'lib/'
  }
}

const compress = () => {
  return gulp.src(paths.lib.src)
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
    .pipe(gulp.dest(paths.lib.dest))
}

const watch = () => {
  gulp.watch(paths.lib.src, {
    ignoreInitial: false
  }, gulp.series(compress))
}

exports.compress = compress
exports.default = watch
