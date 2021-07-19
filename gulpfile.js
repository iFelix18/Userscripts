'use strict'

const gulp = require('gulp')
const tap = require('gulp-tap')
const parser = require('userscript-parser')
const minify = require('gulp-minify')
const rename = require('gulp-rename')
const merge = require('merge-stream')

const paths = {
  lib: {
    src: 'src/lib/**/*.js',
    dest: 'lib/'
  }
}

const compress = () => {
  let version = ''

  const release = gulp.src(paths.lib.src)
    .pipe(tap((file) => {
      const { meta } = parser(file.contents.toString())
      version = meta.version[0]
    }))
    .pipe(minify({
      ext: {
        min: '.js'
      },
      noSource: true,
      preserveComments: (node, comment) => {
        if (comment.value.startsWith('*')) return false
        else return true
      }
    }))
    .pipe(rename((path) => {
      path.basename += `-${version}`
      path.extname = '.min.js'
    }))
    .pipe(gulp.dest(paths.lib.dest))

  const latest = gulp.src(paths.lib.src)
    .pipe(minify({
      ext: {
        min: '.js'
      },
      noSource: true,
      preserveComments: (node, comment) => {
        if (comment.value.startsWith('*')) return false
        else return true
      }
    }))
    .pipe(rename((path) => {
      path.basename += '-latest'
      path.extname = '.min.js'
    }))
    .pipe(gulp.dest(paths.lib.dest))

  return merge(release, latest)
}

const watch = () => {
  gulp.watch(paths.lib.src, {
    ignoreInitial: false
  }, gulp.series(compress))
}

exports.compress = compress
exports.default = watch
