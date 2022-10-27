window.onload = function () {
  const pkgChangeButton = document.getElementById("pkg-change")
  const addBtnEle = document.getElementById("add-btn")
  const resultContainerEle = document.querySelector(".result-container")

  let connectStatus = 0

  handlePkgChange()
  copyEle()

  let ws = createWebSocket()

  ws.onerror = function (err) {
    console.log('onerror ->', err)
    ws = createWebSocket()
  }

  window.addEventListener("beforeunload", function (e) {
    ws.close()
  })

  function createWebSocket() {
    const ws = new WebSocket("ws://localhost:8001")
    ws.onopen = function (e) {
      console.log(e, "onopen")
      connectStatus = 1
    }

    ws.onmessage = function (e) {
      console.log("client receive data ->", e.data)
      const data = JSON.parse(e.data)
      renderExcuteResult(data)
    }
    return ws
  }

  function send2Server(data) {
    if (connectStatus !== 1) return
    ws.send(JSON.stringify(data))
  }

  function renderExcuteResult(res) {
    const { type, data } = res
    const typeEle = document.createElement("div")
    typeEle.className = "type"
    typeEle.innerText = `> ${type}: `
    resultContainerEle.appendChild(typeEle)
    const resultEle = document.createElement("div")
    resultEle.className = "result"
    resultEle.innerText = data
    resultContainerEle.appendChild(resultEle)
  }

  function copyEle() {
    addBtnEle.onclick = function () {
      const pkgInfoEle = document.querySelector(".pkg-info")
      const pkgNameContentEle = createPkgNameEle()
      const pkgVersionContentEle = createPkgVersionEle()

      const pkgContainerEle = document.createElement("div")
      pkgContainerEle.className = "pkg-container"
      pkgContainerEle.appendChild(pkgNameContentEle)
      pkgContainerEle.appendChild(pkgVersionContentEle)
      pkgInfoEle.appendChild(pkgContainerEle)
    }
  }

  function createPkgNameEle() {
    const pkgNameContentEle = document.createElement("div")
    pkgNameContentEle.className = "pkg-name-content"
    const pkgNameSpanEle = document.createElement("span")
    pkgNameSpanEle.innerText = "npm 包名："
    const pkgNameInputEle = document.createElement("input")
    pkgNameInputEle.className = "pkg-name"
    pkgNameInputEle.setAttribute("type", "text")
    pkgNameContentEle.appendChild(pkgNameSpanEle)
    pkgNameContentEle.appendChild(pkgNameInputEle)
    return pkgNameContentEle
  }

  function createPkgVersionEle() {
    const pkgVersionContentEle = document.createElement("div")
    pkgVersionContentEle.className = "pkg-version-content"
    const pkgVersioSpanEle = document.createElement("span")
    pkgVersioSpanEle.innerText = "npm 版本："
    const pkgVersionInputEle = document.createElement("input")
    pkgVersionInputEle.className = "pkg-version"
    pkgVersionInputEle.setAttribute("type", "text")
    pkgVersionContentEle.appendChild(pkgVersioSpanEle)
    pkgVersionContentEle.appendChild(pkgVersionInputEle)
    return pkgVersionContentEle
  }

  function clearResultContent() {
    const resultContainerEle = document.querySelector(".result-container")
    resultContainerEle.innerHTML = ""
  }

  function handlePkgChange() {
    pkgChangeButton.onclick = async function () {
      clearResultContent()

      // 模块所在路径
      const dirPath = document.getElementById("dir-path").value || ""
      // 分支名
      const branchName = document.getElementById("branch-name").value || ""

      const pkgContainerEles = document.querySelectorAll(".pkg-container")
      const pkgInfoList = []
      pkgContainerEles.forEach((node) => {
        const pkgName = node.querySelector(".pkg-name").value || ""
        const pkgVersion = node.querySelector(".pkg-version").value || ""
        if (pkgName && pkgVersion) {
          pkgInfoList.push({ pkgName, pkgVersion })
        }
      })

      if (!dirPath || !branchName || !pkgInfoList.length) {
        alert('请完善信息！');
        return
      }
      
      console.log("pkgInfoList ->", pkgInfoList)
      send2Server({ pkgInfoList, dirPath, branchName })
    }
  }
}
