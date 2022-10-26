const router = require('koa-router')()

const { 
  excuteNpmPkgChange, 
  excuteInstall, 
  excuteCheckoutBranch, 
  excutePushOrigin, 
  excutePullBranch 
} = require('../utils/excute') 

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})


router.post('/change', async (ctx, next) => {
  const body = ctx.request.body || {}
  console.log(body)
  try {
    await excutePullBranch(body)
    await excuteCheckoutBranch(body)
    await excuteNpmPkgChange(body)
    const installOutput = await excuteInstall(body)
    const pushOutput = await excutePushOrigin(body)
    ctx.body = {
      code: 0,
      installOutput,
      pushOutput
    }
  } catch (error) {
    console.log(error.toString(), 'error')
    ctx.body = {
      code: 1,
      msg: error.toString(),
    }
  }
})

module.exports = router
