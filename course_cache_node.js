const fs = require('fs')
const path = require('path')
const https = require('https')
const { exec } = require("child_process")
const post = (url, data) => fetch(url, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: data })

const sharedfx = require((!fs.existsSync('./' + __filename.slice(__dirname.length + 1))) ? ('./../sharedfx_node.js') : ('./sharedfx_node.js'))
if (sharedfx.about() != "sharedfx") { throw new Error('bad sharedfx import') }

const servar = {
    course_path: sharedfx.envar.course_path,
    course_temp_path: sharedfx.envar.course_temp_path,
    course_backup_path: sharedfx.envar.course_backup_path,
}; Object.freeze(servar)

let firstBoot = false
process.argv.forEach(function (val, index, array) {
    if (val == "firstBoot") firstBoot = true
})

let cctm = (new Date())
console.log("[courses_cache] cacheing courses...")

let localdirpath = servar.course_path + `../`
if (firstBoot && fs.existsSync(localdirpath + "majorschoolmapping.json") && fs.existsSync(localdirpath + "major.json") && fs.existsSync(localdirpath + "masking.json")) {
    let mmm = JSON.parse(fs.readFileSync(localdirpath + "majorschoolmapping.json", "utf8")), major = JSON.parse(fs.readFileSync(localdirpath + "major.json", "utf8")), masking = JSON.parse(fs.readFileSync(localdirpath + "masking.json", "utf8"))
    post("http://127.0.0.1:7002/!setvar/", JSON.stringify({ majorschoolmapping: mmm, majorminorreqs: major })).then(r => r.json()).then(r => {
        post("http://127.0.0.1:7003/!setvar/majorschoolmapping", JSON.stringify(mmm)).then(r => r.json()).then(r => {
            post("http://127.0.0.1:7003/!setvar/major", JSON.stringify(major)).then(r => r.json()).then(r => {
                post("http://127.0.0.1:7003/!setvar/replacement", JSON.stringify(masking)).then(r => r.json()).then(r => {
                    console.log('[courses_cache] cacheing majorschoolmapping, majorminorreqs, masking done')
                })
            })
        })
    })
}

let xcourses = {}
let xdiffs = {}
let xpeoples = {}
let xrooms = {}
let xsems = []
let xinsems = {}
let xcourseids = {}
let xextraattr = {}
let xcoursegroups = {}

