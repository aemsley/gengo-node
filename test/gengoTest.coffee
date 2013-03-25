chai = require 'chai'
chai.should()

{Gengo} = require '../src/client'

describe 'A Gengo client on the sandbox environment', ->
  public_key = 'Z0dOG$I2smAVKg[yp3qv{9iQrFI7HliKN8w3=_4W_hFRFBf=DCVRiT~4F7]HO@XE'
  private_key = 'g7|tBY4zqbcHHo5]6SW2f{X@Ht~USc)K0ohWO}m$-()Riya(5yBM7DTHQawQGhWY'
  gengo = new Gengo {'public': public_key, 'private': private_key}
  # We'll use these for testing
  test_order_1 = 
    test_job_1:
      body_src: "This is a test from gengo_node ##{Math.floor Math.random()*1001}"
      lc_src: 'en'
      lc_tgt: 'ja'
      type: 'text'
      tier: 'standard'
      custom_data: '{test_job_number: 1}'
  test_order_2 = 
    test_job_2:
      body_src: "This is a test from gengo_node ##{Math.floor Math.random()*1001}"
      lc_src: 'en'
      lc_tgt: 'ja'
      type: 'text'
      tier: 'standard'
      custom_data: '{test_job_number: 2}'
    test_job_3:
      body_src: "This is a test from gengo_node ##{Math.floor Math.random()*1001}"
      lc_src: 'en'
      lc_tgt: 'ja'
      type: 'text'
      tier: 'standard'
      custom_data: '{test_job_number: 3}'
  test_order_1_id = test_order_2_id = test_job_1_id = test_job_2_id = test_job_3_id = null

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
      res.jobs[0].should.have.property('status').equal('available')
      done()
  describe 'and on the production environment', ->
    # keys for live testing
    public_key = ')SrBf3dqbfT0Q[$Os-6i4RE(u)6BTxqOm$$dj_oLutaHUw-AJlbgM~rFde|{_u5F'
    private_key = 'evz_jZ_PBVzdRb2FJn^Iyl5-tMABc5Z$V2inii_R86mtx8Xy2BPW0C$4{0|{lYcx'
    gengo = new Gengo {'public': public_key, 'private': private_key}, true
    it 'should find a list of glossaries', (done) ->
      gengo.getAllGlossaries (res) ->
        res.should.be.an('array')
        res[0].should.have.property('id').equal(376)
        done()
    it 'should find glossary #376 is connected to user #7056', (done) ->
      # Should note that this does not bring back any more information than the list call
      gengo.getGlossary 376, (res) ->
        res.should.have.property('customer_user_id').equal(7056)
        done()