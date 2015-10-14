/**
 * @fileoverview Ensures consistent parameter names in blaze event maps
 * @author Philipp Sporrer
 * @copyright 2015 Philipp Sporrer. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import {isFunction} from '../util/ast'
import {getExecutors} from '../util'

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

module.exports = getMeta => context => {

  const {env, isLintedEnv} = getMeta(context.getFilename())

  if (!isLintedEnv) {
    return {}
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function ensureParamName (param, expectedParamName) {
    if (param && param.name !== expectedParamName) {
      context.report(
        param,
        `Invalid parameter name, use "${expectedParamName}" instead`
      )
    }
  }

  function validateEventDef (eventDefNode, executors) {

    if (executors.has('server')) {
      return context.report(
        eventDefNode,
        `Allowed on client only`
      )
    }

    // check if the event definition has a value
    const eventHandler = eventDefNode.value
    // check if the event definition's value is a function
    // (aka the event handler)
    if (isFunction(eventHandler.type)) {
      // check if the first parameter name is equal to 'event'
      ensureParamName(
        eventHandler.params[0],
        context.options[0] ? context.options[0].eventParamName : 'event'
      )
      // check if the second parameter name is equal to 'event'
      ensureParamName(
        eventHandler.params[1],
        context.options[0] ? context.options[0].templateInstanceParamName : 'templateInstance'
      )
    }

  }

  // ---------------------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------------------

  return {

    CallExpression(node) {

      const ancestors = context.getAncestors()
      const executors = getExecutors(env, ancestors)
      // check if the Template.x.events(/*eventMap*/) call got any arguments
      if (node.arguments.length > 0) {
        const eventMap = node.arguments[0]
        // check if the event map argument is an object
        if (
          eventMap.type === 'ObjectExpression'
        ) {
          eventMap.properties.forEach((eventDef) => validateEventDef(eventDef, executors))
        }
      }

    }

  }

}

module.exports.schema = [
  {
    type: 'object',
    properties: {
      eventParamName: {
        type: 'string'
      },
      templateInstanceParamName: {
        type: 'string'
      }
    },
    additionalProperties: false
  }
]
