const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const { exec } = require("child_process")

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

    var courses = {}
    var diffs = {}
    var peoples = {}
    var rooms = {}
    var sems = []
    var insems = {}
    var courseids = {}

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
    function course_cache() {

        console.log("[" + servar.domain + "] starting cacheing...")

        cctm = (new Date())
        setTimeout(exec, 100, (servar.deployed) ? 'node uni\\course_cache_node.js' : 'node course_cache_node.js', err => { })

    }
    course_cache()

    function course_search(query) {
        if (!query) return []
        let tmark = (new Date()).getTime()
        let resultsPending = { courseids: courseids, peoples: Object.keys(peoples), rooms: Object.keys(rooms) }
        query = query.normalize().toLowerCase().split(" ")

        query.forEach(q => {
            resultsPending.peoples = resultsPending.peoples.filter(people => people.normalize().toLowerCase().includes(q))
            resultsPending.rooms = resultsPending.rooms.filter(room => room.normalize().toLowerCase().includes(q))

            let remainingCourseids = {}
            Object.keys(resultsPending.courseids).forEach(CODE => {
                let courseid = resultsPending.courseids[CODE]; courseid.CODE = CODE
                let keepit = false

                Object.keys(courseid).forEach(key => {
                    if (key != "SEM") { if (courseid[key].normalize().toLowerCase().includes(q)) keepit = true }
                })

                if (keepit) remainingCourseids[CODE] = resultsPending.courseids[CODE]
            })
            resultsPending.courseids = remainingCourseids
        })

        let results = []
        if (Object.keys(resultsPending.courseids).length) {
            Object.keys(resultsPending.courseids).forEach(CODE => {
                results.push({ type: "course", result: { CODE: CODE, NAME: resultsPending.courseids[CODE].NAME, SEM: resultsPending.courseids[CODE].SEM, DESCRIPTION: resultsPending.courseids[CODE].DESCRIPTION } })
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
                    timeArray.sort(); startT = timeArray[0]; endT = timeArray[timeArray.length - 1] + 19 * 60 * 1000

                    Object.keys(db).forEach(key => {
                        let keys = Object.keys(db[key])
                        keys.sort()

                        let time = startT, value = db[key][keys[0]], keys_pos = -1, iter = -1, newDB = []
                        do {
                            iter++
                            time += 20 * 60 * 1000

                            if (keys[keys_pos + 1] <= time + 20 * 60 * 1000) {
                                keys_pos++
                                value = db[key][keys[keys_pos]]
                            } else {
                                value = null
                            }

                            newDB.push(value)

                        } while (keys_pos < keys.length && endT > time)

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
                        list.sort()
                        if (list.length > 0) {
                            let rx = { ug: [], pg: [], both: [] }
                            list.forEach(dept => {
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
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                        }
                    } else {
                        let deptx = req.url.substring(9).split("/")[1]

                        if (!(deptx.length === 4 && typeof courses[deptx] != "undefined" && typeof courses[deptx][semx] != "undefined")) {
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                            return
                        }

                        if (req.url.substring(9).split('/').length == 2 || (req.url.substring(9).split('/').length == 3 && req.url.substring(9).split('/')[2] == "")) {
                            let resp = {}
                            Object.keys(courses[deptx][semx]).forEach(courseFullName => {
                                if (courseFullName != "_attr") resp[courseFullName] = { attr: courses[deptx][semx][courseFullName]["attr"] }
                            })
                            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 200, resp: resp }))
                            return
                        }

                        let coursex = req.url.substring(9).split("/")[2]
                        let courseNameFound = ""
                        Object.keys(courses[deptx][semx]).forEach(courseFullName => {
                            if (coursex === (courseFullName.split(" ")[0] + courseFullName.split(" ")[1])) courseNameFound = courseFullName
                        })

                        if (!courseNameFound) {
                            res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                            res.end(JSON.stringify({ status: 404 }))
                            return
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8', 'Server': 'joutou' })
                        res.end(JSON.stringify({ status: 200, resp: { [courseNameFound]: courses[deptx][semx][courseNameFound] } }))
                        return
                    }

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

                } else if (servar.deployed && req.url.startsWith('/!acc/')) {
                    acc.handle(req, res, body, servar)

                } else if (req.url.toLowerCase() === '/init.js') {
                    res.writeHead(200, { 'Content-Type': 'application/javascript', 'Server': 'joutou', 'Cache-Control': 'max-age=7200' })
                    fs.readFile('' + __dirname + path.sep + req.url.toLowerCase(), 'utf8', (err, data) => { (err) ? res.end("") : res.end(data) })

                } else if (req.url.toLowerCase() === '/robots.txt') {
                    res.writeHead(200, { 'Content-Type': 'text/plain', 'Server': 'joutou' })
                    res.end(`User-agent: *\nAllow: /\nAllow: /*\n\nDisallow: /!acc/*`)

                } else if (req.url.toLowerCase() === '/favicon.ico') {
                    res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Server': 'joutou', 'Cache-Control': 'max-age=604800' })
                    res.end(sharedfx.envar.favicon)

                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8', 'Server': 'joutou' })
                    res.end(sharedfx.envar.indexHTML.replace("%script%", `
                <script src="` + sharedfx.envar.cdnNETpath + `pkg\\chart.umd.js"></script>
                <script src="` + sharedfx.envar.cdnNETpath + `pkg\\chartjs-plugin-annotation.min.js"></script>
                <script src="` + sharedfx.envar.cdnNETpath + `pkg\\anime.min.js"></script>
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

                } else if (req.url === '/!course_fetch/') {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200 }))
                    setTimeout(() => {
                        courses_fetch()
                    }, 100)

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
                        console.log("[" + servar.domain + "] cacheing variables updated")
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Server': 'joutou' })
                    res.end(JSON.stringify({ status: 200 }))

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