(function() {
  var GengoClient, crypto, http, qs;

  http = require('http');

  qs = require('querystring');

  crypto = require('crypto');

  GengoClient = (function() {
    var api_keys, base_host;

    GengoClient.sandbox_base_host = 'api.sandbox.gengo.com';

    GengoClient.live_base_host = 'api.gengo.com';

    GengoClient.api_version = 'v2';

    base_host = null;

    api_keys = {
      "public": null,
      "private": null
    };

    function GengoClient(api_keys, use_production) {
      this.api_keys = api_keys;
      if (use_production == null) {
        use_production = false;
      }
      this.base_host = use_production ? GengoClient.live_base_host : GengoClient.sandbox_base_host;
    }

    GengoClient.prototype.getBalance = function(callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', 'account/balance/', callback);
    };

    GengoClient.prototype.getStats = function(callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', 'account/stats/', callback);
    };

    GengoClient.prototype.getLanguagePairs = function(callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', 'translate/service/language_pairs/', callback);
    };

    GengoClient.prototype.getLanguages = function(callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', 'translate/service/languages/', callback);
    };

    GengoClient.prototype.getAllGlossaries = function(callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', 'translate/glossary', callback);
    };

    GengoClient.prototype.getGlossary = function(glossary_id, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', "translate/glossary/" + glossary_id + "/", callback);
    };

    GengoClient.prototype.getJobsByID = function(job_ids, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', "translate/jobs/" + (job_ids.join(',')) + "/", callback);
    };

    GengoClient.prototype.getJobComments = function(job_id, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', "translate/jobs/" + job_id + "/comments/", callback);
    };

    GengoClient.prototype.getOrder = function(order_id, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('GET', "translate/order/" + order_id + "/", callback);
    };

    GengoClient.prototype.cancelOrder = function(order_id, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('DELETE', "translate/order/" + order_id + "/", callback);
    };

    GengoClient.prototype.cancelJob = function(job_id, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('DELETE', "translate/job/" + job_id + "/", callback);
    };

    GengoClient.prototype.approveJob = function(job_id, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this.updateJob(job_id, {
        action: 'approve'
      }, callback);
    };

    GengoClient.prototype.reviseJob = function(job_id, comment_for_translator, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this.updateJob(job_id, {
        action: 'revise',
        comment: comment_for_translator
      }, callback);
    };

    GengoClient.prototype.rejectJob = function(job_id, reject_data, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      reject_data.action = 'reject';
      return this.updateJob(job_id, reject_data, callback);
    };

    GengoClient.prototype.updateJob = function(job_id, data, callback) {
      if (callback == null) {
        callback = function(res) {};
      }
      return this._makeRequest('PUT', "translate/job/" + job_id + "/", callback, data);
    };

    GengoClient.prototype.postJobs = function(job_payloads, callback, as_group) {
      var data, job, position, slug;

      if (callback == null) {
        callback = (function(res) {});
      }
      if (as_group == null) {
        as_group = 1;
      }
      position = 0;
      for (slug in job_payloads) {
        job = job_payloads[slug];
        job.position = position;
        position += 1;
      }
      data = {
        jobs: job_payloads,
        as_group: job_payloads.length === 1 ? 0 : as_group
      };
      return this._makeRequest('POST', 'translate/jobs/', callback, data);
    };

    GengoClient.prototype.postQuote = function(job_payloads, callback) {
      var data;

      if (callback == null) {
        callback = function(res) {};
      }
      data = {
        jobs: job_payloads
      };
      return this._makeRequest('POST', 'service/quote/', callback, data);
    };

    GengoClient.prototype.postFileQuote = function(job_payloads, callback) {
      var data;

      if (callback == null) {
        callback = function(res) {};
      }
      data = {
        jobs: job_payloads
      };
      return this._makeRequest('POST', 'service/quote/file/', callback, data);
    };

    GengoClient.prototype._makeRequest = function(req_method, endpoint, callback, param_data) {
      var gengo_params, qs_params, req, req_headers, req_options;

      if (param_data == null) {
        param_data = {};
      }
      gengo_params = {
        api_key: this.api_keys["public"],
        ts: String(Math.round(new Date().getTime() / 1000)),
        data: JSON.stringify(param_data)
      };
      gengo_params.api_sig = (crypto.createHmac('sha1', this.api_keys["private"])).update(gengo_params.ts).digest("hex");
      qs_params = qs.stringify(gengo_params);
      req_headers = {
        'User-Agent': 'gengo_nodejs v2',
        'Accept': 'application/json'
      };
      if (req_method === 'GET' || req_method === 'DELETE') {
        endpoint += "?" + qs_params;
      } else {
        req_headers['Content-Length'] = qs_params.length;
        req_headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      req_options = {
        method: req_method,
        host: this.base_host,
        path: "/" + GengoClient.api_version + "/" + endpoint,
        headers: req_headers
      };
      console.log(req_options);
      req = http.request(req_options, function(res) {
        var response_body;

        response_body = '';
        res.on('data', function(chunk) {
          return response_body += "" + chunk;
        });
        return res.on('end', function() {
          response_body = JSON.parse(response_body);
          if (response_body.opstat === 'error') {
            return callback(response_body.err);
          } else {
            return callback(response_body.response);
          }
        });
      });
      req.write(qs_params);
      req.on('error', function(e) {
        return console.log(e);
      });
      return req.end();
    };

    return GengoClient;

  })();

  exports.Gengo = GengoClient;

}).call(this);
