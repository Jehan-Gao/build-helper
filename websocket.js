const ws = require('nodejs-websocket')

const { excuteCheckoutBranch ,excutePullBranch, excuteNpmPkgChange,
excuteInstall, excutePushOrigin } = require('./utils/excute')

const msgType = require('./utils/msgType')

function createTaskQueue () {
  const taskQueue = [ { type: msgType.checkoutBranch, fn: excuteCheckoutBranch}, { type: msgType.pullBranch, fn: excutePullBranch },
    { type: msgType.changePkgJSON, fn: excuteNpmPkgChange }, { type: msgType.yarnInstall, fn: excuteInstall },
    { type: msgType.pushBranch,  fn: excutePushOrigin } ]
    return taskQueue
}


function createWebSocket () {
  const server = ws.createServer(function (conn) {
    conn.on("text", async function (string) {
        console.log("Received " + string)
        const data = JSON.parse(string)
        const taskQueue = createTaskQueue()
        excuteNextTask(taskQueue, conn, data)
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
  })
  return server
}

function send2Client(conn, data, type) {
  conn.send(JSON.stringify({ type, data }))
}

async function excuteNextTask (taskQueue, conn, data) {
  if (!taskQueue.length) return
  const task = taskQueue.shift()
  const res = await task.fn(data)
  send2Client(conn, res, task.type)
  excuteNextTask(taskQueue, conn, data)
}


module.exports = {
  createWebSocket,
  send2Client
}