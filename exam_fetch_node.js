const fs = require('fs')
const path = require('path')
const https = require('https')
const post = (url, data) => fetch(url, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: data })
const getAllFromDir = (source, nameOnly = false) => fs.readdirSync(source).map(name => (nameOnly) ? name : path.join(source, name))
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const sharedfx = require((!fs.existsSync('./' + __filename.slice(__dirname.length + 1))) ? ('./../sharedfx_node.js') : ('./sharedfx_node.js'))
if (sharedfx.about() != "sharedfx") { throw new Error('bad sharedfx import') }

const servar = {
    exam_path: sharedfx.envar.course_path + "_exam\\",
    exam_temp_path: sharedfx.envar.course_temp_path + "_exam\\"
}; Object.freeze(servar)

let c = []

function download(url, dest, cb) {
    https.get(url, response => {
        if (response.statusCode == 301 || response.statusCode == 302 || response.statusCode == 307 || response.statusCode == 308) {
            body = []
            console.log('3xx redir: ' + decodeURI(url) + ' -> ' + decodeURI(response.headers.location))
            setTimeout(download, 250, response.headers.location, dest, cb)
        } else {
            //console.log('downloading: ' + decodeURI(url) + ' -> ' + dest)
            var file = fs.createWriteStream(dest)
            response.pipe(file)
            file.on('finish', function () {
                //console.log('downloaded: ' + dest)
                file.close(cb)
            })
        }
    }).on('error', function (err) {
        fs.unlink(dest)
        if (cb) cb(err.message)
    })
}

let latestSem = "2210"
let latestCourses = []
let downloadRemain = 0

function getLatestExamSet(exam_path, exam_temp_path, tm, cb) {
    let stm = (new Date()).getTime()
    https.get("https://w5.ab.ust.hk/wex/cgi-bin/", response => {
        if (!(response.statusCode == 301 || response.statusCode == 302 || response.statusCode == 307 || response.statusCode == 308)) {
            console.log("*** failed to get latest sem info")
            return -1
        }

        let lc = response.headers.location
        if (lc.endsWith("/")) lc = lc.slice(0, -1)
        latestSem = lc.split("/").pop()
        //latestSem = "2210"
        if (!fs.existsSync(exam_temp_path + "_index\\")) fs.mkdirSync(exam_temp_path + "_index\\")
        let dest = exam_temp_path + "_index\\" + latestSem + ".html"

        https.get("https://w5.ab.ust.hk/wex/cgi-bin/" + latestSem + "/", r => {
            if (r.statusCode != 200) {
                console.log("*** failed to get latest sem info")
                return -1
            }

            let file = fs.createWriteStream(dest)
            r.pipe(file)
            file.on('finish', function () {
                //console.log('downloaded: ' + dest)
                file.close(() => {

                    let index = fs.readFileSync(dest, "utf-8")

                    let dom = new JSDOM(index, {
                        contentType: "text/html",
                        storageQuota: 10000000
                    })

                    latestCourses = []

                    Array.from(dom.window.document.getElementById('navigator').children[2].children).forEach(courseName => {
                        latestCourses.push(courseName.textContent)
                    })

                    c = latestCourses

                    latestCourses.forEach(course => {
                        downloadRemain += 1
                        if (!fs.existsSync(exam_temp_path + course + "\\")) fs.mkdirSync(exam_temp_path + course + "\\")
                        download("https://w5.ab.ust.hk/wex/cgi-bin/" + latestSem + "/subject/" + course, exam_temp_path + course + "\\" + latestSem + ".html", () => { downloadRemain -= 1 })
                    })

                    let checkDL = setInterval(() => {
                        if (!downloadRemain) {
                            clearInterval(checkDL)
                            let xtm = (new Date()).getTime()
                            console.log("[exam_fetch] downloading done, used " + (xtm - stm) + "ms")
                            try {
                                JSONing(0, exam_temp_path, exam_path, () => {
                                    try {
                                        fs.rmSync(exam_temp_path + "_index\\", { recursive: true })
                                        fs.cpSync(exam_temp_path, exam_path, { recursive: true })
                                        fs.rmSync(exam_temp_path, { recursive: true })
                                    } catch (error) {
                                        console.log(error)
                                    }
                                    let xxtm = (new Date()).getTime()
                                    console.log("[exam_fetch] processing done, used " + (xxtm - xtm) + "ms")
                                    if (cb) cb(xxtm)
                                    return 0
                                })
                            } catch (error) {
                                console.log(error)
                                console.log("[exam_fetch] fatal error: unable to parse HTML, re-downloading...")
                                setTimeout(getLatestExamSet, 2000, exam_path, exam_temp_path, tm, cb)
                            }
                        }
                    }, 100)

                })
            })

        }).on('error', err => {
            fs.unlink(dest)
            console.log(err.message)
            console.log("[exam_fetch] fatal error: unable to download index HTML, re-downloading...")
            setTimeout(getLatestExamSet, 2000, exam_path, exam_temp_path, tm, cb)
        })

        response.destroy()

    }).on('error', err => {
        console.log(err.message)
        console.log("[exam_fetch] fatal error: unable to download index HTML, re-downloading...")
        setTimeout(getLatestExamSet, 2000, exam_path, exam_temp_path, tm, cb)
    })
}

