module.exports = {
  YARN_INSTALL: 'yarn install',
  GIT_ADD: 'git add .',
  GIT_CLONE: (projectName) => {
    // git@gitlab2.beemwk.com:beem-rtc/pc/beem-meeting.git
    return `git clone git@gitlab2.beemwk.com:beem-rtc/pc/${projectName}.git`
  },
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