function lessonToType(lesson) {
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

sharedfx.getAllFromDir(servar.course_path, true).forEach(sx => {
    if (sx[0] != "_") {
        xcourses[sx] = {}
        sharedfx.getAllFromDir(servar.course_path + path.sep + sx).forEach(s => {
            st = s.split(path.sep).pop()
            if (st.toLowerCase().endsWith(".html-formatted.json")) {
                xcourses[sx][st.split(".")[0]] = JSON.parse(fs.readFileSync(s, "utf-8"))
                if (!xsems.includes(st.split(".")[0])) xsems.push(st.split(".")[0])
                let ug = false, pg = false, firstNum = 0
                Object.keys(xcourses[sx][st.split(".")[0]]).forEach(courseName => {
                    firstNum = parseInt(courseName[5])
                    if (firstNum > 0 && firstNum < 5) {
                        ug = true
                    } else if (firstNum > 4) {
                        pg = true
                    }
                    if (courseName.startsWith(sx)) {
                        let code = courseName.split(" ")[0] + courseName.split(" ")[1]
                        xdiffs[code] = {}
                        if (typeof xinsems[code] === "undefined") xinsems[code] = []
                        xinsems[code].push(st.split(".")[0])
                        if (typeof xcourseids[code] === "undefined") xcourseids[code] = {}
                        let course = courseName
                        xcourseids[code] = { UNITS: course.split(" (").pop().split(" ")[0], SEM: st.split(".")[0], COURSEID: course, NAME: course.replace(course.split(" - ")[0] + " - ", "").substring(course.replace(course.split(" - ")[0] + " - ", ""), course.replace(course.split(" - ")[0] + " - ", "").lastIndexOf(" (")) }
                        let c = xcourses[sx][st.split(".")[0]][courseName];
                        ["DESCRIPTION", "INTENDED LEARNING OUTCOMES", "ALTERNATE CODE(S)", "PREVIOUS CODE"].forEach(a => {
                            if (typeof c.attr[a] != "undefined") {
                                if (a == "ALTERNATE CODE(S)" || a == "PREVIOUS CODE") {
                                    let str = []
                                    c.attr[a].split(", ").forEach(ac => {
                                        str.push(ac.trim().replace(" ", ""))
                                    })
                                    xcourseids[code][a] = str.join(", ")
                                } else {
                                    xcourseids[code][a] = c.attr[a]
                                }
                            }
                        })
                    }
                })
                xcourses[sx][st.split(".")[0]]["_attr"] = { ug: ug, pg: pg }
            }
        })
    }
})
xsems.sort()
xsems.reverse()

sharedfx.getAllFromDir(servar.course_path + "_allinstructors\\", true).forEach(sem => {
    JSON.parse(fs.readFileSync(servar.course_path + "_allinstructors\\" + sem + ".json", "utf-8")).forEach(people => {
        if (typeof xpeoples[people] === "undefined") xpeoples[people] = {}
        xpeoples[people][sem] = {}
    })
})
if (typeof xpeoples[" "] != "undefined") delete xpeoples[" "]

let lesson = {}, date = {}
let roomName = "", instructorString = "", instructors = [], duplicatedInstructors = [], missingInstructors = {}, examJSON = {}, examJSONkeys = {}
Object.keys(xcourses).forEach(courseKey => {
    Object.keys(xcourses[courseKey]).forEach(semKey => {

        examJSON = {}; examJSONkeys = {}
        if (fs.existsSync(servar.course_path + "_exam\\" + courseKey + "\\" + semKey + ".html-formatted.json")) {
            examJSON = JSON.parse(fs.readFileSync(servar.course_path + "_exam\\" + courseKey + "\\" + semKey + ".html-formatted.json"))
            Object.keys(examJSON).forEach(key => {
                examJSONkeys[key.split(" - ")[0]] = key
            })
        }

        Object.keys(xcourses[courseKey][semKey]).forEach(lessonKey => {

            if (!lessonKey.startsWith("_") && Object.keys(examJSONkeys).includes(lessonKey.split(" - ")[0])) {
                xcourses[courseKey][semKey][lessonKey]["exam"] = examJSON[examJSONkeys[lessonKey.split(" - ")[0]]]
            }

            lesson = xcourses[courseKey][semKey][lessonKey]

            if (typeof lesson["section"] != "undefined" && lesson["section"] && Object.keys(lesson["section"])) {
                let allSectionQuotaAreZero = true
                Object.keys(lesson["section"]).forEach(sectionKey => {
                    Object.keys(lesson["section"][sectionKey]).forEach(dateKey => {
                        date = lesson["section"][sectionKey][dateKey]
                        roomName = date["Room"].split(" (")[0].split(", Lift ")[0].replace("Lecture Theater ", "LT").replace("Rm ", "Rm")
                        if (typeof date["Quota"] != "undefined" && date["Quota"] !== "0") allSectionQuotaAreZero = false
                        if (typeof date["Instructor"] === "string" && date["Instructor"] && date["Instructor"] != "TBA") {
                            instructorString = date["Instructor"]
                            instructors = Object.keys(xpeoples).filter(people => (instructorString.includes(people) && Object.keys(xpeoples[people]).includes(semKey)))

                            instructors.sort()
                            instructors.reverse()
                            duplicatedInstructors = []
                            instructors.forEach(instructor => {
                                if (instructorString.includes(instructor)) {
                                    instructorString = instructorString.replace(instructor, "")
                                } else {
                                    duplicatedInstructors.push(instructor)
                                }
                            })
                            if (instructorString) {
                                if (instructorString.split(", ").length === 2 && !duplicatedInstructors.length) { //one name of instructor was not in instructor database, and no duplicatedInstructors inside, by logic we can know this remained instructorString is the only name of this course session
                                    instructorString = instructorString.trim()
                                    instructors.push(instructorString)
                                    if (typeof missingInstructors[semKey] === "undefined") missingInstructors[semKey] = []
                                    if (!missingInstructors[semKey].includes(instructorString)) missingInstructors[semKey].push(instructorString)
                                } else {
                                    console.log("[courses_cache] instructor deduplication failed, instructorString remained = '" + instructorString + "', duplicatedInstructors = " + JSON.stringify(duplicatedInstructors) + "\n\t@ sem " + semKey + ", " + lessonKey + ", " + sectionKey)
                                }
                            } else if (duplicatedInstructors.length) {
                                instructors = instructors.filter(i => !duplicatedInstructors.includes(i))
                                instructors.sort()
                            }

                            xcourses[courseKey][semKey][lessonKey]["section"][sectionKey][dateKey]["Instructor"] = instructors
                            instructors.forEach(instructor => {
                                try {
                                    if (dateKey != "TBA") {
                                        xpeoples[instructor][semKey][dateKey] = { course: lessonKey, section: sectionKey, room: roomName }
                                    } else {
                                        if (typeof xpeoples[instructor][semKey]["TBA"] === "undefined") xpeoples[instructor][semKey]["TBA"] = []
                                        xpeoples[instructor][semKey]["TBA"].push({ course: lessonKey, section: sectionKey, room: roomName })
                                    }
                                } catch (error) { }
                            })
                        }
                        if (Object.keys(date)[0] != "TBA" && date["Room"] != "TBA") {
                            if (typeof xrooms[roomName] === "undefined") xrooms[roomName] = {}
                            if (typeof xrooms[roomName][semKey] === "undefined") xrooms[roomName][semKey] = {}
                            xrooms[roomName][semKey][dateKey] = { course: lessonKey, section: sectionKey }
                        }
                    })
                })
                if (allSectionQuotaAreZero) {
                    xcourses[courseKey][semKey][lessonKey].attr._cancelled = true
                }
            } else if (typeof lesson["section"] != "undefined" && !(lesson["section"] && Object.keys(lesson["section"]))) {
                delete xcourses[courseKey][semKey][lessonKey]["section"]
            }

            if (typeof lesson["attr"] != "undefined" && lesson["attr"] && Object.keys(lesson["attr"]) && typeof lesson["attr"]["ATTRIBUTES"] != "undefined" && lesson["attr"]["ATTRIBUTES"]) {
                lesson["attr"]["ATTRIBUTES"].split("<br>").forEach(groupName => {
                    groupName = groupName.replace("&amp;", "&").trim()
                    if (typeof xcoursegroups[semKey] === "undefined") xcoursegroups[semKey] = {}
                    if (typeof xcoursegroups[semKey][groupName] === "undefined") xcoursegroups[semKey][groupName] = { _attr: { ug: false, pg: false } }
                    xcoursegroups[semKey][groupName][lessonKey] = { attr: JSON.parse(JSON.stringify(xcourses[courseKey][semKey][lessonKey].attr)) }
                    xcoursegroups[semKey][groupName]._attr[((parseInt(lessonKey.substring(5, 6)) < 5) ? "ug" : "pg")] = true
                })
            }

        })
    })
})
if (Object.keys(missingInstructors)) {
    Object.keys(missingInstructors).forEach(key => {
        console.log("[courses_cache] info: the following names are missing in instructors file @ sem " + key + " :")
        console.log(JSON.stringify(missingInstructors[key]))
    })
}
lesson = {}; date = {}; roomName = ""; instructorString = ""; instructors = []; missingInstructors = {}

Object.keys(xpeoples).forEach(people => {
    Object.keys(xpeoples[people]).forEach(sem => {
        if (Object.keys(xpeoples[people][sem]).length === 0) delete xpeoples[people][sem]
    })
    if (Object.keys(xpeoples[people]).length === 0) delete xpeoples[people]
})

let pkg = {}
pkg["courses"] = xcourses
pkg["peoples"] = xpeoples
pkg["rooms"] = xrooms
pkg["sems"] = xsems
pkg["courseids"] = xcourseids
pkg["insems"] = xinsems
pkg["coursegroups"] = xcoursegroups
post("http://127.0.0.1:7002/!setvar/", JSON.stringify(pkg)).then(r => r.json()).then(r => {
    console.log('[courses_cache] early cacheing to nodejs server done')
})

post("http://127.0.0.1:7003/!setvar/courses", JSON.stringify(xcourses)).then(r => r.json()).then(r => {
    post("http://127.0.0.1:7003/!setvar/courseids", JSON.stringify(xcourseids)).then(r => r.json()).then(r => {
        post("http://127.0.0.1:7003/!setvar/coursegroups", JSON.stringify(xcoursegroups)).then(r => r.json()).then(r => {
            post("http://127.0.0.1:7003/!setvar/sems", JSON.stringify(xsems)).then(r => r.json()).then(r => {
                post("http://127.0.0.1:7003/!setvar/insems", JSON.stringify(xinsems)).then(r => r.json()).then(r => {
                    console.log('[courses_cache] cacheing to python server done')
                })
            })
        })
    })
}).catch(e => {
    console.log(e)
    sharedfx.deathDump("course_cache_node", "Failed to send data to :7003", e)
})

let willmodifydiff = false
if (true) {
    willmodifydiff = true
    let atm2 = (new Date())
    let cacheData = {}

    let timeArray = [], startT = 0, endT = 0
    Object.keys(xdiffs).forEach(courseCode => {
        let diffFilePath = servar.course_path + "_diff\\" + xsems[0] + "\\" + courseCode + ".json"
        if (fs.existsSync(diffFilePath)) {
            cacheData[courseCode] = JSON.parse(fs.readFileSync(diffFilePath, "utf-8"))
            Object.keys(cacheData[courseCode]).forEach(lesson => {
                Object.keys(cacheData[courseCode][lesson]).forEach(dataPointTime => {
                    let newDataPointTime = dataPointTime - dataPointTime % (20 * 60 * 1000)
                    if (!timeArray.includes(newDataPointTime)) timeArray.push(newDataPointTime)
                })
            })
        }
    })
    timeArray.sort(); startT = timeArray[0]; endT = timeArray[timeArray.length - 1] + 19 * 60 * 1000; timeArray = [];
    let timeU = startT; do { timeArray.push(timeU); timeU += 20 * 60 * 1000 } while (endT >= timeU);

    Object.keys(xdiffs).forEach(courseCode => {
        if (typeof cacheData[courseCode] != "undefined") {
            let data = cacheData[courseCode]

            Object.keys(data).forEach(lesson => {
                Object.keys(data[lesson]).forEach(dataPointTime => {
                    let newDataPointTime = dataPointTime - dataPointTime % (20 * 60 * 1000)
                    data[lesson][newDataPointTime] = data[lesson][dataPointTime]
                    delete data[lesson][dataPointTime]
                })
            })

            xdiffs[courseCode] = []
            //xdiffs[courseCode] = { lec: [], lab: [], tut: [], rsh: [], otr: [] }

            let datasets = {}
            Object.keys(data).forEach(key => {
                let keys = Object.keys(data[key])
                keys.sort()

                let time = startT, value = data[key][keys[0]], keys_pos = -1, newDB = []
                do {
                    if (keys[keys_pos + 1] < time + 20 * 60 * 1000) {
                        keys_pos++
                        value = data[key][keys[keys_pos]]
                    } else {
                        value = null
                    }
                    newDB.push(value)
                    time += 20 * 60 * 1000
                } while (keys_pos < keys.length && endT >= time)

                if (typeof datasets[lessonToType(key)] == "undefined") datasets[lessonToType(key)] = {}
                datasets[lessonToType(key)][key] = newDB
            });

            let maxLessonNum = 1;
            ["lec", "lab", "tut", "rsh", "otr"].forEach((lessonType, index) => {
                if (typeof datasets[lessonType] != "undefined" && Object.keys(datasets[lessonType]).length) {
                    let maxThisLessonNum = 0
                    Object.keys(datasets[lessonType]).forEach(lesson => {

                        let thisLessonNum = lesson.split(" ")[0].replace(/^\D+|\D+$/g, "")
                        if (!thisLessonNum) thisLessonNum = "1"
                        thisLessonNum = parseInt(thisLessonNum)
                        //console.log(lesson, thisLessonNum)
                        if (maxThisLessonNum < thisLessonNum) maxThisLessonNum = thisLessonNum

                    })
                    //console.log(lessonType, maxThisLessonNum)
                    if (maxLessonNum < maxThisLessonNum) maxLessonNum = maxThisLessonNum
                }
            });
            //console.log(courseCode, maxLessonNum);
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

                        //console.log("#" + sharedfx.zeroPad((Math.round(thisLessonNum / maxLessonNum * 256) - 1).toString(16), 2) + "0000")

                        //xdiffs[courseCode][lessonType].push({label: lesson, data: datasets[lessonType][lesson], pointStyle: px})
                        xdiffs[courseCode].push({ label: lesson, data: datasets[lessonType][lesson], pointStyle: pS, pointRadius: 0, pointHoverRadius: pHR, borderDash: pBD, borderColor: "hsl(" + ((60 - Math.round((thisLessonNum - 1) * 100 / maxLessonNum)) / 100) + "turn, " + pCB + "%, 60%)", backgroundColor: "hsl(" + ((60 - Math.round((thisLessonNum - 1) * 100 / maxLessonNum)) / 100) + "turn, " + pCB + "%, 85%)" })

                    })
                } else { delete xdiffs[courseCode][lessonType] }
            })
        } else { delete xdiffs[courseCode] }

    })
    xdiffs["_times"] = timeArray
}

