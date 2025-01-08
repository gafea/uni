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
    course_path: sharedfx.envar.course_path,
    course_temp_path_root: sharedfx.envar.course_temp_path,
    course_temp_path: sharedfx.envar.course_temp_path + sharedfx.rndStr(8) + "\\"
}; Object.freeze(servar)

try {

    let bootFlag = {
        noDiff: false,
        noCache: false,
        sem: 0
    }

    process.argv.forEach(function (val, index, array) {
        Object.keys(bootFlag).forEach(flag => {
            if (val == flag) { bootFlag[flag] = true; console.log(flag + " mode on") }
            else if (val.includes(flag + "=")) { bootFlag[flag] = val.split("=")[1]; console.log(flag + " mode on, value: " + bootFlag[flag]) }
        })
    })

    if (!fs.existsSync(servar.course_temp_path_root)) fs.mkdirSync(servar.course_temp_path_root)
    if (!fs.existsSync(servar.course_temp_path)) fs.mkdirSync(servar.course_temp_path)

    let c = []

    function download(url, dest, cb, retryednum = 0) {
        https.get(url, response => {
            if (response.statusCode == 301 || response.statusCode == 302 || response.statusCode == 307 || response.statusCode == 308) {
                body = []
                console.log('3xx redir: ' + decodeURI(url) + ' -> ' + decodeURI(response.headers.location))
                setTimeout(download, 250, response.headers.location, dest, cb)
            } else {
                try {
                    //console.log('downloading: ' + decodeURI(url) + ' -> ' + dest)
                    let file = fs.createWriteStream(dest)
                    response.pipe(file)
                    file.on('finish', function () {
                        //console.log('downloaded: ' + dest)
                        file.close(cb)
                    })
                } catch (error) {
                    console.log(error)
                    post("http://127.0.0.1:7002/!setflag/", JSON.stringify({course_fetch_ongoing:2}))
                }
            }
        }).on('error', function (err) {
            fs.unlink(dest, () => { })
            console.log(err)
            
            if (retryednum < 5) {
                console.log("*** retrying... " + retryednum)
                setTimeout(download, 5000, url, dest, cb, retryednum + 1)
            } else {
                console.log("*** gaved up... " + retryednum)
                post("http://127.0.0.1:7002/!setflag/", JSON.stringify({course_fetch_ongoing:2}))
                if (cb) cb()
            }
        })
    }

    let latestSem = "2340"
    let latestCourses = []
    let downloadRemain = 0
    let retryNum = 0

    function failcb(response, course_path, course_temp_path, tm, cb) {
        if (response) console.log("*** failed to get latest sem info, got " + response.statusCode)
        if (retryNum < 10) {
            retryNum += 1
            console.log("*** retrying...")
            setTimeout(getLatestCourseSet, 5000, course_path, course_temp_path, tm, cb)
        } else {
            console.log("*** gaved up...")
            post("http://127.0.0.1:7002/!setflag/", JSON.stringify({course_fetch_ongoing:2}))
        }
    }

    function getLatestCourseSet(course_path, course_temp_path, tm, cb) {
        let stm = (new Date()).getTime()
        https.get("https://w5.ab.ust.hk/wcq/cgi-bin/", response => {
            if (!(response.statusCode == 301 || response.statusCode == 302 || response.statusCode == 307 || response.statusCode == 308)) {
                failcb(response, course_path, course_temp_path, tm, cb)
                return -1
            }

            let lc = response.headers.location
            if (lc.endsWith("/")) lc = lc.slice(0, -1)
            latestSem = lc.split("/").pop()
            if (!fs.existsSync(course_temp_path + "_diff\\")) fs.mkdirSync(course_temp_path + "_diff\\")
            if (!fs.existsSync(course_temp_path + "_mdiff\\")) fs.mkdirSync(course_temp_path + "_mdiff\\")
            if (!fs.existsSync(course_temp_path + "_index\\")) fs.mkdirSync(course_temp_path + "_index\\")
            let dest = course_temp_path + "_index\\" + latestSem + ".html"

            //latestSem = "2220"
            if (bootFlag.sem) latestSem = bootFlag.sem

            https.get("https://w5.ab.ust.hk/wcq/cgi-bin/" + latestSem + "/", r => {
                if (r.statusCode != 200) {
                    failcb(r, course_path, course_temp_path, tm, cb)
                    return -1
                }

                let file = fs.createWriteStream(dest)
                r.pipe(file)
                file.on('finish', function () {
                    //console.log('downloaded: ' + dest)
                    file.close(() => {

                        let index = fs.readFileSync(dest, "utf-8")

                        index.split('\n').forEach(line => {
                            if (line.startsWith("var allcourses = [")) {
                                if (!fs.existsSync(course_temp_path + "_allcourses\\")) fs.mkdirSync(course_temp_path + "_allcourses\\")
                                let x = line.substring(17).replace("['", "").replace("']", "")
                                let y = []
                                x.split("','").forEach(cu => {
                                    y.push(cu.split("////")[0].trim())
                                })
                                fs.writeFileSync(course_temp_path + "_allcourses\\" + latestSem + ".json", JSON.stringify(y))
                            } else if (line.startsWith("var allinstructors = [")) {
                                if (!fs.existsSync(course_temp_path + "_allinstructors\\")) fs.mkdirSync(course_temp_path + "_allinstructors\\")
                                fs.writeFileSync(course_temp_path + "_allinstructors\\" + latestSem + ".json", line.substring(21).slice(0, -1).replaceAll(`'`, `"`))
                            }
                        })

                        let dom = new JSDOM(index, {
                            contentType: "text/html",
                            storageQuota: 10000000
                        })

                        latestCourses = []

                        Array.from(dom.window.document.getElementById('subjectItems').children).forEach(courseName => {
                            latestCourses.push(courseName.textContent)
                        })

                        c = latestCourses

                        latestCourses.forEach(course => {
                            downloadRemain += 1
                            if (!fs.existsSync(course_temp_path + course + "\\")) fs.mkdirSync(course_temp_path + course + "\\")
                            download("https://w5.ab.ust.hk/wcq/cgi-bin/" + latestSem + "/subject/" + course, course_temp_path + course + "\\" + latestSem + ".html", () => { downloadRemain -= 1 })
                        })

                        let checkDL = setInterval(() => {
                            if (!downloadRemain) {
                                clearInterval(checkDL)
                                let xtm = (new Date()).getTime()
                                console.log("[courses_fetch] downloading done, used " + (xtm - stm) + "ms")
                                try {
                                    JSONing(0, course_temp_path, course_path, latestSem, () => {
                                        try {
                                            fs.rmSync(course_temp_path + "_index\\", { recursive: true })
                                            fs.cpSync(course_temp_path, course_path, { recursive: true })
                                            fs.rmSync(course_temp_path, { recursive: true })
                                        } catch (error) {
                                            console.log(error)
                                        }
                                        let xxtm = (new Date()).getTime()
                                        console.log("[courses_fetch] processing done, used " + (xxtm - xtm) + "ms")
                                        if (cb) cb(xxtm)
                                        return 0
                                    })
                                } catch (error) {
                                    console.log(error)
                                    failcb(false, course_path, course_temp_path, tm, cb)
                                }
                            }
                        }, 500)

                    })
                })

            }).on('error', err => {
                fs.unlink(dest, () => { })
                console.log(err.message)
                failcb(false, course_path, course_temp_path, tm, cb)
                return -1
            })

            response.destroy()

        }).on('error', err => {
            console.log(err.message)
            failcb(false, course_path, course_temp_path, tm, cb)
            return -1
        })
    }

    // getLatestCourseSet("C:\\webserver\\nodejs\\uni\\course\\", "C:\\Users\\cakko\\AppData\\Local\\Temp\\course_dl\\", (new Date()).getTime(), () => {
    //     getAllFromDir("C:\\Users\\cakko\\AppData\\Local\\Temp\\course_dl\\").forEach(dir => {try {
    //         fs.rmdirSync(dir)
    //     } catch (error) {
    //         console.log(error)
    //     }})
    // })

    const JSONing = (starting_index, course_temp_path, course_path, latestSem, cb) => {

        let u = starting_index
        let lx = []
        let px = 0
        let domJSON = {}
        let courseMeta = {}
        let dom = ""

        let currentDiffIndex = {}
        if (!bootFlag.noDiff && fs.existsSync(course_path + "_mdiff\\")) {
            fs.readdirSync(course_path + "_mdiff\\").forEach(sem => {
                currentDiffIndex[sem] = {}
                fs.readdirSync(course_path + "_mdiff\\" + sem + "\\").forEach(course => {
                    currentDiffIndex[sem][course.split(".json")[0]] = true
                })
            })
        }

        while (c.length > u) {
            lx = getAllFromDir(course_temp_path + c[u] + "\\")
            px = 0

            while (lx.length > px) {
                item = lx[px]
                if (item.endsWith(".html") && !item.includes("\\_")) {

                    dom = new JSDOM(fs.readFileSync(item, "utf-8"), {
                        contentType: "text/html",
                        storageQuota: 10000000
                    })

                    domJSON = {}
                    if (fs.existsSync(item.replace(course_temp_path, course_path) + "-formatted.json")) domJSON = JSON.parse(fs.readFileSync(item.replace(course_temp_path, course_path) + "-formatted.json", "utf-8"))

                    Array.from(dom.window.document.getElementById('classes').children).forEach(course => {

                        if (typeof course.getElementsByClassName("courseinfo") == "undefined" || typeof course.getElementsByClassName("courseinfo")[0] == "undefined") return
                        if (typeof course.getElementsByClassName("courseinfo")[0].getElementsByClassName("courseattrContainer") == "undefined" || typeof course.getElementsByClassName("courseinfo")[0].getElementsByClassName("courseattrContainer")[0] == "undefined") return
                        if (typeof course.getElementsByClassName("courseinfo")[0].getElementsByClassName("courseattrContainer")[0].getElementsByClassName("subject") == "undefined" || typeof course.getElementsByClassName("courseinfo")[0].getElementsByClassName("courseattrContainer")[0].getElementsByClassName("subject")[0] == "undefined") return

                        courseSubjectName = course.getElementsByClassName("courseinfo")[0].getElementsByClassName("courseattrContainer")[0].getElementsByClassName("subject")[0].textContent
                        courseMeta = { attr: {}, section: {} }

                        if (course.getElementsByClassName("courseinfo")[0].getElementsByClassName("matching").length > 0) {
                            courseMeta["attr"]["MATCHING"] = course.getElementsByClassName("courseinfo")[0].getElementsByClassName("matching")[0].textContent
                        }

                        Array.from(course.getElementsByClassName("courseattr")[0].getElementsByTagName("table")[0].children[0].children).forEach(courseattr => {
                            courseMeta["attr"][courseattr.children[0].innerHTML.replaceAll("<br>", " ")] = courseattr.children[1].innerHTML
                        })

                        var txindex = []
                        var first_section_name = ""
                        var tempx = {}
                        var sectlist = {}

                        if (typeof course.getElementsByClassName("sections") != "undefined" && typeof course.getElementsByClassName("sections")[0] != "undefined" && typeof course.getElementsByClassName("sections")[0].children != "undefined" && typeof course.getElementsByClassName("sections")[0].children[0] != "undefined" && typeof course.getElementsByClassName("sections")[0].children[0].children != "undefined") {

                            Array.from(course.getElementsByClassName("sections")[0].children[0].children).forEach((section, index) => {

                                if (index === 0) {
                                    Array.from(section.children).forEach(name => {
                                        txindex.push(name.textContent)
                                    })

                                } else {

                                    if (section.classList.contains("newsect")) {
                                        if (first_section_name) tempx[first_section_name] = JSON.parse(JSON.stringify(sectlist))
                                        sectlist = {}
                                        first_section_name = section.children[0].textContent.trim()
                                    } else if (!section.classList.contains("otherRow")) {
                                        return
                                    }

                                    Array.from(section.children).forEach((name, i) => {
                                        if (i && name.textContent.trim()) {

                                            if (typeof sectlist[section.children[1].textContent.trim()] === "undefined") sectlist[section.children[1].textContent.trim()] = {}
                                            sectlist[section.children[1].textContent.trim()][txindex[i]] = name.textContent.trim()

                                        }
                                    })

                                }

                            })

                            tempx[first_section_name] = JSON.parse(JSON.stringify(sectlist))

                        }

                        courseMeta["section"] = JSON.parse(JSON.stringify(tempx))

                        if (!bootFlag.noDiff) {
                            let timeNow = (new Date)
                            let courseCode = courseSubjectName.split(" - ")[0].replace(" ", "")

                            let diffFilePath = "" + item.split("\\").pop().slice(0, 4) + "\\" + courseCode + ".json"
                            if (!fs.existsSync(course_temp_path + "_diff\\" + item.split("\\").pop().slice(0, 4) + "\\")) fs.mkdirSync(course_temp_path + "_diff\\" + item.split("\\").pop().slice(0, 4) + "\\")
                            if (!fs.existsSync(course_temp_path + "_mdiff\\" + item.split("\\").pop().slice(0, 4) + "\\")) fs.mkdirSync(course_temp_path + "_mdiff\\" + item.split("\\").pop().slice(0, 4) + "\\")

                            let diff = {}, mdiff = {}, lessonDetails = {}
                            if (fs.existsSync(course_path + "_diff\\" + diffFilePath)) diff = JSON.parse(fs.readFileSync(course_path + "_diff\\" + diffFilePath, "utf-8"))
                            if (fs.existsSync(course_path + "_mdiff\\" + diffFilePath)) mdiff = JSON.parse(fs.readFileSync(course_path + "_mdiff\\" + diffFilePath, "utf-8"))
                            let omdiff = JSON.stringify(mdiff)

                            if (typeof currentDiffIndex[item.split("\\").pop().slice(0, 4)] != "undefined" && typeof currentDiffIndex[item.split("\\").pop().slice(0, 4)][courseCode] != "undefined") {
                                delete currentDiffIndex[item.split("\\").pop().slice(0, 4)][courseCode]
                                if (!Object.keys(currentDiffIndex[item.split("\\").pop().slice(0, 4)])) {
                                    delete currentDiffIndex[item.split("\\").pop().slice(0, 4)]
                                }
                            }

                            Object.keys(tempx).forEach(lesson => {
                                lessonDetails = tempx[lesson][Object.keys(tempx[lesson])[0]]

                                if (typeof diff[lesson] === "undefined") diff[lesson] = {}
                                diff[lesson][timeNow.getTime()] = Number((((parseInt(lessonDetails.Enrol) + parseInt(lessonDetails.Wait)) / parseInt(lessonDetails.Quota.split("Quota/Enrol/Avail")[0])) * 100).toFixed(2))

                                if (typeof mdiff[lesson] === "undefined") mdiff[lesson] = {}
                                Object.keys(mdiff[lesson]).forEach(attr => {
                                    if (!Object.values(mdiff[lesson][attr].slice(-1)[0]).slice(-1)[0] && typeof lessonDetails[attr] === "undefined") mdiff[lesson][attr].push({ [timeNow.getTime()]: "" })
                                })
                                Object.keys(lessonDetails).forEach(attr => {
                                    if (typeof mdiff[lesson][attr] === "undefined" || Object.values(mdiff[lesson][attr].slice(-1)[0]).slice(-1)[0] != lessonDetails[attr]) {
                                        if (typeof mdiff[lesson][attr] === "undefined") mdiff[lesson][attr] = []
                                        mdiff[lesson][attr].push({ [timeNow.getTime()]: lessonDetails[attr] })
                                    }
                                })
                            })
                            fs.writeFileSync(course_temp_path + "_diff\\" + diffFilePath, JSON.stringify(diff))
                            if (JSON.stringify(mdiff) != omdiff) fs.writeFileSync(course_temp_path + "_mdiff\\" + diffFilePath, JSON.stringify(mdiff))
                        }

                        tempx = {}

                        domJSON[courseSubjectName] = JSON.parse(JSON.stringify(courseMeta))
                        courseMeta = {}
                    })

                    fs.writeFileSync(item + "-formatted.json", JSON.stringify(Object.fromEntries(Object.entries(domJSON).sort())))
                }
                px += 1
            }
            u += 1
        }

        if (!bootFlag.noDiff) { //add an empty entry in every mdiff file where it was not found in the html we just downloaded
            Object.keys(currentDiffIndex).forEach(sem => {
                if (sem == latestSem) {
                    Object.keys(currentDiffIndex[sem]).forEach(course => {
                        let mdiff = {}, omdiff = "", diffFilePath = "" + sem + "\\" + course + ".json"
                        if (fs.existsSync(course_path + "_mdiff\\" + diffFilePath)) {
                            mdiff = JSON.parse(fs.readFileSync(course_path + "_mdiff\\" + diffFilePath, "utf-8")); omdiff = JSON.stringify(mdiff)
                            let timeNow = (new Date)
                            Object.keys(mdiff).forEach(lesson => {
                                Object.keys(mdiff[lesson]).forEach(attr => {
                                    if (Object.values(mdiff[lesson][attr].slice(-1)[0]).slice(-1)[0]) mdiff[lesson][attr].push({ [timeNow.getTime()]: "" })
                                })
                            })
                            if (JSON.stringify(mdiff) != omdiff) fs.writeFileSync(course_temp_path + "_mdiff\\" + diffFilePath, JSON.stringify(mdiff))
                        }
                    })
                }
            })
        }

        //console.log("done")
        if (cb) cb()
    }

    // c = getAllFromDir("C:\\Users\\cakko\\Desktop\\course\\", true, (new Date).getTime())
    // JSONing(0, "C:\\Users\\cakko\\Desktop\\course\\", "T:\\", () => {})

    let tm = (new Date()).getTime()

    console.log("[courses_fetch] fetching courses...")
    if (!fs.existsSync(servar.course_temp_path)) fs.mkdirSync(servar.course_temp_path)

    getLatestCourseSet(servar.course_path, servar.course_temp_path, tm, ntm => {

        let cb = () => { console.log('[courses_fetch] fetching done, total used ' + ((new Date()).getTime() - tm) + 'ms') }
        post("http://127.0.0.1:7002/!setflag/", JSON.stringify({course_fetch_ongoing:0}))

        if (bootFlag.noCache) { cb(); return }

        fetch("http://127.0.0.1:7002/!course_cache/").then(r => r.json()).then(r => cb())

    })

} catch (error) {
    sharedfx.deathDump("course_fetch_node", "Unrecoverable global crash", error)
    post("http://127.0.0.1:7002/!setflag/", JSON.stringify({course_fetch_ongoing:2}))
}