import { dest, parallel, series, src, watch } from 'gulp'
import { parse, stringify } from 'userscript-meta'
import { readFileSync, existsSync, writeFile } from 'node:fs'
import cleanCSS from 'gulp-clean-css'
import flatmap from 'gulp-flatmap'
import htmlMinifier from 'gulp-html-minifier-terser'
import minify from 'gulp-minify'
import replace from 'gulp-replace'

// paths
const paths = {
  css: {
    dest: 'tempfiles/',
    src: 'userscripts/src/css/*.css'
  },
  handlebars: {
    dest: 'tempfiles/',
    src: 'userscripts/src/handlebars/*.hbs'
  },
  lib: {
    dest: 'packages/',
    src: ['packages/**/lib/*.js', '!packages/**/lib/*.min.js']
  },
  meta: {
    dest: 'userscripts/meta/',
    src: 'userscripts/meta/'
  },
  userscripts: {
    dest: 'userscripts/',
    src: 'userscripts/*.user.js'
  }
}

// minify
const minifyJS = () => {
  return src(paths.lib.src)
    .pipe(minify({
      ext: {
        min: '.min.js'
      },
      noSource: true,
      preserveComments: (node, comment) => {
        return (comment.value.startsWith(' ==') || comment.value.startsWith(' @'))
      }
    }))
    .pipe(dest(paths.lib.dest))
}

const minifyCSS = () => {
  return src(paths.css.src)
    .pipe(cleanCSS({}))
    .pipe(dest(paths.css.dest))
}

const minifyHBS = () => {
  return src(paths.handlebars.src)
    .pipe(htmlMinifier({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      processScripts: ['text/x-handlebars-template'],
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      sortAttributes: true,
      sortClassName: true
    }))
    .pipe(dest(paths.handlebars.dest))
}

// replace
const replaceCSS = () => {
  return src(paths.userscripts.src)
    .pipe(flatmap((stream, file) => {
      return src(file.path)
        .pipe(replace(/(?<=(css: )')(.*?)(?=')/g, readFileSync('tempfiles/config.css', 'utf8')))
        .pipe(dest(paths.userscripts.dest))
    }))
}

const replaceHBS = () => {
  return src(paths.userscripts.src)
    .pipe(flatmap((stream, file) => {
      const fileName = file.stem.replace('.user', '')

      return existsSync(`tempfiles/${fileName}.hbs`)
        ? src(file.path)
          .pipe(replace(/(?<=(const template = )')(.*?)(?=')/g, readFileSync(`tempfiles/${fileName}.hbs`, 'utf8')))
          .pipe(dest(paths.userscripts.dest))
        : stream
    }))
}

// bump meta
const bumpMeta = (callback) => {
  return src(paths.userscripts.src)
    .pipe(flatmap((stream, file) => {
      const fileName = file.basename.replace('.user', '.meta')
      const contents = file.contents.toString('utf8')
      const { name, author, namespace, description, copyright, license, version } = parse(contents)
      const meta = stringify({ name, author, namespace, description, copyright, license, version })

      writeFile(`${paths.meta.src}${fileName}`, meta, callback)

      return stream
    }))
}

// watch
const watchUserJS = () => {
  watch(paths.userscripts.src, {
    ignoreInitial: false
  }, series(bumpMeta))
}

const watchJS = () => {
  watch(paths.lib.src, {
    ignoreInitial: false
  }, series(minifyJS))
}

const watchCSS = () => {
  watch(paths.css.src, {
    ignoreInitial: false
  }, series(minifyCSS, replaceCSS))
}

const watchHBS = () => {
  watch(paths.handlebars.src, {
    ignoreInitial: false
  }, series(minifyHBS, replaceHBS))
}

// export
const _default = parallel(watchUserJS, watchJS, watchCSS, watchHBS)
export { _default as default }
