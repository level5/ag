'use strict'

const assert = require('assert')
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
          console.log('found where is co declared, should be removed')
          path.parentPath.remove()
        }
      },

      CallExpression: function(path) {
        const node = path.node
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'co') {
          return
        }

        console.log('found a co call, should be replace with async')
        node.callee = node.arguments[0]
        node.arguments = []
        node.callee.generator = false
        node.callee.async = true
      },

      YieldExpression: function (path) {

        const parent = path.findParent(path => path.isFunction());
        if (!parent) {
          console.log("what's wrong?")
          return
        }
        if (parent.node.generator === true) {
          return
        }
        assert(declare.node.async === true)
        console.log('found a yield should be update to await')
        path.node.type = 'AwaitExpression'
        delete path.node.delegate
      }
    }
  }
}
