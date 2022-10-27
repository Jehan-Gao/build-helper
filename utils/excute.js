const path = require("path")
const fs = require("fs")
const { execSync, exec } = require("child_process")

const resolvePath = (inputPath) => {
  return path.resolve(inputPath)
}

const {
  YARN_INSTALL,
  GIT_ADD,
  GIT_COMMIT,
  GIT_PUSH,
  GIT_CHECKOUT,
  GIT_PULL,
} = require("./command")

/**
 * 拉取指定分支  git reset --hard origin/<branch-name> 强制覆盖本地分支
 */

function excutePullBranch(data) {
  const { dirPath, branchName } = data
  const path = resolvePath(`${dirPath}`)
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && ${GIT_PULL(branchName)}`, (err, stdout) => {
      if (err) resolve(err.toString())
      console.log("excutePullBranch stdout -> ", stdout)
      resolve(stdout)
    })
  })
}

/**
 * 切换到指定分支
 */

function excuteCheckoutBranch(data) {
  const { dirPath, branchName } = data
  const path = resolvePath(`${dirPath}`)
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && ${GIT_CHECKOUT(branchName)}`, (err, stdout) => {
      if (err) reject(err)
      console.log("excuteCheckoutBranch stdout -> ", stdout)
      resolve(`Switched to branch ${branchName}`)
    })
  })
}

/**
 * 修改模块的版本号
 */

async function excuteNpmPkgChange(data) {
  const { pkgInfoList, dirPath } = data
  const pkgJSONPath = path.resolve(`${dirPath}/package.json`)
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
 * 执行 yarn install
 */

function excuteInstall(data) {
  const { dirPath } = data
  return new Promise((resolve, reject) => {
    exec(`cd ${dirPath} && node -v && ${YARN_INSTALL}`, (err, stdout, stderr) => {
      if (err) reject(err)
      console.log("stdout --->", stdout)
      resolve(stdout)
    })
  })
}

/**
 * 提交代码到远程仓库
 */

function excutePushOrigin(data) {
  const { pkgInfoList, branchName, dirPath } = data
  const changeModuleMsg = pkgInfoList
    .map((pkgInfo) => {
      const { pkgName, pkgVersion } = pkgInfo
      return `${pkgName}:${pkgVersion}`
    })
    .join(";")
  const commitMsg = `chore: 修改 ${changeModuleMsg}`
  const path = resolvePath(`${dirPath}`)
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