// getLatestCourseSet("C:\\webserver\\nodejs\\uni\\course\\", "C:\\Users\\cakko\\AppData\\Local\\Temp\\course_dl\\", (new Date()).getTime(), () => {
//     getAllFromDir("C:\\Users\\cakko\\AppData\\Local\\Temp\\course_dl\\").forEach(dir => {try {
//         fs.rmdirSync(dir)
//     } catch (error) {
//         console.log(error)
//     }})
// })

const JSONing = (starting_index, exam_temp_path, exam_path, cb) => {

    let u = starting_index
    let lx = []
    let px = 0
    let domJSON = {}
    let courseMeta = {}
    let dom = ""

    while (c.length > u) {
        lx = getAllFromDir(exam_temp_path + c[u] + "\\")
        px = 0

        while (lx.length > px) {
            item = lx[px]
            if (item.endsWith(".html") && !item.replace(servar.exam_temp_path, "").includes("\\_")) {

                dom = new JSDOM(fs.readFileSync(item, "utf-8"), {
                    contentType: "text/html",
                    storageQuota: 10000000
                })

                domJSON = {}

                Array.from(dom.window.document.getElementById('classes').children).filter(course => typeof course.getElementsByTagName("h2")[0] != "undefined").forEach(course => {

                    courseMeta = {}

                    //console.log(course.getElementsByTagName("h2")[0].textContent)

                    let txindex = []
                    let reply = "", buff = ""
                    Array.from(course.getElementsByClassName("sections")[0].children[0].children).forEach((section, index) => {

                        if (index === 0) {
                            Array.from(section.children).forEach(name => txindex.push(name.textContent.trim()))
                            return
                        }

                        Array.from(section.children).forEach((name, i) => {
                            if (txindex[i] == "Section" || !name.textContent.trim() || name.textContent.trim() === "-") return
                            if (typeof courseMeta[section.children[1].textContent.trim()] === "undefined") courseMeta[section.children[1].textContent.trim()] = {}
                            buff = name.innerHTML.trim()
                            reply = buff
                            if (txindex[i] == "Instructor") {
                                buff = buff.split("<br>")
                                reply = []
                                buff.forEach(nameHTML => {
                                    reply.push(nameHTML.split("</a>")[0].split(">")[1])
                                })
                            } else if (txindex[i] == "No. of Students") {
                                reply = parseInt(reply)
                            }
                            courseMeta[section.children[1].textContent.trim()][txindex[i]] = reply
                        })

                    })

                    domJSON[course.getElementsByTagName("h2")[0].textContent] = courseMeta
                    courseMeta = {}
                })

                fs.writeFileSync(item + "-formatted.json", JSON.stringify(domJSON))
            }
            px += 1
        }
        u += 1
    }
    //console.log("done")
    if (cb) cb()
}

// c = getAllFromDir("C:\\Users\\cakko\\Desktop\\course\\", true, (new Date).getTime())
// JSONing(0, "C:\\Users\\cakko\\Desktop\\course\\", "T:\\", () => {})

let tm = (new Date()).getTime()

console.log("[exam_fetch] fetching exams...")
if (!fs.existsSync(servar.exam_temp_path)) fs.mkdirSync(servar.exam_temp_path)

getLatestExamSet(servar.exam_path, servar.exam_temp_path, tm, ntm => {



})