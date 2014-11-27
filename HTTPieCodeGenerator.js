// Generated by CoffeeScript 1.8.0
(function() {
  var HTTPieCodeGenerator, addslashes;

  require("mustache.js");

  require("URI.js");

  addslashes = function(str) {
    return ("" + str).replace(/[\\"]/g, '\\$&');
  };

  HTTPieCodeGenerator = function() {
    this.url = function(request) {
      var name, url_params, url_params_object, value;
      url_params_object = (function() {
        var _uri;
        _uri = URI(request.url);
        return _uri.search(true);
      })();
      url_params = (function() {
        var _results;
        _results = [];
        for (name in url_params_object) {
          value = url_params_object[name];
          _results.push({
            "name": addslashes(name),
            "value": addslashes(value)
          });
        }
        return _results;
      })();
      return {
        "base": addslashes((function() {
          var _uri;
          _uri = URI(request.url);
          _uri.search("");
          return _uri;
        })()),
        "params": url_params,
        "has_params": url_params.length > 0
      };
    };
    this.headers = function(request) {
      var header_name, header_value, headers;
      headers = request.headers;
      return {
        "has_headers": Object.keys(headers).length > 0,
        "header_list": (function() {
          var _results;
          _results = [];
          for (header_name in headers) {
            header_value = headers[header_name];
            _results.push({
              "header_name": addslashes(header_name),
              "header_value": addslashes(header_value)
            });
          }
          return _results;
        })()
      };
    };
    this.body = function(request) {
      var has_tabs_or_new_lines, json_body, multipart_body, name, raw_body, url_encoded_body, value;
      json_body = request.jsonBody;
      if (json_body) {
        return {
          "has_json_body": true,
          "json_body_object": this.json_body_object(json_body)
        };
      }
      url_encoded_body = request.urlEncodedBody;
      if (url_encoded_body) {
        return {
          "has_url_encoded_body": true,
          "url_encoded_body": (function() {
            var _results;
            _results = [];
            for (name in url_encoded_body) {
              value = url_encoded_body[name];
              _results.push({
                "name": addslashes(name),
                "value": addslashes(value)
              });
            }
            return _results;
          })()
        };
      }
      multipart_body = request.multipartBody;
      if (multipart_body) {
        return {
          "has_multipart_body": true,
          "multipart_body": (function() {
            var _results;
            _results = [];
            for (name in multipart_body) {
              value = multipart_body[name];
              _results.push({
                "name": addslashes(name),
                "value": addslashes(value)
              });
            }
            return _results;
          })()
        };
      }
      raw_body = request.body;
      if (raw_body) {
        if (raw_body.length < 5000) {
          has_tabs_or_new_lines = null !== /\r|\n|\t/.exec(raw_body);
          return {
            "has_raw_body_with_tabs_or_new_lines": has_tabs_or_new_lines,
            "has_raw_body_without_tabs_or_new_lines": !has_tabs_or_new_lines,
            "raw_body": addslashes(raw_body)
          };
        } else {
          return {
            "has_long_body": true
          };
        }
      }
    };
    this.json_body_object = function(object) {
      var key, s, sign, value;
      if (object === null) {
        s = "null";
      } else if (typeof object === 'string') {
        s = "\"" + (addslashes(object)) + "\"";
      } else if (typeof object === 'number') {
        s = "" + object;
      } else if (typeof object === 'boolean') {
        s = "" + (object ? "true" : "false");
      } else if (typeof object === 'object') {
        if (object.length != null) {
          s = "'[" + ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = object.length; _i < _len; _i++) {
              value = object[_i];
              _results.push("" + (this.json_body_object(value)));
            }
            return _results;
          }).call(this)).join(',') + "]'";
        } else {
          for (key in object) {
            value = object[key];
            console.log(value);
            if (typeof value === 'string') {
              sign = "=";
            } else {
              sign = ":=";
            }
            s += "    " + (addslashes(key)) + sign + (this.json_body_object(value)) + "\\\n";
          }
        }
      }
      return s;
    };
    this.strip_last_backslash = function(string) {
      var i, lines, _i, _ref;
      lines = string.split("\n");
      for (i = _i = _ref = lines.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        lines[i] = lines[i].replace(/\s*\\\s*$/, "");
        if (!lines[i].match(/^\s*$/)) {
          break;
        }
      }
      return lines.join("\n");
    };
    this.generate = function(context) {
      var rendered_code, request, template, view;
      request = context.getCurrentRequest();
      view = {
        "request": context.getCurrentRequest(),
        "method": request.method.toUpperCase(),
        "url": this.url(request),
        "headers": this.headers(request),
        "body": this.body(request)
      };
      template = readFile("httpie.mustache");
      rendered_code = Mustache.render(template, view);
      return this.strip_last_backslash(rendered_code);
    };
  };

  HTTPieCodeGenerator.identifier = "com.luckymarmot.PawExtensions.HTTPieCodeGenerator";

  HTTPieCodeGenerator.title = "HTTPie";

  registerCodeGenerator(HTTPieCodeGenerator);

}).call(this);
