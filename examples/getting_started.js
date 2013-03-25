(function() {
  var Gengo, blog_post, blog_post_job_ids, blog_post_order_id, gengoClient;

  Gengo = require(Gengo);

  gengoClient = new Gengo({
    "public": YOUR_PUBLIC_KEY,
    "private": your_private_key
  });

  blog_post = {
    title: {
      lc_src: 'en',
      lc_tgt: 'ja',
      tier: 'standard',
      body_src: "This is the title of my blog post",
      custom_data: {
        blog_post_id: 2322,
        part: 'title'
      },
      callback_url: "http://mysite.com/gengo_callback/"
    },
    body: {
      lc_src: 'en',
      lc_tgt: 'ja',
      tier: 'standard',
      body_src: "This is the body content of my blog post",
      custom_data: {
        blog_post_id: 2322,
        part: 'body'
      },
      callback_url: "http://mysite.com/gengo_callback/"
    }
  };

  blog_post_order_id = null;

  Gengo.postJobs(blog_post, function(res) {
    blog_post_order_id = res.order_id;
    return console.log(res);
  });

  ({
    "order_id": "139370",
    "group_id": 23015,
    "job_count": "2",
    "credits_used": "3.50",
    "currency": "USD"
  });

  blog_post_job_ids = null;

  Gengo.getOrder(blog_post_order_id, function(res) {
    blog_post_job_ids = res.order.jobs_available;
    return console.log(res);
  });

  ({
    "order": {
      "order_id": "139370",
      "total_credits": "3.50",
      "currency": "USD",
      "total_units": 17,
      "as_group": 1,
      "jobs_available": ["243646", "243647"],
      "jobs_pending": [],
      "jobs_reviewable": [],
      "jobs_approved": [],
      "jobs_queued": 0,
      "total_jobs": "2"
    }
  });

}).call(this);
