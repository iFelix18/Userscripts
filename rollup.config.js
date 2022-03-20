import path from 'node:path'
import shiftHeader from 'rollup-plugin-shift-header'
import { terser } from 'rollup-plugin-terser'
import { eslintBundle } from 'rollup-plugin-eslint-bundle'

const root = process.cwd()
const input = path.join(root, 'src/index.js')
const output = path.join(root, 'lib')

export default [
  {
    input,
    output: [
      {
        file: path.join(output, 'index.js'),
        format: 'iife',
        extend: true,
        strict: false,
        plugins: [
          shiftHeader(),
          terser({
            compress: false,
            mangle: false,
            output: {
              beautify: true,
              comments: (node, comment) => (comment.value.startsWith(' ==') || comment.value.startsWith(' @') || comment.value.startsWith(' global'))
            }
          }),
          eslintBundle({
            eslintOptions: { fix: true },
            throwOnWarning: true,
            throwOnError: true,
            formatter: 'compact'
          })
        ]
      },
      {
        file: path.join(output, 'index.min.js'),
        format: 'iife',
        extend: true,
        strict: false,
        plugins: [
          shiftHeader(),
          terser({
            compress: true,
            mangle: true,
            output: {
              comments: (node, comment) => (comment.value.startsWith(' ==') || comment.value.startsWith(' @'))
            }
          })
        ]
      }
    ]
  }
]
