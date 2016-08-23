#!/usr/bin/env node
'use strict'
const meow = require('meow')
const crypto = require('crypto')
const request = require('request')

const cli = meow(`
    Usage
      $ fever-data FeverURL -u username -p password
      FeverURL should include protocol (eg. http://) and no trailing slash.
 
    Options
      -u specify Fever username (required)
      -p specify Fever password (required)
 
    Examples
      $ fever-data fever.com -u username -p password

`, {

})

feverData(cli.input[0], cli.flags)

function feverData (input, flags) {
  var feverURL = null
  var feverAPIkey = null

  if (input === undefined) {
    console.log(JSON.stringify({'Error': 'No Fever URL Specified'}))
    return
  } else if (!isURL(input)) {
    console.log(JSON.stringify({'Error': 'Invalid URL Specified - include http:// ?'}))
    return
  } else {
    feverURL = input + '/'
  }

  if ((flags.u === undefined) || (flags.p === undefined)) {
    console.log(JSON.stringify({'Error': 'User/Pass not Specified'}))
    return
  } else {
    feverAPIkey = crypto.createHash('md5').update(flags.u + ':' + flags.p).digest('hex')
  }

  var options = { method: 'POST',
    url: feverURL,
    qs: { api: '', links: '' },
    headers:
     { 'cache-control': 'no-cache',
       'content-type': 'application/x-www-form-urlencoded' },
    form: { api_key: feverAPIkey } }

  request(options, function (error, response, body) {
    if (error) {
      console.log(JSON.stringify({'Error': error.toString()}))
      return
    }
    if (isJSON(body)) {
      var data = JSON.parse(body)
      if (data.auth === 1) {
        console.log(body)
      } else {
        console.log(JSON.stringify({'Error': 'Fever Authentication Failed. Check User/Pass'}))
      }
    } else {
      console.log(JSON.stringify({'Error': 'Server response not JSON. Check URL?'}))
    }
  })
}
// Helpers
function isJSON (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
function isURL (str) {
  // https://gist.github.com/dperini/729294
  var pattern = new RegExp(
    '^' +
    // protocol identifier
    '(?:(?:https?|ftp)://)' +
    // user:pass authentication
    '(?:\\S+(?::\\S*)?@)?' +
    '(?:' +
    // IP address exclusion
    // private & local networks
    '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
    '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    // host name
    '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
    // domain name
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
    // TLD identifier
    '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
    // TLD may end with dot
    '\\.?' +
    ')' +
    // port number
    '(?::\\d{2,5})?' +
    // resource path
    '(?:[/?#]\\S*)?' +
  '$', 'i'
  )
  return pattern.test(str)
}

