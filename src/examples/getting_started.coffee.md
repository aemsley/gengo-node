# GENGO'S HUMAN TRANSLATION API

Gengo makes it easy to plug human powered translation in to your service or platform.

## Install

  $npm install gengo-node

## Require

    Gengo = require Gengo
    gengoClient = new Gengo {public: YOUR_PUBLIC_KEY, private: your_private_key}

By default the client sends all requests to the [Gengo Sandbox environment](http://sandbox.gengo.com "Sandbox environment | Gengo.com").

## Send a couple of jobs for translation

First we create a couple of jobs that represent a blog post. I've only set a few of the options here, but check out [the job payloads](http://developers.gengo.com/payloads/ "Job payloads | Developer documentation | Gengo.com") for a full list.

    blog_post =
      title:
        lc_src: 'en'
        lc_tgt: 'ja'
        tier: 'standard'
        body_src: "This is the title of my blog post"
        custom_data: {blog_post_id: 2322, part: 'title'}
        callback_url: "http://mysite.com/gengo_callback/"
      body:
        lc_src: 'en'
        lc_tgt: 'ja'
        tier: 'standard'
        body_src: "This is the body content of my blog post"
        custom_data: {blog_post_id: 2322, part: 'body'}
        callback_url: "http://mysite.com/gengo_callback/"

There are two important concepts in this payload.

1. custom_data: Here we've added 2 bits of information that will help us map the translated content back to our own system. In this example a blog post ID and the part of the post.

2. callback_url: Since there will be real human translators working on the content it may take a bit of time. Once the translation is ready we'll post the translation to the URL provided along with the custom_data and order details.

Since the Gengo API is designed to support thousnads of jobs, there is a queueing mechanism placed in front of the API. This means that when a jobs are sent, we reply with an order_id and put the jobs in a queue.

    blog_post_order_id = null
    Gengo.postJobs blog_post, (res) ->
      blog_post_order_id = res.order_id
      console.log res

      ###
      {
        "order_id": "139370",
        "group_id": 23015,
        "job_count": "2",
        "credits_used": "3.50",
        "currency": "USD"
      }
      ###

Now that we have the order ID we can check on the status of the order.
  
    blog_post_job_ids = null
    Gengo.getOrder blog_post_order_id, (res) ->
      blog_post_job_ids = res.order.jobs_available
      console.log res

      ###
      {
        "order": {
          "order_id": "139370",
          "total_credits": "3.50",
          "currency": "USD",
          "total_units": 17,
          "as_group": 1,
          "jobs_available": [
            "243646",
            "243647",
          ],
          "jobs_pending": [],
          "jobs_reviewable": [],
          "jobs_approved": [],
          "jobs_queued": 0,
          "total_jobs": "2"
        }
      }
      ###