let willmodifyextraattr = false
if (firstBoot) {
    willmodifyextraattr = true
    let kcourseids = Object.keys(xcourseids).sort().reverse()
    kcourseids.reverse().forEach(courseid => {
        let xcourseName = ""
        for (const fullCourseName of Object.keys(xcourses[courseid.substring(0, 4)][xcourseids[courseid].SEM])) {
            if (fullCourseName.startsWith(courseid.substring(0, 4) + " " + courseid.substring(4) + " - ")) {
                xcourseName = fullCourseName
                break
            }
        }
        let rx = JSON.parse(JSON.stringify(xcourses[courseid.substring(0, 4)][xcourseids[courseid].SEM][xcourseName])), condiA = false, condiB = false
        kcourseids.forEach(xcourseid => {
            ["PRE-REQUISITE", "EXCLUSION"].forEach(a => {
                if (typeof rx.attr[a] != "undefined") {
                    condiA = rx.attr[a].includes(xcourseid.substring(0, 4) + " " + xcourseid.substring(4))
                    //TODO: think about how to handle cases like ( exclude CORE1403 -> exclude CORE1403A & CORE1403S & CORE1403I ) with current looping approach
                    //current bug: ( exclude CORE1403I will be treated as exclude CORE1403A & CORE1403S & CORE1403I when CORE1403 does not exist )
                    //condiB = (condiA) ? true : (!kcourseids.includes(xcourseid.substring(0, 8)) && rx.attr[a].includes(xcourseid.substring(0, 4) + " " + xcourseid.substring(4, 8)))
                    if (courseid != xcourseid && (condiA || condiB)) {
                        if (typeof xextraattr[xcourseid] === "undefined") xextraattr[xcourseid] = {}
                        if (typeof xextraattr[xcourseid]["" + a + "-BY"] === "undefined") xextraattr[xcourseid]["" + a + "-BY"] = []
                        xextraattr[xcourseid]["" + a + "-BY"].push(courseid.substring(0, 4) + " " + courseid.substring(4))
                        if (condiA) rx.attr[a] = rx.attr[a].replaceAll(xcourseid.substring(0, 4) + " " + xcourseid.substring(4), " . ")
                    }
                }
            })
        })
    })
}

pkg = {}
if (willmodifydiff) pkg["diffs"] = xdiffs
if (willmodifyextraattr) pkg["extraattr"] = xextraattr

post("http://127.0.0.1:7002/!setvar/", JSON.stringify(pkg)).then(r => r.json()).then(r => {
    console.log('[courses_cache] cacheing to nodejs server done, used ' + ((new Date()).getTime() - cctm.getTime()) + 'ms')

    if (servar.course_backup_path) {
        setTimeout(exec, 100, `"C:\\Program Files\\7-Zip\\7z.exe" a ` + servar.course_backup_path + ` "` + servar.course_path + `*"`, err => { })
    }
})