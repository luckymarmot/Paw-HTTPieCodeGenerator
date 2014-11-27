require "mustache.js"
require "URI.js"

addslashes = (str) ->
    ("#{str}").replace(/[\\"]/g, '\\$&')

HTTPieCodeGenerator = ->

    @url = (request) ->
        url_params_object = (() ->
            _uri = URI request.url
            _uri.search true
        )()
        url_params = ({
            "name": addslashes name
            "value": addslashes value
        } for name, value of url_params_object)

        return {
            "base": addslashes (() ->
                _uri = URI request.url
                _uri.search("")
                _uri
            )()
            "params": url_params
            "has_params": url_params.length > 0
        }

    @headers = (request) ->
        headers = request.headers
        return {
            "has_headers": Object.keys(headers).length > 0
            "header_list": ({
                "header_name": addslashes header_name
                "header_value": addslashes header_value
            } for header_name, header_value of headers)
        }

    @body = (request) ->
        json_body = request.jsonBody
        if json_body
            return {
                "has_json_body":true
                "json_body_object":@json_body_object json_body
            }

        url_encoded_body = request.urlEncodedBody
        if url_encoded_body
            return {
                "has_url_encoded_body":true
                "url_encoded_body": ({
                    "name": addslashes name
                    "value": addslashes value
                } for name, value of url_encoded_body)
            }

        multipart_body = request.multipartBody
        if multipart_body
            return {
                "has_multipart_body":true
                "multipart_body": ({
                    "name": addslashes name
                    "value": addslashes value
                } for name, value of multipart_body)
            }

        raw_body = request.body
        if raw_body
            if raw_body.length < 5000
                has_tabs_or_new_lines = (null != /\r|\n|\t/.exec(raw_body))
                return {
                    "has_raw_body_with_tabs_or_new_lines":has_tabs_or_new_lines
                    "has_raw_body_without_tabs_or_new_lines":!has_tabs_or_new_lines
                    "raw_body": addslashes raw_body
                }
            else
                return {
                    "has_long_body":true
                }

    @json_body_object = (object) ->
        if object == null
            s = "null"
        else if typeof(object) == 'string'
            s = "\"#{addslashes object}\""
        else if typeof(object) == 'number'
            s = "#{object}"
        else if typeof(object) == 'boolean'
            s = "#{if object then "true" else "false"}"
        else if typeof(object) == 'object'
            if object.length?
                s = "'[" + ("#{@json_body_object(value)}" for value in object).join(',') + "]'"
            else 
                for key, value of object
                    if typeof(value) == 'string'
                        sign = "="
                    else sign = ":="
                    s += "    #{addslashes key}#{sign}#{@json_body_object(value)} \\\n"
        return s

    @strip_last_backslash = (string) ->
        # Remove the last backslash on the last non-empty line
        # We do that programatically as it's difficult to know the "last line"
        # in Mustache templates

        lines = string.split("\n")
        for i in [(lines.length - 1)..0]
            lines[i] = lines[i].replace(/\s*\\\s*$/, "")
            if not lines[i].match(/^\s*$/)
                break
        lines.join("\n")

    @generate = (context) ->
        request = context.getCurrentRequest()

        view =
            "request": context.getCurrentRequest()
            "method": request.method.toUpperCase()
            "url": @url request
            "headers": @headers request
            "body": @body request

        template = readFile "httpie.mustache"
        rendered_code = Mustache.render template, view
        @strip_last_backslash rendered_code

    return


HTTPieCodeGenerator.identifier =
    "com.luckymarmot.PawExtensions.HTTPieCodeGenerator";
HTTPieCodeGenerator.title =
    "HTTPie";

registerCodeGenerator HTTPieCodeGenerator
