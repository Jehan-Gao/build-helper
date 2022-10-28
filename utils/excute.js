const path = require("path")
const fs = require("fs")
const { execSync, exec } = require("child_process")

const {
  YARN_INSTALL,
  GIT_ADD,
  GIT_CLONE,
  GIT_COMMIT,
  GIT_PUSH,
  GIT_CHECKOUT,
  GIT_PULL,
} = require("./command")

const resolvePath = (inputPath) => {
  return path.resolve(inputPath)
}

const WORK_SPACE = '/Users/jehan/beem'

/**
 * clone repo
*/
async function excuteCloneRepo(projectName) {
  return new Promise((resolve, reject) => {
    exec(`cd ${WORK_SPACE} && ${GIT_CLONE(projectName)}`, (err, stdout) => {
      if (err) reject(err)
      console.log('excuteCloneRepo stdout ->', stdout)
      resolve(`${projectName} cloned done`)
    })
  })
}

/**
 * 1. 切换到指定分支
 */

 async function excuteCheckoutBranch(data) {
  const { projectName, branchName } = data
  const path = resolvePath(`${WORK_SPACE}/${projectName}`)
  const isExist = fs.existsSync(path)
  if (!isExist) {
    try {
      const res = await excuteCloneRepo(projectName)
      return checkoutBranch(res)
    } catch (error) {
      return Promise.reject(error)
    }
  } else {
    return checkoutBranch()
  }

  function checkoutBranch (res) {
    return new Promise((resolve, reject) => {
      exec(`cd ${path} && ${GIT_CHECKOUT(branchName)}`, (err, stdout) => {
        if (err) reject(err)
        console.log("excuteCheckoutBranch stdout -> ", stdout)
        if (res) {
          resolve(`${res} \n ${stdout ? stdout : `Switched to branch ${branchName}`}`)
        } else {
          resolve(`${stdout ? stdout : `Switched to branch ${branchName}`}`)
        }
      })
    })
  }
}

/**
 * 2. 拉取指定分支  git reset --hard origin/<branch-name> 强制覆盖本地分支
 */

function excutePullBranch(data) {
  const { projectName, branchName } = data
  const path = resolvePath(`${WORK_SPACE}/${projectName}`)
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && ${GIT_PULL(branchName)}`, (err, stdout) => {
      if (err) resolve(err.toString())
      console.log("excutePullBranch stdout -> ", stdout)
      resolve(stdout)
    })
  })
}



/**
 * 3. 修改模块的版本号
 */

async function excuteNpmPkgChange(data) {
  const { pkgInfoList, projectName } = data
  const pkgJSONPath = path.resolve(`${WORK_SPACE}/${projectName}/package.json`)
  try {
    const pkgJSON = fs.readFileSync(pkgJSONPath, "utf-8")
    if (!pkgJSON) throw new Error(`no such file -> package.json`)
    if (pkgJSON) {
      const pkgJSONObj = JSON.parse(pkgJSON)
      let index = 0
      const isAllExist = pkgInfoList.some((pkgInfo, index) => {
        if (
          !(
            pkgInfo.pkgName in pkgJSONObj.devDependencies &&
            pkgJSONObj.devDependencies
          )
        ) {
          index = index
          return false
        }
        return true
      })
      if (!isAllExist) {
        throw new Error(`Not found '${pkgInfoList[index].pkgName}' in package.json`)
      }
      pkgInfoList.forEach((pkgInfo) => {
        pkgJSONObj.devDependencies[pkgInfo.pkgName] = pkgInfo.pkgVersion
      })
      fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSONObj, null, "\t"))
      const newResult = fs.readFileSync(pkgJSONPath, "utf-8")
      return newResult
    }
  } catch (error) {
    console.log("excuteNpmPkgChange error ->", error)
    return Promise.reject(error)
  }
}

/**
 * 4. 执行 yarn install
 */

function excuteInstall(data) {
  const { projectName } = data
  const path = resolvePath(`${WORK_SPACE}/${projectName}`)
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && node -v && ${YARN_INSTALL}`, (err, stdout, stderr) => {
      if (err) reject(err)
      console.log("stdout --->", stdout)
      resolve(stdout)
    })
  })
}

/**
 * 5. 提交代码到远程仓库
 */

function excutePushOrigin(data) {
  const { pkgInfoList, branchName, projectName } = data
  const changeModuleMsg = pkgInfoList
    .map((pkgInfo) => {
      const { pkgName, pkgVersion } = pkgInfo
      return `${pkgName}:${pkgVersion}`
    })
    .join(";")
  const commitMsg = `chore: 修改 ${changeModuleMsg}`
  const path = resolvePath(`${WORK_SPACE}/${projectName}`)
  return new Promise((resolve, reject) => {
    exec(
      `cd ${path} && ${GIT_ADD} && ${GIT_COMMIT(commitMsg)} && ${GIT_PUSH(
        branchName
      )}`,
      (err, stdout, stderr) => {
        if (err) reject(err)
        console.log(`excutePushOrigin stdout ->`, stdout)
        resolve(stdout)
      }
    )
  })
}

module.exports = {
  excutePullBranch,
  excuteNpmPkgChange,
  excuteInstall,
  excuteCheckoutBranch,
  excutePushOrigin,
}
