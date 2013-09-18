chai = require 'chai'
chai.should()

{Gengo} = require '../src/gengo'

describe 'A Gengo client on the sandbox environment', ->
  public_key = 'Z0dOG$I2smAVKg[yp3qv{9iQrFI7HliKN8w3=_4W_hFRFBf=DCVRiT~4F7]HO@XE'
  private_key = 'g7|tBY4zqbcHHo5]6SW2f{X@Ht~USc)K0ohWO}m$-()Riya(5yBM7DTHQawQGhWY'
  gengo = new Gengo {'public': public_key, 'private': private_key}
  # We'll use these for testing
  test_order_1 = 
    test_job_1:
      slug: "test_job_1"
      body_src: "This is a test from gengo_node ##{Math.floor Math.random()*10001}"
      lc_src: 'en'
      lc_tgt: 'ja'
      type: 'text'
      tier: 'standard'
      auto_approve: '1',
      use_preferred: '1',
      custom_data: '{test_job_number: 1}'
  test_order_2 = 
    test_job_2:
      slug: "test_job_2"
      body_src: "This is a test from gengo_node ##{Math.floor Math.random()*10001}"
      lc_src: 'en'
      lc_tgt: 'ja'
      type: 'text'
      tier: 'standard'
      custom_data: '{test_job_number: 2}'
    test_job_3:
      slug: "test_job_3"
      body_src: "This is a test from gengo_node ##{Math.floor Math.random()*10001}"
      lc_src: 'en'
      lc_tgt: 'ja'
      type: 'text'
      tier: 'standard'
      custom_data: '{test_job_number: 3}'
  test_order_1_id = test_order_2_id = test_order_3_id = test_job_1_id = test_job_2_id = test_job_3_id = null

  it 'should have API keys', ->
    gengo.should.have.property('api_keys')
  # we start by posting 2 jobs, and then running other tests to give it time to get into Gengo's system
  it 'should post 1 job successfully', (done) ->
    gengo.postJobs test_order_1, (res) ->
      res.credits_used.should.be.above(0)
      test_order_1_id = res.order_id
      done()
  it 'should post 2 jobs successfully', (done) ->
    gengo.postJobs test_order_2, (res) ->
      res.credits_used.should.be.above(0)
      test_order_2_id = res.order_id
      done()
  it 'should get a quote for a job', (done) ->
    gengo.postQuote test_order_1, (res) ->
      res.jobs.should.be.an('array')
      res.jobs[1].should.have.property('unit_count').below(0)
      done()
  it 'should have credits in the account', (done) ->
    gengo.getBalance (res) ->
      res.credits.should.be.above(0)
      done()
  it 'should find account statistics', (done) ->
    gengo.getStats (res) ->
      # I'm not so sure this number should be a negative...
      res.credits_spent.should.be.below(0)
      done()
  it 'should find an array of language pairs', (done) ->
    gengo.getLanguagePairs (res) ->
      res.should.be.an('array')
      done()
  it 'should find an array of languages', (done) ->
    gengo.getLanguages (res) ->
      res.should.be.an('array')
      done()
  it "should not be auth'd to see order #13", (done) ->
    gengo.getOrder 13, (res) ->
      # 2750 is unauthorized access
      res.should.have.property('code').equal(2750)
      done()
  it "should find a job (hopefully) not queued", (done) ->
    gengo.getOrder test_order_2_id, (res) ->
      [test_job_2_id, test_job_3_id] = res.order.jobs_available
      res.order.should.have.property('jobs_queued').equal('0')
      done()
  it "should get 2 job payloads", (done) ->
    gengo.getJobsByID [test_job_2_id, test_job_3_id], (res) ->
      res.jobs.should.be.an('array')
      res.jobs[1].should.have.property('status').equal('available')
      done()
  it "should find a previously ordered job and not order it", (done) ->
    gengo.postJobs test_order_1, (res) ->
      res.should.have.property('jobs')
      # confirm the key and and custom data and the job id stuffs
      # confirm no order info
      done()
  it "should order the duplicate job if forced is set", (done) ->
    test_order_1.test_job_1.force = 1
    gengo.postJobs test_order_1, (res) ->
     res.credits_used.should.be.above(0)
     done() 