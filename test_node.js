const fs = require('fs')

let md = []

fetch("http://127.0.0.1:7002/!getvar/courses").then(r => r.json()).then(r => {
    if (r.status != 200) { console.log("[aigen_uni] getCourses failed, courses 404"); return }
    courses = r.resp
    fetch("http://127.0.0.1:7002/!getvar/sems").then(rs => rs.json()).then(rs => {
        if (rs.status != 200) { console.log("[aigen_uni] getCourses failed, sems 404"); return }
        let sems = rs.resp
        sems.forEach(sem => {
            Object.keys(courses).forEach(dept => {
                console.log(sem, dept)
                if (typeof courses[dept][sem] != "undefined") {
                    Object.keys(courses[dept][sem]).forEach(coursex => {
                        if (!coursex.startsWith("_")) {
                            if (typeof courses[dept][sem][coursex].attr[`CO-REQUISITE`] != "undefined" && !md.includes(courses[dept][sem][coursex].attr[`CO-REQUISITE`])) {
                                md.push(courses[dept][sem][coursex].attr[`CO-REQUISITE`])
                            }
                        }
                    })
                }
            })
        })
        console.log(md)
        fs.writeFileSync("T:\\co-req.json", JSON.stringify(md), "utf-8")
    }).catch(err => {
        console.log("[aigen_uni] getCourses failed")
        console.log(err)
    })
}).catch(err => {
    console.log("[aigen_uni] getCourses failed 2")
    console.log(err)
})