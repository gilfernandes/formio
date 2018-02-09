'use strict';

module.exports = {
  emsCookieName: "cookieems",
  forms: {
    requestOptions: {
      host: 'localhost',
      port: 8091,
      path: '/events/r/formio/import',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    propagateForms: function (handler, req, res) {
      if (res.resource && res.resource.item && res.resource.item.type === "form") {
        if (req.method === "POST") {
          module.exports.forms.sendToEMS(res.resource, req);
        }
        else if (req.method === "PUT") {
          module.exports.forms.sendToEMS(res.resource, req);
        }
      }
    },
    sendToEMS: function (resource, req) {
      const formToPost = module.exports.forms.createFormUrl(resource);
      if (formToPost && req.headers[module.exports.emsCookieName]) {
        module.exports.forms.sendEMSFormRequest(formToPost, req.headers[module.exports.emsCookieName]);
      }
    },
    createFormUrl: function (resource, jsessionid) {
      // TODO: make this server configurable.
      return encodeURI(`http://localhost:3001/form/${resource.item._id}`);
    },
    extractJSession: function (str) {
      if (!str) {
        return null;
      }
      let replace = str.replace(/.*JSESSIONID=(.+?)(;|$).*/, "$1");
      return replace === str ? null : replace;
    },
    sendEMSFormRequest: function (formUrl, allCookies) {
      const http = require("http");
      const options = {
        host: 'gil.brahmakumaris.org',
        port: 8092,
        path: '/events/controller/formio/get/import?urlStr=' + formUrl,
        method: 'GET',
        headers: {
          'Cookie': allCookies,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        }
      };
      const req = http.request(options, function (res) {
        let output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
          output += chunk;
        });

        res.on('end', function () {
          console.log(output);
        });
      });

      req.on('error', function (err) {
        console.log('error: ' + err.message);
      });

      req.end();
    }
  },
  api: {
    jsession: function (app) {
      app.all('/jsession', function (req, res, next) {
        if (req.query.jsession) {
          console.log("JSession: " + req.query.jsession);
          res.cookie('JSESSIONID', req.query.jsession);
          res.header('Access-Control-Allow-Credentials', 'true');
        }
        res.redirect("/");
      });
    }
  }
};
