const fs = require('fs')
const post = (url, data) => fetch(url, { method: "POST", headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: data })

const sharedfx = require((!fs.existsSync('./' + __filename.slice(__dirname.length + 1))) ? ('./../sharedfx_node.js') : ('./sharedfx_node.js'))
if (sharedfx.about() != "sharedfx") { throw new Error('bad sharedfx import') }

const cdnPath = "" + sharedfx.envar.cdn_path + `uni_ai\\`
const aiOption = (courseCode, courseDesc) => {
    return JSON.stringify({ "fn_index": 77, "data": ["task(" + courseCode + ")", "(photo),(masterpiece),(4k)," + courseDesc, "(nsfw), (text), (powerpoint), (screenshot), extra fingers, fused fingers, too many fingers, missing fingers, spider, lowres, bad anatomy, bad hands, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, poorly drawn hands, poorly drawn feet, tiling, bad art, mutated, closed eyes, duplicate, morbid, mutilated, tranny, out of frame, extra fingers, mutated hands, poorly drawn face, mutation, deformed, ugly, blurry, bad proportions, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, fused fingers, too many fingers, long neck, noise, noisy, unfinished,", [], 40, "Euler a", false, false, 1, 1, 8, -1, -1, 0, 0, 0, false, 576, 768, false, 0.7, 2, "Latent", 0, 0, 0, [], "None", false, false, "positive", "comma", 0, false, false, "", "Seed", "", "Nothing", "", "Nothing", "", true, false, false, false, 0, { "session_hash": courseCode }] })
}

let courses = {}, sems = [], todo = [], todoIndex = 0, todoCourse = [], failedCourse = []
let startDelay = 1000 * 60 * 60 * 0, breakDelay = 1000 * 10, killTime = 1000 * 60 * 60 * 2.25
console.log(`[aigen_uni] start delay: ` + Math.round(startDelay/1000) + `s, break between each run: ` + Math.round(breakDelay/1000) + `s, run duration: ` + Math.round(killTime/1000) + `s`)
killTime = killTime + (new Date()).getTime() + startDelay

function getCourses(cb) {
    fetch("http://127.0.0.1:7002/!getvar/courses").then(r => r.json()).then(r => {
        if (r.status != 200) { console.log("[aigen_uni] getCourses failed, courses 404"); return }
        courses = r.resp
        fetch("http://127.0.0.1:7002/!getvar/sems").then(rs => rs.json()).then(rs => {
            if (rs.status != 200) { console.log("[aigen_uni] getCourses failed, sems 404"); return }
            sems = rs.resp
            if (cb) cb()
        }).catch(err => {
            console.log("[aigen_uni] getCourses failed")
            console.log(err)
        })
    }).catch(err => {
        console.log("[aigen_uni] getCourses failed")
        console.log(err)
    })
}

function run() {
    if ((new Date()).getTime() > killTime) {
        console.log("[aigen_uni] killTime reached, killing script, queue remaining: " + (todo.length - todoIndex))
        if (failedCourse.length) console.log("[aigen_uni] failed list: " + JSON.stringify(failedCourse))
        return
    }
    
    let course = todo[todoIndex][0], desc = todo[todoIndex][1]
    console.log("[aigen_uni] aigen: " + course)
    post("http://127.0.0.1:7860/run/predict/", aiOption('' + course, '' + desc)).then(r => r.json()).then(r => {
        let newPath = cdnPath + course + ".png"
        fs.renameSync(r.data[0][0].name, newPath)
        console.log("[aigen_uni] done: " + newPath + ", queue remaining: " + (todo.length - todoIndex - 1))
        next()
    }).catch(err => {
        console.log("[aigen_uni] aigen failed: " + course)
        console.log(err)
        failedCourse.push(course)
        next()
    })
}

function next() {
    todoIndex += 1
    if (todo.length >= todoIndex) {
        setTimeout(run, breakDelay)
    } else {
        console.log("[aigen_uni] done all")
    }
    if (failedCourse.length) console.log("[aigen_uni] failed list: " + JSON.stringify(failedCourse))
}

setTimeout(getCourses, startDelay, () => {
    let course = "", desc = ""
    sems.forEach(sem => {
        Object.keys(courses).forEach(dept => {
            if (typeof courses[dept][sem] != "undefined") {
                Object.keys(courses[dept][sem]).forEach(coursex => {
                    if (!coursex.startsWith("_")) {
                        course = coursex.split(" ")[0] + coursex.split(" ")[1]
                        if (!fs.existsSync(cdnPath + course + ".png") && !todoCourse.includes(course)) {
                            desc = "(" + coursex.replace(coursex.split(" - ")[0] + " - ", "").split(" (")[0] + ")"
                            desc += ", " + courses[dept][sem][coursex].attr.DESCRIPTION.replaceAll(`"`, '').replaceAll(`(`, '').replaceAll(`)`, '').replaceAll(`,`, '.')
                            if (typeof courses[dept][sem][coursex].attr[`INTENDED LEARNING OUTCOMES`] != "undefined") {desc += ", " + courses[dept][sem][coursex].attr[`INTENDED LEARNING OUTCOMES`].replaceAll(`"`, '').replaceAll(`(`, '').replaceAll(`)`, '').replaceAll(`,`, '.').replace(`<table style=border:0px;>`,"").replaceAll("<span>","").replaceAll("</span>","").replaceAll("<tbody>","").replaceAll("</tbody>","").replaceAll("</table>","").replaceAll("</tr>","").replaceAll("</td>","").replaceAll("<tr>","").replaceAll("<td>","")}
                            todo.push([course, desc])
                            todoCourse.push(course)
                        }
                    }
                })
            }
        })
    })
    courses = {}; sems = []
    console.log("[aigen_uni] todo queue: " + todo.length)
    if (todo.length) run()
})