'use strict'

const assert = require('assert')


function updateCopyRight(path) {
  console.log('update copyright')
  let node
  let program = path.node
  if (path.node.directives.length > 0) {
    node = path.node.directives[0]
  } else {
    node = path.node.body[0]
  }
  let comment = node.leadingComments[0]
  let match = /^\s*\(C\) Copyright ([0-9]{4})(\s*-\s*([0-9]{4}))? Hewlett Packard Enterprise Development LP$/.exec(comment.value)
  if (!match) {
    console.warning('no copyright?')
    return
  }
  if (match[1] === '2018' || match[3] === '2018') {
    console.log('2018 was included')
    return
  }
  comment.value = ` (C) Copyright ${match[1]}-2018 Hewlett Packard Enterprise Development LP`
}


function YieldExpression(path) {

  const parent = path.findParent(path => path.isFunction());
  if (!parent) {
    console.log("what's wrong?")
    return
  }
  if (parent.node.generator === true) {
    return
  }
  assert(parent.node.async === true)
  path.node.type = 'AwaitExpression'
  delete path.node.delegate
}

/**
 * only support:
 *   co(function * ())
 *
 * not support:
 * function * run() {
 *    // ...
 * }
 *
 * co(run)
 */
module.exports = function() {

  return {
    visitor: {
      Identifier: function (path) {
        // TODO: co may on the right of =
        if (path.node.name === 'co' && path.parent.type === 'VariableDeclarator') {
          const p = path.findParent(path => path.isProgram())
          updateCopyRight(p)
          path.parentPath.remove()
        }
      },

      CallExpression: function(path) {
        const node = path.node
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'co') {
          return
        }
        if (
          path.parent.type === 'ReturnStatement' &&
          path.parentPath.parent.type === 'BlockStatement' &&
          (
            path.parentPath.parentPath.parent.type === 'FunctionDeclaration' ||
            path.parentPath.parentPath.parent.type === 'FunctionExpression' ||
            path.parentPath.parentPath.parent.type === 'ArrowFunctionExpression'
          ) &&
          path.parentPath.parent.body.length == 1
        ) {
          let fnPath = path.parentPath.parentPath.parentPath
          let fn = fnPath.node

          if (fn.type === 'ArrowFunctionExpression') {
            fnPath.traverse({Identifier: function(path) {
              if (path.node.name === 'this' || path.node.name === 'arguments') {
                throw new Error('this or argument in arrow function. stop')
              }
            }})
            fn.type = 'FunctionExpression'
          }

          assert(fn.async === false)
          assert(fn.generator === false)
          fn.body = node.arguments[0].body
          fn.async = true

          fnPath.traverse({YieldExpression})

        } else {
          node.callee = node.arguments[0]
          node.arguments = []
          node.callee.generator = false
          node.callee.async = true
        }

      },

      YieldExpression
    }
  }
}
