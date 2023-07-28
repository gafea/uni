const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const { exec } = require("child_process")
const post = (url, data) => fetch(url, { method: "POST", headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: data })

const sharedfx = require((!fs.existsSync('./' + __filename.slice(__dirname.length + 1))) ? ('./../sharedfx_node.js') : ('./sharedfx_node.js'))
if (sharedfx.about() != "sharedfx") { throw new Error('bad sharedfx import') }

const servar = {
    deployed: sharedfx.envar.deployed,
    domain: "uni." + sharedfx.envar.root_domain,
    port: 8002,
    course_path: sharedfx.envar.course_path,
    course_temp_path: sharedfx.envar.course_temp_path
}; Object.freeze(servar)
process.stdout.write(String.fromCharCode(27) + "]0;" + servar.domain + String.fromCharCode(7))

try {

    let acc = {}
    if (servar.deployed) {
        acc = require('./../acc_node.js')
        if (acc.about() != "acc") { throw new Error('bad acc import') }
    }

    if (!fs.existsSync(servar.course_temp_path)) fs.mkdirSync(servar.course_temp_path)

    let pythonseed = ""
    var courses = {}
    var diffs = {}
    var peoples = {}
    var rooms = {}
    var sems = []
    var insems = {}
    var courseids = {}
    var extraattr = {}
    var coursegroups = {}
    var majorminorreqs = {}
    var coursereqs = {}
    var phrasedcourse = {}
    var majorschoolmapping = {}

    function startPythonServer() {
        try {
            pythonseed = sharedfx.rndStr(32)
            setTimeout(exec, 10, "python C:\\webserver\\nodejs\\uni\\webServer.py " + pythonseed, err => {
                console.log("python error", err)
                sharedfx.deathDump("uni.gafea.net", "failed to start python server", err)
            })
        } catch (error) {
            sharedfx.deathDump("uni.gafea.net", "failed to start python server", error)
        }
    }
    startPythonServer()

    //courses_fetch, including course_cache
    function courses_fetch(recur = false) {

        if (recur) {
            let tu = (new Date())
            if ((new Date).getTime() < 1683043205000) {
                setTimeout(courses_fetch, (19 - (tu.getMinutes() % 20)) * 60 * 1000 + (59 - tu.getSeconds()) * 1000 + (999 - tu.getMilliseconds()) + 500, true)
                return
            } else if ((new Date).getTime() > 1690818600000) {
                console.log("[" + servar.domain + "] fetching killtime reached, stopping loop...")
                return
            }
        }

        console.log("[" + servar.domain + "] starting fetching...")

        setTimeout(exec, 100, (servar.deployed) ? 'node uni\\course_fetch_node.js' : 'node course_fetch_node.js', err => { })

        if (recur) {
            let t = (new Date())
            setTimeout(courses_fetch, (19 - (t.getMinutes() % 20)) * 60 * 1000 + (59 - t.getSeconds()) * 1000 + (999 - t.getMilliseconds()) + 500, true)
        }

    }
    let t = (new Date())
    setTimeout(courses_fetch, (19 - (t.getMinutes() % 20)) * 60 * 1000 + (59 - t.getSeconds()) * 1000 + (999 - t.getMilliseconds()) + 500, true)

    //course_cache
    let cctm = (new Date())
    function course_cache(firstBoot = false) {

        console.log("[" + servar.domain + "] starting cacheing...")

        cctm = (new Date())
        setTimeout(exec, 100, "node " + ((servar.deployed) ? 'uni\\' : "") + "course_cache_node.js" + ((firstBoot) ? " firstBoot" : ""), err => { })

    }
    course_cache(true)

    function course_search(query) {
        if (!query) return []
        let tmark = (new Date()).getTime()
        let resultsPending = { courseids: courseids, peoples: Object.keys(peoples), rooms: Object.keys(rooms) }
        query = query.normalize().toLowerCase().split(" ")
        let lastQuery = query.pop(); if (lastQuery) {query.push(lastQuery)} else {query.push(query.pop() + " ")}; lastQuery = ""
        let courseFoundIn = {}

        query.forEach(q => {
            resultsPending.peoples = resultsPending.peoples.filter(people => people.normalize().toLowerCase().includes(q))
            resultsPending.rooms = resultsPending.rooms.filter(room => room.normalize().toLowerCase().includes(q))

            let remainingCourseids = {}
            Object.keys(resultsPending.courseids).forEach(CODE => {
                let courseid = resultsPending.courseids[CODE]; courseid.CODE = CODE
                let keepit = false

                Object.keys(courseid).forEach(key => {
                    if (key != "SEM" && key != "COURSEID") { 
                        if (courseid[key].normalize().toLowerCase().includes(q)) {
                            keepit = true
                            if (typeof courseFoundIn[CODE] === "undefined") courseFoundIn[CODE] = []
                            /*if (!courseFoundIn[CODE].includes(key))*/ courseFoundIn[CODE].push(key)
                        }
                    }
                })

                if (keepit) remainingCourseids[CODE] = resultsPending.courseids[CODE]
            })
            resultsPending.courseids = remainingCourseids
        })

        let results = []
        if (Object.keys(resultsPending.courseids).length) {
            Object.keys(resultsPending.courseids).forEach(CODE => {
                results.push({ type: "course", found: courseFoundIn[CODE], result: { CODE: CODE, NAME: resultsPending.courseids[CODE].NAME, SEM: resultsPending.courseids[CODE].SEM, DESCRIPTION: resultsPending.courseids[CODE].DESCRIPTION } })
            })
        }
        if (resultsPending.peoples.length) {
            resultsPending.peoples.forEach(people => {
                results.push({ type: "people", result: people })
            })
        }
        if (resultsPending.rooms.length) {
            resultsPending.rooms.forEach(room => {
                results.push({ type: "room", result: room })
            })
        }

        console.log(`[course_search] took time ` + (((new Date()).getTime()) - tmark) + `ms`)
        return results
    }

    //outgoing server
    const server = http.createServer((req, res) => {
        try {
            let x = decodeURIComponent(req.url)
        } catch (error) {
            console.log(error)
            sharedfx.returnErr(res, 400, 'decode-error', true); return
        }

        console.log(req.method + " - " + decodeURIComponent(req.url) + " - " + new Date().toDateString() + ' - ' + new Date().toLocaleTimeString())

        try {

            req["cookies"] = sharedfx.parseCookies(req)

            var bodytxt = ''
            req.on('data', (data) => bodytxt += data)
            req.on('end', () => {

                var body = {}
                try {
                    body = JSON.parse((bodytxt) ? bodytxt : '{}')
                } catch (error) {
                    console.log(error)
                    console.log(bodytxt)
                    sharedfx.returnErr(res, 400, 'body-decode-error', true); return
                }

                if (req.url == '/!404' || req.url == '/!404/') { //404 html page
                    sharedfx.returnErr(res, 404, "The page you're looking for is not found.", false, true, `<a href="/" class="y aobh no_print"><p1><b>Return to Home</b></p1></a>`)
                    return

                } else if (false && req.url.startsWith('/!insem/') && !req.url.includes("..")) {
                    let path = decodeURIComponent(req.url).substring(8)

                    if (!(path.split('/').length === 1 || (path.split('/').length === 2 && !path.split('/')[1])) || typeof insems[path.split('/')[0]] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: insems[path.split('/')[0]] }))
                    return

                } else if (req.url.startsWith('/!search/')) {
                    let path = decodeURIComponent(req.url).substring(9)
                    let params = new URLSearchParams(path)
                    let results = course_search(params.get('q'))
                    if (!results.length) {
                        sharedfx.returnErr(res, 404, "", true)
                        return
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: results }))
                        return
                    }

                } else if (req.url === '/!guestfx/' && req.method.toUpperCase() === "POST" && bodytxt) {
                    if (typeof body.userdb === "undefined" || typeof body.fx === "undefined") {
                        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 400 }))
                        return
                    }

                    post("http://localhost:7002/!pyser/", JSON.stringify(body)).then(r => r.json()).then(r => {
                        if (r.status === 200) {
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: r.resp }))
                            return
                        } else {
                            res.writeHead(r.status, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify(r))
                            return
                        }
                    }).catch(err => {
                        console.log(err)
                        res.writeHead(503, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 503 }))
                        return
                    })

                } else if (req.url.startsWith('/!plan/') && !req.url.includes("..")) {
                    let path = decodeURIComponent(req.url).substring(7)
                    let paths = path.split('/')
                    let year = -1, majorminor = ""
                    if (paths[0] && !isNaN(paths[0]) && !isNaN(parseFloat(paths[0]))) year = parseInt(paths[0])
                    if (typeof paths[1] != "undefined" && paths[1] && !paths[1].startsWith("?")) majorminor = paths[1]

                    if (!Object.keys(majorminorreqs).length) {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    if (year < 0) {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: Object.keys(majorminorreqs).sort().reverse()  }))
                        return
                    }

                    if (typeof majorminorreqs[year] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    if (!majorminor) {
                        let params = new URLSearchParams(paths[1])
                        if (params.get("majoronly") == "true") {
                            let resp = []
                            Object.keys(majorminorreqs[year]).forEach(majorminor => {
                                if (majorminorreqs[year][majorminor].attr.type == "major") resp.push(majorminor)
                            })
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: resp.sort() }))
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: Object.keys(majorminorreqs[year]).sort() }))
                        }
                        return
                    }

                    if (typeof majorminorreqs[year][majorminor] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: majorminorreqs[year][majorminor] }))
                    return

                } else if (req.url.startsWith('/!people/') && !req.url.includes("..")) {
                    let path = decodeURIComponent(req.url).substring(9)

                    if (req.url === '/!people/') {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: Object.keys(peoples).sort() }))
                        return
                    }

                    if (typeof peoples[path.split('/')[0]] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    if (typeof path.split('/')[1] === "undefined" || path.split('/')[1] == "") {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: Object.keys(peoples[path.split('/')[0]]).sort().reverse() }))
                        return
                    }

                    if (typeof peoples[path.split('/')[0]][path.split('/')[1]] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: peoples[path.split('/')[0]][path.split('/')[1]] }))
                    return

                } else if (req.url.startsWith('/!room/') && !req.url.includes("..")) {
                    let path = decodeURIComponent(req.url).substring(7)

                    if (req.url === '/!room/') {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: Object.keys(rooms).sort() }))
                        return
                    }

                    if (typeof rooms[path.split('/')[0]] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    if (typeof path.split('/')[1] === "undefined" || path.split('/')[1] == "") {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: Object.keys(rooms[path.split('/')[0]]).sort().reverse() }))
                        return
                    }

                    if (typeof rooms[path.split('/')[0]][path.split('/')[1]] === "undefined") {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: rooms[path.split('/')[0]][path.split('/')[1]] }))
                    return

                } else if (req.url.startsWith('/!diff/')) {
                    let reqCourse = req.url.substring(7).split('/')[0]

                    if (Object.keys(diffs).length && (typeof req.url.substring(7).split('/')[1] != "string" || !req.url.substring(7).split('/')[1])) {
                        if (typeof diffs[reqCourse] === "undefined") {
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: { s: parseInt(sems[0]), t: diffs["_times"], p: diffs[reqCourse] } }))
                        }
                        return
                    }

                    let reqSem = ((isNaN(parseInt(req.url.substring(7).split('/')[1]))) ? sems[0] : parseInt(req.url.substring(7).split('/')[1]))
                    let diffFilePath = servar.course_path + "_diff\\" + reqSem + "\\" + reqCourse.replaceAll("..", "") + ".json"

                    if (!fs.existsSync(diffFilePath)) {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    let lessonToType = lesson => {
                        if (lesson.startsWith("LA")) {
                            return "lab"
                        } else if (lesson.startsWith("L")) {
                            return "lec"
                        } else if (lesson.startsWith("T")) {
                            return "tut"
                        } else if (lesson.startsWith("R")) {
                            return "rsh"
                        } else {
                            return "otr"
                        }
                    }

                    let db = JSON.parse(fs.readFileSync(diffFilePath, "utf-8"))

                    let timeArray = [], startT = 0, endT = 0, datasets = {}
                    Object.keys(db).forEach(lesson => {
                        Object.keys(db[lesson]).forEach(dataPointTime => {
                            let newDataPointTime = dataPointTime - dataPointTime % (20 * 60 * 1000)
                            if (!timeArray.includes(newDataPointTime)) timeArray.push(newDataPointTime)
                        })
                    })
                    timeArray.sort(); startT = timeArray[0]; endT = timeArray[timeArray.length - 1] + 19 * 60 * 1000; timeArray = [];
                    let timeU = startT; do { timeArray.push(timeU); timeU += 20 * 60 * 1000 } while (endT > timeU);

                    Object.keys(db).forEach(key => {
                        let keys = Object.keys(db[key])
                        keys.sort()

                        let time = startT, value = db[key][keys[0]], keys_pos = -1, newDB = []
                        do {
                            if (keys[keys_pos + 1] < time + 20 * 60 * 1000) {
                                keys_pos++
                                value = db[key][keys[keys_pos]]
                            } else {
                                value = null
                            }
                            newDB.push(value)
                            time += 20 * 60 * 1000
                        } while (keys_pos < keys.length && endT >= time)

                        if (typeof datasets[lessonToType(key)] == "undefined") datasets[lessonToType(key)] = {}
                        datasets[lessonToType(key)][key] = newDB
                    })

                    let respArray = []
                    let maxLessonNum = 1;
                    ["lec", "lab", "tut", "rsh", "otr"].forEach((lessonType, index) => {
                        if (typeof datasets[lessonType] != "undefined" && Object.keys(datasets[lessonType]).length) {
                            let maxThisLessonNum = 0
                            Object.keys(datasets[lessonType]).forEach(lesson => {
                                let thisLessonNum = lesson.split(" ")[0].replace(/^\D+|\D+$/g, "")
                                if (!thisLessonNum) thisLessonNum = "1"
                                thisLessonNum = parseInt(thisLessonNum)
                                if (maxThisLessonNum < thisLessonNum) maxThisLessonNum = thisLessonNum
                            })
                            if (maxLessonNum < maxThisLessonNum) maxLessonNum = maxThisLessonNum
                        }
                    });

                    ["lec", "lab", "tut", "rsh", "otr"].forEach((lessonType, index) => {
                        let pS = ["rect", "triangle", "circle", "rectRot", "crossRot"][index]
                        let pR = [5, 5, 4, 5, 5][index]
                        let pHR = [8, 8, 7, 8, 8][index]
                        let pCB = ["90", "60", "60", "90", "30"][index]
                        let pBD = [[], [3, 3], [8, 8], [], []][index]
                        if (typeof datasets[lessonType] != "undefined" && Object.keys(datasets[lessonType]).length) {
                            Object.keys(datasets[lessonType]).forEach(lesson => {
                                let thisLessonNum = lesson.split(" ")[0].replace(/^\D+|\D+$/g, "")
                                if (!thisLessonNum) thisLessonNum = "1"
                                thisLessonNum = parseInt(thisLessonNum)

                                respArray.push({ label: lesson, data: datasets[lessonType][lesson], pointStyle: pS, pointRadius: 0, pointHoverRadius: pHR, borderDash: pBD, borderColor: "hsl(" + ((60 - Math.round((thisLessonNum - 1) * 100 / maxLessonNum)) / 100) + "turn, " + pCB + "%, 60%)", backgroundColor: "hsl(" + ((60 - Math.round((thisLessonNum - 1) * 100 / maxLessonNum)) / 100) + "turn, " + pCB + "%, 85%)" })
                            })
                        }
                    })

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: { s: reqSem, t: timeArray, p: respArray } }))
                    return

                } else if (req.url.startsWith('/!group/')) {
                    let paths = req.url.substring(8).split('/')

                    if (parseInt(paths[0]) < 1200 || req.url.includes("..") || paths.length < 1 || paths.length > 3 || (paths.length === 3 && paths[2])) {
                        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 400 }))
                        return
                    }

                    let semx = paths[0]
                    if (paths.length == 1 || (paths.length == 2 && !paths[1])) {
                        if (typeof coursegroups[semx] === "undefined" || !Object.keys(coursegroups[semx]).length) {
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                            return
                        }

                        let rx = { ug: [], pg: [], both: [] }
                        Object.keys(coursegroups[semx]).sort().forEach(dept => {
                            if (coursegroups[semx][dept]["_attr"]["ug"] && !coursegroups[semx][dept]["_attr"]["pg"]) {
                                rx["ug"].push(dept)
                            } else if (!coursegroups[semx][dept]["_attr"]["ug"] && coursegroups[semx][dept]["_attr"]["pg"]) {
                                rx["pg"].push(dept)
                            } else {
                                rx["both"].push(dept)
                            }
                        })

                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: rx }))
                        return
                    }

                    let deptx = decodeURIComponent(paths[1])
                    if (typeof coursegroups[semx][deptx] === "undefined" || !Object.keys(coursegroups[semx][deptx]).length) {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    //TODO: make extraattr show in detail view
                    let resp = {}
                    Object.keys(coursegroups[semx][deptx]).forEach(courseFullName => {
                        if (courseFullName != "_attr") {
                            resp[courseFullName] = { attr: coursegroups[semx][deptx][courseFullName]["attr"] }
                        }
                    })

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: resp }))
                    return

                } else if (req.url.startsWith('/!course/')) {
                    if (req.url === '/!course/') {
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: sems }))
                        return
                    } else if (parseInt(req.url.substring(9).split('/')[0]) < 1200 || req.url.includes("..")) {
                        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 400 }))
                        return
                    }

                    let semx = req.url.substring(9).split('/')[0]
                    if (req.url.substring(9).split('/').length == 1 || (req.url.substring(9).split('/').length == 2 && req.url.substring(9).split('/')[1] == "")) {

                        let list = Object.keys(courses).filter(course => semx in courses[course])
                        if (!list.length) {
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                            return
                        }

                        let rx = { ug: [], pg: [], both: [] }
                        list.sort().forEach(dept => {
                            if (courses[dept][semx]["_attr"]["ug"] && !courses[dept][semx]["_attr"]["pg"]) {
                                rx["ug"].push(dept)
                            } else if (!courses[dept][semx]["_attr"]["ug"] && courses[dept][semx]["_attr"]["pg"]) {
                                rx["pg"].push(dept)
                            } else {
                                rx["both"].push(dept)
                            }
                        })

                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: rx }))
                        return

                    }

                    let deptx = req.url.substring(9).split("/")[1]

                    if (!(deptx.length === 4 && typeof courses[deptx] != "undefined" && typeof courses[deptx][semx] != "undefined")) {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    //TODO: make extraattr show in detail view
                    let coursex = req.url.substring(9).split("/")[2]
                    let courseNameFound = ""
                    Object.keys(courses[deptx][semx]).forEach(courseFullName => {
                        if (coursex === (courseFullName.split(" ")[0] + courseFullName.split(" ")[1])) courseNameFound = courseFullName
                    })

                    let extraattrs = extraattr[courseNameFound.split(" ")[0] + courseNameFound.split(" ")[1]]
                    if (typeof extraattrs === "undefined") extraattrs = {}

                    if (req.url.substring(9).split('/').length == 2 || (req.url.substring(9).split('/').length == 3 && req.url.substring(9).split('/')[2] == "")) {
                        let resp = {}
                        Object.keys(courses[deptx][semx]).forEach(courseFullName => {
                            if (courseFullName != "_attr") {
                                resp[courseFullName] = { attr: courses[deptx][semx][courseFullName]["attr"] }
                                Object.keys(extraattrs).forEach(k => {
                                    resp[courseFullName].attr[k] = extraattrs[k].join(", ")
                                })
                            }
                        })
                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: resp }))
                        return
                    }

                    if (!courseNameFound) {
                        res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 404 }))
                        return
                    }

                    let rx = JSON.parse(JSON.stringify(courses[deptx][semx][courseNameFound]))
                    if (typeof rx.section != "undefined") {
                        Object.keys(extraattrs).forEach(k => {
                            rx.attr[k] = extraattrs[k].join(", ")
                        })
                    }

                    if (typeof insems[courseNameFound.split(" ")[0] + courseNameFound.split(" ")[1]] != "undefined") {
                        rx.insem = insems[courseNameFound.split(" ")[0] + courseNameFound.split(" ")[1]]
                    }

                    if (typeof phrasedcourse[semx] != "undefined" && typeof phrasedcourse[semx][courseNameFound.split(" ")[0] + courseNameFound.split(" ")[1]] != "undefined") {
                        let phtemp = JSON.parse(JSON.stringify(phrasedcourse[semx][courseNameFound.split(" ")[0] + courseNameFound.split(" ")[1]]))
                        delete phtemp["attr"]["type"]
                        if (!Object.keys(phtemp["attr"]).length) delete phtemp["attr"]
                        rx.phrasedattr = phtemp
                    }

                    Object.keys(rx.attr).forEach(key => {
                        if (!key.startsWith("_")) {
                            Object.keys(courseids).sort().reverse().forEach(courseid => {
                                rx.attr[key] = rx.attr[key].replaceAll("" + courseid.substring(0, 4) + " " + courseid.substring(4), `<a class="ax" onclick="boot('/course/` + courseids[courseid].SEM + `/` + courseid.substring(0, 4) + `/` + courseid + `/', false, 2)">` + courseid + `</a>`)
                            })
                        }
                    })

                    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200, resp: { [courseNameFound]: rx } }))
                    return

                } else if (!servar.deployed && req.url.startsWith('/!cdn/')) {
                    var filePath = '.\\cdn\\' + decodeURIComponent(req.url.substring(6)).replaceAll("../", "").replaceAll("..\\", "");

                    var extname = path.extname(filePath);
                    var contentType = 'text/html';
                    switch (extname) {
                        case '.js':
                            contentType = 'text/javascript';
                            break;
                        case '.css':
                            contentType = 'text/css';
                            break;
                        case '.json':
                            contentType = 'application/json';
                            break;
                        case '.png':
                            contentType = 'image/png';
                            break;
                        case '.jpg':
                        case '.jpeg':
                            contentType = 'image/jpg';
                            break;
                        case '.svg':
                            contentType = 'image/svg+xml';
                            break;
                        case '.wav':
                            contentType = 'audio/wav';
                            break;
                    }

                    fs.readFile(filePath, function (error, content) {
                        if (error) {
                            if (error.code == 'ENOENT') {
                                fs.readFile('./404.html', function (error, content) {
                                    res.writeHead(200, { 'Content-Type': contentType });
                                    res.end(content, 'utf-8');
                                });
                            }
                            else {
                                res.writeHead(500);
                                res.end('wtf ' + error.code + ' ..\n');
                                res.end();
                            }
                        }
                        else {
                            res.writeHead(200, { 'Content-Type': contentType });
                            res.end(content, 'utf-8');
                        }
                    })

                } else if (req.url.startsWith('/!acc/')) {
                    (servar.deployed) ? acc.handle(req, res, body, servar, {courseids: courseids, sems: sems}) : sharedfx.returnErr(res, 503, "not-supported", true)

                } else if (req.url.toLowerCase() === '/init.js') {
                    res.writeHead(200, { 'Content-Type': 'application/javascript', 'Server': 'joutou', 'Cache-Control': 'max-age=7200' })
                    fs.readFile('' + __dirname + "/init.js", 'utf8', (err, data) => { (err) ? res.end("") : res.end(data) })

                } else if (req.url.toLowerCase() === '/robots.txt') {
                    res.writeHead(200, { 'Content-Type': 'text/plain', 'Server': 'joutou' })
                    res.end(`User-agent: *\nAllow: /\nAllow: /*\nDisallow: /!acc/*\nDisallow: /!search/*`)

                } else if (req.url.toLowerCase() === '/favicon.ico') {
                    res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Server': 'joutou', 'Cache-Control': 'max-age=604800' })
                    res.end(sharedfx.envar.favicon)

                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8', 'Server': 'joutou' })
                    res.end(sharedfx.envar.indexHTML.replace("%script%", `
                    <script src="` + sharedfx.envar.cdnNETpath + `pkg\\chartjs\\chart.umd.js"></script>
                    <script src="` + sharedfx.envar.cdnNETpath + `pkg\\chartjs-plugin-annotation.min.js"></script>
                    <script src="` + sharedfx.envar.cdnNETpath + `pkg\\chartjs-chart-graph\\index.umd.js"></script>
                    `).replace("%gscript%", sharedfx.envar.gscript))

                }

            })
        } catch (error) { console.log(error); res.writeHead(500, { 'Content-Type': 'application/json', 'Server': 'joutou' }); res.end(JSON.stringify({ status: 500 })) }
    })
    server.listen(servar.port)
    console.log("[" + servar.domain + "] Server Started / " + servar.port)

    //internal api server
    const serverAPI = http.createServer((req, res) => {
        if (!(req.headers.host.startsWith("localhost:") || req.headers.host.startsWith("127.0.0.1:") || req.headers.host.startsWith("192.168."))) { sharedfx.returnErr(res, 403, "localhost only", false); return }

        try {
            let x = decodeURIComponent(req.url)
        } catch (error) {
            console.log(error)
            sharedfx.returnErr(res, 400, 'decode-error', true); return
        }

        console.log("int - " + decodeURIComponent(req.url) + " - " + new Date().toDateString() + ' - ' + new Date().toLocaleTimeString())
        var bodytxt = ''
        req.on('data', (data) => bodytxt += data)
        req.on('end', () => {

            var body = {}
            try {
                body = JSON.parse((bodytxt) ? bodytxt : '{}')
            } catch (error) {
                console.log(error)
                sharedfx.returnErr(res, 400, 'body-decode-error', true); return
            }


            if (req.url.startsWith('/!')) {
                if (req.url === '/!course_cache/') {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200 }))
                    setTimeout(() => {
                        course_cache()
                    }, 100)

                } else if (req.url === '/!course_cache_full/') {
                    sharedfx.returnErr(res, 200, "", true)
                    setTimeout(() => {
                        course_cache(true)
                    }, 100)
                    return

                } else if (req.url === '/!course_fetch/') {
                    sharedfx.returnErr(res, 200, "", true)
                    setTimeout(() => {
                        courses_fetch()
                    }, 100)
                    return

                } else if (req.url === '/!pyser/' && req.method.toUpperCase() === "POST" && bodytxt) {
                    sharedfx.find7003(res, body)
                    return

                } else if (req.url.toLowerCase().startsWith('/!python7003/')) {
                    let tkey = req.url.substring(13)
                    if (tkey != pythonseed) {
                        sharedfx.returnErr(res, 404, "", true)
                    } else {
                        sharedfx.returnErr(res, 200, "", true)
                    }
                    return

                } else if (req.url == '/!start7003/') {
                    setTimeout(startPythonServer, 1000)
                    return

                } else if (req.url === '/!setvar/') {
                    if (bodytxt) {
                        let r = JSON.parse(bodytxt)
                        if (typeof r.courses != "undefined") courses = r.courses
                        if (typeof r.diffs != "undefined") diffs = r.diffs
                        if (typeof r.peoples != "undefined") peoples = r.peoples
                        if (typeof r.rooms != "undefined") rooms = r.rooms
                        if (typeof r.sems != "undefined") sems = r.sems
                        if (typeof r.insems != "undefined") insems = r.insems
                        if (typeof r.courseids != "undefined") courseids = r.courseids
                        if (typeof r.extraattr != "undefined") extraattr = r.extraattr
                        if (typeof r.coursegroups != "undefined") coursegroups = r.coursegroups
                        if (typeof r.majorminorreqs != "undefined") majorminorreqs = r.majorminorreqs
                        if (typeof r.coursereqs != "undefined") coursereqs = r.coursereqs
                        if (typeof r.phrasedcourse != "undefined") phrasedcourse = r.phrasedcourse
                        if (typeof r.majorschoolmapping != "undefined") majorschoolmapping = r.majorschoolmapping
                        console.log("[" + servar.domain + "] cacheing variables updated")
                        console.log(Object.keys(r))
                    }
                    sharedfx.returnErr(res, 200, "", true)

                } else if (req.url.toLowerCase().startsWith('/!getvar/')) {
                    switch (req.url.substring(9).toLowerCase()) {
                        case "courses":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: courses }))
                            break

                        case "diffs":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: diffs }))
                            break

                        case "peoples":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: peoples }))
                            break

                        case "rooms":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: rooms }))
                            break

                        case "sems":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: sems }))
                            break

                        case "insems":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: insems }))
                            break

                        case "courseids":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: courseids }))
                            break

                        case "extraattr":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: extraattr }))
                            break

                        case "coursegroups":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: coursegroups }))
                            break

                        case "majorminorreqs":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: majorminorreqs }))
                            break

                        case "coursereqs":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: coursereqs }))
                            break

                        case "phrasedcourse":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: phrasedcourse }))
                            break

                        case "majorschoolmapping":
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: majorschoolmapping }))
                            break

                        default:
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                            break
                    }

                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 404 }))

                }

            } else if (req.url.toLowerCase() === '/robots.txt') {
                res.writeHead(200, { 'Content-Type': 'text/plain', 'Server': 'joutou' })
                res.end(`User-agent: *\nDisallow: *`)

            } else if (req.url.toLowerCase() === '/favicon.ico') {
                res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Server': 'joutou', 'Cache-Control': 'max-age=604800' })
                res.end(sharedfx.envar.favicon)

            } else {
                res.writeHead(404, { 'Content-Type': 'application/json', 'Server': 'joutou' })
                res.end(JSON.stringify({ status: 404 }))

            }
        })
    })
    serverAPI.listen(7002)
    console.log("[" + servar.domain + "] Internal API Server Started / 7002")

} catch (error) {
    sharedfx.deathDump(servar.domain, "Unrecoverable global crash", error)
}