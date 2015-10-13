/**
 * @fileoverview Ensures consistent parameter names in blaze event maps
 * @author Philipp Sporrer
 * @copyright 2015 Philipp Sporrer. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import {CLIENT, UNIVERSAL} from '../util/environment'
import {isInServerBlock, isFunction} from '../util/ast'

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

module.exports = getMeta => context => {

  const {env} = getMeta(context.getFilename())

  if (env !== CLIENT && env !== UNIVERSAL) {
    return {}
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function ensureParamName (node, paramIndex, expectedParamName) {
    const param = node.params[paramIndex]
    if (param && param.name !== expectedParamName) {
      context.report(
        param,
        `Invalid parameter name, use "${expectedParamName}" instead`
      )
    }
  }

  function validateEventDef (eventDefNode, ancestors) {

    if (env === UNIVERSAL && isInServerBlock(ancestors)) {
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
        eventHandler,
        0,
        context.options[0] ? context.options[0].eventParamName : 'event'
      )
      // check if the second parameter name is equal to 'event'
      ensureParamName(
        eventHandler,
        1,
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
      // check if the Template.x.events(/*eventMap*/) call got any arguments
      if (node.arguments.length > 0) {
        const eventMap = node.arguments[0]
        // check if the event map argument is an object
        if (
          eventMap.type === 'ObjectExpression'
        ) {
          eventMap.properties.forEach((eventDef) => validateEventDef(eventDef, ancestors))
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
