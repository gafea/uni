const bottombarIcon = "" + resourceNETpath + "image/uni.svg"
var disable_SLV_check = true

var prev_call = 'none'
function init(path) {

    if (prev_call != path) {

        prev_call = path

        return ""
            + renderTopBar("Console - uni", '', `
                <button class="dwhdab no_print" id="topbtn_refresh" onclick="updateServerInfo(true)" title="Refresh Server Info">
                    <img src="` + resourceNETpath + `/image/refresh.png" draggable="false">
                    <style>#topbtn_refresh{background-color:rgba(48,216,96,.1)} #topbtn_refresh:hover{background-color:rgba(48,216,96,.25)} #topbtn_refresh:hover:active > img{transform:rotate(-45deg)}</style>
                </button>`, false, '', false, '', false)
            + `
            <div class="edge2edge_page">
                <h3>Server Info</h3>
                <br>
                <div id="serverinfo"></div>
            </div>
            `
            + `
            <div class="edge2edge_page">
                <h3>Tools</h3>
                <br>
                <button onclick="callapi('/!course_cache/', 'cache course database')">cache course database</button>
                <br><br>
                <button onclick="callapi('/!course_fetch_nodiff/', 'update course database from internet')">update course database from internet</button>
                <br><br>
                <button onclick="callapi('/!course_fetch/', 'update course database from internet & plot into chart')">update course database from internet & plot into chart</button>
            </div>
            `
            + `
            <style>
                .edge2edge_page + .edge2edge_page {
                    padding-top: 0;
                }
            </style>
            `
            + renderBottomBar("/", true, bottombarIcon)

    }
}

function exe(path) {

    if (path === 'cleanup') return

    document.title = "Console - uni"

    updateServerInfo()

}

function callapi(path, name) {
    setLoadingStatus("show")
    fetch(path).then(response => response.json()).then(data => {
        try {
            if (data.status == 200) {
                setLoadingStatus("success", false, "'" + name + "' called")
                return
            }
            setLoadingStatus("error", false, "failed to call '" + name + "' (" + data.status + ")")
        } catch (error) {
            console.log(error)
            setLoadingStatus("error", false, "failed to call '" + name + "'", error)
        }
    }).catch(error => {
        console.log(error)
        setLoadingStatus("error", false, "failed to call '" + name + "'", error)
    }).finally(() => {
        setTimeout(updateServerInfo, 1000)
    })
}

function updateServerInfo(showSuccessAfterCompletion = false) {
    setLoadingStatus("show")
    fetch('/!info/').then(response => response.json()).then(data => {
        if (data.status != 200) {
            setLoadingStatus("error", false, "failed to retrieve server info")
            console.log(data)
            return
        }
        let h = ""
        Object.keys(data.resp).forEach(key => {
            h += "<b>" + key + "</b>: " + (
                ["server_time", "server_start_time", "db_cache_date", "db_update_date", "course_cache_lastcalled", "course_fetch_lastcalled", "autofetch_startTime", "autofetch_endTime"].includes(key)
                    ? formatTime(data.resp[key])
                    : ["db_disk_size", "db_cache_size"].includes(key)
                        ? formatBytes(data.resp[key])
                        : data.resp[key]
            ) + "<br>"
        })
        document.getElementById("serverinfo").innerHTML = h
        setLoadingStatus(showSuccessAfterCompletion ? "success" : "hide")
    }).catch(error => {
        console.log(error)
        setLoadingStatus("error", false, "failed to retrieve server info", error)
    })
}
setInterval(updateServerInfo, 5000)

function formatTime(t) { return (!t) ? "Never" : (new Date(t)).toString() + secondsToDhms(((new Date()).getTime() - (new Date(t)).getTime())/1000) }
function formatBytes(a, b = 2) { if (!+a) return "0 Bytes"; const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024)); return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]}` }

function secondsToDhms(seconds) {
    let isNegative = seconds < 0
    seconds = Math.abs(seconds)
    let d = Math.floor(seconds / (3600 * 24))
    let h = Math.floor((seconds % (3600 * 24)) / 3600)
    let m = Math.floor((seconds % 3600) / 60)
    let s = Math.floor(seconds % 60)
    let sDisplay = s > 0 ? s + " sec" : ""
    let mDisplay = m > 0 ? m + " min,  ".slice(0, sDisplay ? -1 : -3) : ""
    let hDisplay = h > 0 ? h + (h == 1 ? " hr,  " : " hrs,  ").slice(0, ("" + mDisplay + sDisplay) ? -1 : -3) : ""
    let dDisplay = d > 0 ? d + (d == 1 ? " day,  " : " days,  ").slice(0, ("" + hDisplay + mDisplay + sDisplay) ? -1 : -3) : ""
    return (("" + dDisplay + hDisplay + mDisplay + sDisplay) ? " (" + dDisplay + hDisplay + mDisplay + sDisplay + " " + (isNegative ? "later" : "ago") + ")" : " (now)")
}

const waitCSS = () => { try { installCSS('uni.css') } catch { setTimeout(() => { waitCSS() }, 20) } }
waitCSS()