(function() {
  var Gengo, gengoClient;

  Gengo = require('../lib/gengo').Gengo;

  gengoClient = new Gengo({
    "public": 'Z0dOG$I2smAVKg[yp3qv{9iQrFI7HliKN8w3=_4W_hFRFBf=DCVRiT~4F7]HO@XE',
    "private": 'g7|tBY4zqbcHHo5]6SW2f{X@Ht~USc)K0ohWO}m$-()Riya(5yBM7DTHQawQGhWY'
  });

  /*
  gengoClient.reviseJob 305584, 'try again', (res) ->
    console.log res
  */


  /*   
  order_id = 153630
  gengoClient.getOrder order_id, (res) ->
    console.log res
  */


  gengoClient.getJobsByID([305583], function(res) {
    return console.log(res);
  });

  /*
  blog_post =
    title:
      slug: 'something new 12xx'
      lc_src: 'en'
      lc_tgt: 'ja'
      tier: 'standard'
      body_src: "This is the titlxe of my blog post"
      custom_data: "{blog_post_id: 2322, part: 'title'}"
      callback_url: "http://mysite.com/gengo_callback/"
    body:
      slug: 'something new 13xx'
      lc_src: 'en'
      lc_tgt: 'ja'
      tier: 'standard'
      body_src: "This is txxxxhe body content of my blog post"
      custom_data: "{blog_post_id: 2322, part: 'body'}"
      callback_url: "http://mysite.com/gengo_callback/"
  
  gengoClient.postJobs blog_post, (res) ->
    console.log res
  */


  /*
  gengoClient.cancelOrder 153624, (res) ->
    console.log res
  */


}).call(this);
