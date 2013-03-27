# Gengo's Human Translation API 
## Node.js Client | Coffeescript

This is a fairly basic class that maps directly to the documentation found at [http://developers.gengo.com](http://developers.gengo.com "Developer documentation | Gengo.com").

Currently, this library does not duplicate any validation that the Gengo API does, but in the future this may also change.

This client does not implement the following Gengo API endpoints, but may in the future.

* [GET /translate/job/{id}/preview/](http://developers.gengo.com/v2/job/#preview-get "Developer documentation | Gengo.com") - core use case has been deprecated 
* [GET /translate/job/](http://developers.gengo.com/v2/job/#job-get "Developer documentation | Gengo.com")  - core use case has been replaced by the [GET /translate/jobs/{ids}](http://developers.gengo.com/v2/job/#jobs-by-id-get "Developer documentation | Gengo.com") endpoint 
* [GET /translate/jobs/group/{group_id}/](http://developers.gengo.com/v2/jobs/#job "Developer documentation | Gengo.com") - core use case has been deprecated
* [GET /translate/job/{id}/revisions/](http://developers.gengo.com/v2/job/#revisions-get "Developer documentation | Gengo.com")
* [GET /translate/job/{id}/revision/{rev_id}/](http://developers.gengo.com/v2/job/#revision-get "Developer documentation | Gengo.com")
* [GET /translate/job/{id}/feedback/](http://developers.gengo.com/v2/job/#feedback-get "Developer documentation | Gengo.com")

### Module dependencies

This library currently does not have any dependencies outside of core Node modules. However, in the future this may change.

    http = require 'http'
    qs = require 'querystring'
    crypto = require 'crypto'

### GengoClient class

Our GengoClient class expects an object containing API keys. This client is set to use the [developer sandbox](http://sandbox.gengo.com "Developer sandbox | Gengo.com") by default.

In production mode, you'll want to pass TRUE as a 2nd paramater.

    class GengoClient
      @sandbox_base_host = 'api.sandbox.gengo.com'
      @live_base_host = 'api.gengo.com'
      @api_version = 'v2'

      base_host = null
      api_keys =
        public: null
        private: null

      constructor: (@api_keys, use_production = false) ->
        @base_host = if use_production then GengoClient.live_base_host else GengoClient.sandbox_base_host

### GET endpoints

Most endpoints only require a callback function which the Gengo API's response is passed into as a parsed JSON object.

      getBalance: (callback = (res) ->) ->
        @_makeRequest 'GET', 'account/balance/', callback

      getStats: (callback = (res) ->) ->
        @_makeRequest 'GET', 'account/stats/', callback

      getLanguagePairs: (callback = (res) ->) ->
        @_makeRequest 'GET', 'translate/service/language_pairs/', callback

      getLanguages: (callback = (res) ->) ->
        @_makeRequest 'GET', 'translate/service/languages/', callback

This function has been renamed a bit from it's endpoint to clarifiy what result will be returned.

      getAllGlossaries: (callback = (res) ->) ->
        @_makeRequest 'GET', 'translate/glossary', callback

      getGlossary: (glossary_id, callback = (res) ->) ->
        @_makeRequest 'GET', "translate/glossary/#{glossary_id}/", callback

This function expects an array of job_ids, not a comma seperated string like the Gengo API expects. 

      getJobsByID: (job_ids, callback = (res) ->) ->
        @_makeRequest 'GET', "translate/jobs/#{job_ids.join ','}/", callback

      getJobComments: (job_id, callback = (res) ->) ->
        @_makeRequest 'GET', "translate/jobs/#{job_id}/comments/", callback

      getOrder: (order_id, callback = (res) ->) ->
        @_makeRequest 'GET', "translate/order/#{order_id}/", callback

### DELETE endpoints

These have been renamed for clarity.
These will only work if the translator has not yet started working.

      cancelOrder: (order_id, callback = (res) ->) ->
        @_makeRequest 'DELETE', "translate/order/#{order_id}/", callback

      cancelJob: (job_id, callback = (res) ->) ->
        @_makeRequest 'DELETE', "translate/job/#{job_id}/", callback

### PUT endpoints

Here are few convience functions that make the 3 types of updates a little clearier.

      approveJob: (job_id, callback = (res) ->) ->
        @updateJob job_id, {action: 'approve'}, callback

      reviseJob: (job_id, comment_for_translator, callback = (res) ->) ->
        @updateJob job_id, {action: 'revise', comment: comment_for_translator}, callback

      rejectJob: (job_id, reject_data, callback = (res) ->) ->
        reject_data.action = 'reject'
        @updateJob job_id, reject_data, callback

All put requests end up using the same end point

      updateJob: (job_id, data, callback = (res) ->) ->
        @_makeRequest 'PUT', "translate/job/#{job_id}/", callback, data

### POST endpoints

This function expects an object containing [Gengo job payloads](http://developers.gengo.com/v2/payloads/#job-payload---for-submissions "Developer documentation | Payloads | Gengo.com"). 

**Note:** Although the Gengo API defaults _as_group_ to 0, this client does the opposite. This client also automatically sets the position paramater for every payload (since it is so useful).

      postJobs: (job_payloads, callback = ((res) ->), as_group = 1) ->
        position = 0
        for slug, job of job_payloads
          job.position = position
          position += 1
        data =
          jobs: job_payloads
          as_group: if job_payloads.length is 1 then 0 else as_group
        @_makeRequest 'POST', 'translate/jobs/', callback, data

      postQuote: (job_payloads, callback = (res) ->) ->
        data =
          jobs: job_payloads
        @_makeRequest 'POST', 'service/quote/', callback, data

      postFileQuote: (job_payloads, callback = (res) ->) ->
        data =
          jobs: job_payloads
        @_makeRequest 'POST', 'service/quote/file/', callback, data

### Authenticating and making a request to the Gengo API
All end points require a signature to be created against the timestamp of the call and the Gengo API private key.

      _makeRequest: (req_method, endpoint, callback, param_data = {}) ->
        gengo_params =
          api_key: @api_keys.public
          ts: String (Math.round new Date().getTime() / 1000)
          data: JSON.stringify param_data
        gengo_params.api_sig = (crypto.createHmac 'sha1', @api_keys.private).update(gengo_params.ts).digest("hex")
        qs_params = qs.stringify gengo_params #query string

Set some basic HTTP headers depending on the method type for the call. GET and DELETE requests require the querystring to be appended to the endpoint. 

        req_headers =
          'User-Agent': 'gengo_nodejs v2'
          'Accept': 'application/json'
        if req_method is 'GET' or req_method is 'DELETE'
          endpoint += "?#{qs_params}"
        else
          req_headers['Content-Length'] = qs_params.length
          req_headers['Content-Type'] = 'application/x-www-form-urlencoded'

        req_options =
          method: req_method
          host: @base_host
          path: "/#{GengoClient.api_version}/#{endpoint}"
          headers: req_headers

Once the response has come back, the callback is passed the parsed response_body.

        console.log req_options        
        req = http.request req_options, (res) ->
          response_body = ''
          res.on 'data', (chunk) ->
            response_body += "#{chunk}"
          res.on 'end', () ->
              response_body = JSON.parse response_body
              if response_body.opstat is 'error'
                callback response_body.err
              else
                callback response_body.response

        req.write qs_params
        req.on 'error', (e) ->
          console.log e

        req.end()

That's it, export the class to the world.

    exports.Gengo = GengoClient