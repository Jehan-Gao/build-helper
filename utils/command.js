module.exports = {
  YARN_INSTALL: 'yarn install',
  GIT_ADD: 'git add .',
  GIT_PULL: (branchName) => {
    return `git reset --hard origin/${branchName}`
  },
  GIT_CHECKOUT: (branchName) => {
    return `git checkout ${branchName}`
  },
  GIT_COMMIT: (msg) => {
    return `git commit -m '${msg}'`
  },
  GIT_PUSH: (branch) => {
    return `git push origin ${branch}`
  }
}