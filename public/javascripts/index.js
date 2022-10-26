window.onload = function () {
  // 修改版本按钮
  const pkgChangeButton = document.getElementById("pkg-change")

  const installOutputEle = document.getElementById("installOutput")
  const pushOutputEle = document.getElementById("pushOutput")

  const addBtnEle = document.getElementById("add-btn")

  handlePkgChange()

  copyEle()

  function copyEle() {
    addBtnEle.onclick = function () {
      const pkgInfoEle = document.querySelector(".pkg-info")
      const pkgNameContentEle = createPkgNameEle()
      const pkgVersionContentEle = createPkgVersionEle()
      
      const pkgContainerEle = document.createElement('div')
      pkgContainerEle.className = 'pkg-container'
      pkgContainerEle.appendChild(pkgNameContentEle)
      pkgContainerEle.appendChild(pkgVersionContentEle)
      pkgInfoEle.appendChild(pkgContainerEle)
    }
  }

  function createPkgNameEle() {
    const pkgNameContentEle = document.createElement("div")
    pkgNameContentEle.className = "pkg-name-content"
    const pkgNameSpanEle = document.createElement("span")
    pkgNameSpanEle.innerText = 'npm 包名：'
    const pkgNameInputEle = document.createElement('input')
    pkgNameInputEle.className = 'pkg-name'
    pkgNameInputEle.setAttribute('type', 'text')
    pkgNameContentEle.appendChild(pkgNameSpanEle)
    pkgNameContentEle.appendChild(pkgNameInputEle)
    return pkgNameContentEle
  }

  function createPkgVersionEle() {
    const pkgVersionContentEle = document.createElement("div")
    pkgVersionContentEle.className = "pkg-version-content"
    const pkgVersioSpanEle = document.createElement("span")
    pkgVersioSpanEle.innerText = 'npm 版本：'
    const pkgVersionInputEle = document.createElement('input')
    pkgVersionInputEle.className = 'pkg-version'
    pkgVersionInputEle.setAttribute('type', 'text')
    pkgVersionContentEle.appendChild(pkgVersioSpanEle)
    pkgVersionContentEle.appendChild(pkgVersionInputEle)
    return pkgVersionContentEle
  }


  function handlePkgChange() {
    installOutputEle.innerHTML = ''
    pushOutputEle.innerHTML = ''

    pkgChangeButton.onclick = async function () {
      // const pkgInfoList = []

      // 模块所在路径
      const dirPath = document.getElementById("dir-path").value || ""
      // 分支名
      const branchName = document.getElementById("branch-name").value || ""

      const pkgContainerEles = document.querySelectorAll(".pkg-container")
      const pkgInfoList = []
      pkgContainerEles.forEach((node) => {
        const pkgName = node.querySelector('.pkg-name').value || ''
        const pkgVersion = node.querySelector('.pkg-version').value || ''
        if (pkgName && pkgVersion) {
          pkgInfoList.push({ pkgName, pkgVersion})
        }
      })
      console.log(pkgInfoList)

      installOutputEle.innerHTML = 'waiting ...'
      pushOutputEle.innerHTML = 'waiting ...'
      
      // 发送请求，node 去修改
      const res = await request({
        url: "/change",
        method: "POST",
        data: {
          pkgInfoList,
          dirPath,
          branchName,
        },
      })
      console.log('res->', res)
      const { code, installOutput, pushOutput, msg } = res
      if (code === 0) {
        installOutputEle.innerHTML = installOutput.replace(/\n/g, '<br/>')
        pushOutputEle.innerHTML = pushOutput.replace(/\n/g, '<br/>')
      } else {
        installOutputEle.innerHTML = `<font color='red'>${msg.replace(/\n/g, '<br/>')}</font>`
        pushOutputEle.innerHTML = `<font color='red'>${msg.replace(/\n/g, '<br/>')}</font>`
      }
    }
  }

  async function request(options) {
    const { url, method = "GET", data, headers = {} } = options

    const BASEURL = "http://localhost:3000"
    const requestConfig = {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      method,
    }
    if (method.toUpperCase() === "POST") {
      requestConfig.body = JSON.stringify(data)
    }
    try {
      const res = await fetch(`${BASEURL}${url}`, requestConfig)
      if (res.status === 200) {
        const result = await res.json()
        return result
      } else {
        throw new Error("server status is not 200")
      }
    } catch (error) {
      console.log(error, "error")
    }
  }
}
