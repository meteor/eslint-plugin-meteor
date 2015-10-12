/**
 * @fileoverview Ensures that the names of the arguments of event handlers are always the same
 * @author Philipp Sporrer
 * @copyright 2015 Philipp Sporrer. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

import {
  CLIENT,
  UNIVERSAL,
  NON_METEOR
} from '../../../dist/util/environment.js'
var rule = require('../../../dist/rules/blaze-consistent-eventmap-parameters')
var RuleTester = require('eslint').RuleTester

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

var ruleTester = new RuleTester()
ruleTester.run('blaze-consistent-eventmap-parameters', rule(() => ({env: CLIENT})), {

  valid: [
    `
      Template.x.events({
        'submit form': function (event) {}
      })
    `,
    `
      Template.x.events({
        'submit form': {}
      })
    `,
    `
      Template.x.events()
    `,
    `
      Template.x.events(null)
    `,
    {
      code: `
        Template.x.events({
          'submit form': function (evt) {}
        })
      `,
      options: [{
        eventParamName: 'evt'
      }]
    },
    {
      code: `
        Template.x.events({
          'submit form': function (evt, tmplInst) {}
        })
      `,
      options: [{
        eventParamName: 'evt',
        templateInstanceParamName: 'tmplInst'
      }]
    },
    `
      Template.x.events({
        'submit form': function (event, templateInstance) {}
      })
    `,
    {
      code: `
        Template.x.events({
          'submit form': (event, templateInstance) => {}
        })
      `,
      parser: 'babel-eslint'
    }
  ],

  invalid: [
    {
      code: `
        Template.x.events({
          'submit form': function (foo, bar) {}
        })
      `,
      errors: [
        {message: 'Invalid parameter name, use "event" instead', type: 'Identifier'},
        {message: 'Invalid parameter name, use "templateInstance" instead', type: 'Identifier'}
      ]
    },
    {
      code: `
        Template.x.events({
          'submit form': (foo, bar) => {}
        })
      `,
      errors: [
        {message: 'Invalid parameter name, use "event" instead', type: 'Identifier'},
        {message: 'Invalid parameter name, use "templateInstance" instead', type: 'Identifier'}
      ],
      parser: 'babel-eslint'
    },
    {
      code: `
        Template.x.events({
          'submit form': function (foo, templateInstance) {}
        })
      `,
      errors: [
        {message: 'Invalid parameter name, use "event" instead', type: 'Identifier'}
      ]
    },
    {
      code: `
        Template.x.events({
          'submit form': function (event, bar) {}
        })
      `,
      errors: [
        {message: 'Invalid parameter name, use "templateInstance" instead', type: 'Identifier'}
      ]
    }
  ]

})

ruleTester.run('blaze-consistent-eventmap-parameters', rule(() => ({env: UNIVERSAL})), {

  valid: [
    `
      if (Meteor.isClient) {
        Template.x.events({
          'submit form': function (event, templateInstance) {}
        })
      }
    `,
    {
      code: `
        if (Meteor.isClient) {
          Template.x.events({
            'submit form': (event, templateInstance) => {}
          })
        }
      `,
      parser: 'babel-eslint'
    }
  ],

  invalid: [
    {
      code: `
        if (Meteor.isClient) {
          Template.x.events({
            'submit form': function (foo, bar) {}
          })
        }
      `,
      errors: [
        {message: 'Invalid parameter name, use "event" instead', type: 'Identifier'},
        {message: 'Invalid parameter name, use "templateInstance" instead', type: 'Identifier'}
      ]
    },
    {
      code: `
        if (Meteor.isServer) {
          Template.x.events({
            'submit form': function () {}
          })
        }
      `,
      errors: [
        {message: 'Allowed on client only', type: 'Property'}
      ]
    }
  ]

})

ruleTester.run('pubsub', rule(() => ({env: NON_METEOR})), {
  valid: [
    'foo()'
  ],
  invalid: []
})
