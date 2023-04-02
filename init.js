var script1 = document.createElement('script'); script1.src = '/!acc/uniplus.js'; document.head.appendChild(script1);

const bottombarbuttons = [
    'Courses,/course/,course,' + resourceNETpath + 'image/nullicon.png',
    'Instructors,/people/,people,' + resourceNETpath + 'image/nullicon.png',
    'Rooms,/room/,room,' + resourceNETpath + 'image/nullicon.png',
    'About,/about/,about,' + resourceNETpath + 'image/info.png'
]

function getPageHTML_404() {
    return `<meta http-equiv="refresh" content="0;URL=/!404/">`
}

var prev_call = 'none'
function init(path) {

    if (prev_call != path) { //if already initPage page then don't initPage it again

        prev_call = path

        if (path == '/' || path == '') { //home page, nnot decided what to do yet so redir to /course/ ;)
            return `<meta http-equiv="refresh" content="0;URL=/course/">`

        } else if (path.toLowerCase().startsWith("/course/")) { //course page
            return `<div class="unicoursewrap">
            <div id="courses_select_wrp">
                <div class="edge2edge flxb" id="courses_select">
                    <div class="LR_Left">
                        <div class="flx">
                            <h2>Courses</h2>
                            <p5><b><div class="ugpgbox flx">
                                <button id="ugbtn" onclick="studprog = 'ug'; render_courses(window.location.pathname.substring(8), false, true)" title="Undergraduate Courses">UG</button>
                                <button id="pgbtn" onclick="studprog = 'pg'; render_courses(window.location.pathname.substring(8), false, true)" title="Postgraduate Courses">PG</button>
                            </div></b></p5>
                        </div>
                        <div class="box" id="courses_side" style="margin:0.5em 0"></div>
                    </div>
                    <div class="LR_Right box" id="courses_detail"></div>
                </div>
                <div id="wideheadbuffer"></div>
            </div>
            <div id="courses_specific_wrp">
                <div class="courses_specific_close no_widescreen">
                    <button type="button" title="Close" onclick="hideCourseSpecificPage()">
                        <img alt="Close" loading="lazy" style="max-width:3em;max-height:3em" draggable="false" src="https://gafea.net/cdn/image/circle-cross.png">
                    </button>
                </div>
                <div id="courses_specific"></div>
                <div id="wideheadbuffer"></div>
                <div id="divheadbuffer"></div>
            </div>
            </div>` + renderBottomBar('course')

        } else if (path.toLowerCase().startsWith("/people/")) { //people page
            return `<div class="unicoursewrap">
            <div id="courses_select_wrp">
                <div id="people"></div>
                <div id="wideheadbuffer"></div>
            </div>
            <div id="courses_specific_wrp">
                <div class="courses_specific_close no_widescreen">
                    <button type="button" title="Close" onclick="hideCourseSpecificPage()">
                        <img alt="Close" loading="lazy" style="max-width:3em;max-height:3em" draggable="false" src="https://gafea.net/cdn/image/circle-cross.png">
                    </button>
                </div>
                <div id="courses_specific"></div>
                <div id="wideheadbuffer"></div>
                <div id="divheadbuffer"></div>
            </div>
            </div>` + renderBottomBar('people')

        } else if (path.toLowerCase().startsWith("/room/")) { //room page
            return `<div class="unicoursewrap">
            <div id="courses_select_wrp">
                <div id="room"></div>
                <div id="wideheadbuffer"></div>
            </div>
            <div id="courses_specific_wrp">
                <div class="courses_specific_close no_widescreen">
                    <button type="button" title="Close" onclick="hideCourseSpecificPage()">
                        <img alt="Close" loading="lazy" style="max-width:3em;max-height:3em" draggable="false" src="https://gafea.net/cdn/image/circle-cross.png">
                    </button>
                </div>
                <div id="courses_specific"></div>
                <div id="wideheadbuffer"></div>
                <div id="divheadbuffer"></div>
            </div>
            </div>` + renderBottomBar('room')

        } else if (path.toLowerCase().startsWith("/about/")) { //about page
            wasInsideCoursePage = false
            return `<div id="about"><div class="edge2edge_page">
            
            <h2>About</h2>
            <p3><br>
                uni.gafea.net is not affiliated with the Hong Kong University of Science and Technology (HKUST).
            <br>
                This project would not be possible without the <a target="_blank" href="https://w5.ab.ust.hk/wcq/cgi-bin/">HKUST Class Schedule & Quota</a> system, which was first adapted from a student contribution in 2011-12 Fall.
            <br>
                Some of the class data comes from the <a target="_blank" href="https://web.archive.org/">Wayback Machine</a>.
            </p3>

            <br><br><h3>Licenses</h3><div class="box">
            <h4>Chart.js</h4>
            <p3>
                The MIT License (MIT)
            <br><br>
                Copyright (c) 2014-2022 Chart.js Contributors
            <br><br>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
            <br><br>
                The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            <br><br>
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p3>
            </div>

            <br><p3>
                Feature Request/Bug Reports? Find me at <a href="mailto:gafea@icloud.com">gafea@icloud.com</a>.
            </p3>

            </div></div>` + renderBottomBar('about')

        } else if (false && path.startsWith('/!') && !(path === '/!404' || path.startsWith('/!404/'))) { //reserved for api call, invalid for HTML
            let spath = document.createTextNode(path).textContent
            return `<div class="edge2edge_page"><p2><b><i>Did you mean: <a href="` + spath.replace("/!", "/") + `">` + spath.replace("/!", "/") + `</a></i></b><br><br>This is the response of the following API call:<br></p2><code style="font-family: monospace, monospace">` + spath + `</code><br><br><div class="box"><div id="apiresp" style="line-break:anywhere"><div id="d_loading"></div></div></box></div>`

        } else { //404 page
            return getPageHTML_404()

        }

    }

}

var rooms = []
var peoples = []

function exe(path) {

    if (path === 'cleanup') { hideCourseSpecificPage(); return }

    if (path.toLowerCase().startsWith("/course/")) {
        exe_courses(path.substring(8))
    } else if (path.toLowerCase().startsWith("/people/")) {
        html = document.getElementById("people")
        if (peoples.length === 0) {
            fetch("/!people/").then(r => r.json()).then(r => {
                if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
                peoples = r.resp
                exe_people(path.substring(8))
            }).catch(error => {
                console.log(error)
                html.innerHTML = "failed to contact server"
            })
        } else {
            exe_people(path.substring(8))
        }
    } else if (path.toLowerCase().startsWith("/room/")) {
        html = document.getElementById("room")
        if (rooms.length === 0) {
            fetch("/!room/").then(r => r.json()).then(r => {
                if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
                rooms = r.resp
                exe_room(path.substring(6))
            }).catch(error => {
                console.log(error)
                html.innerHTML = "failed to contact server"
            })
        } else {
            exe_room(path.substring(6))
        }
    } else if (path.toLowerCase().startsWith("/about/")) {
        exe_about()
    } else if (false && path.startsWith('/!') && !(path === '/!404' || path.startsWith('/!404/'))) {
        document.getElementById("bottomBar").innerHTML = ""
        fetch(path).then(r => r.json()).then(r => document.getElementById("apiresp").innerText = JSON.stringify(r)).catch(error => document.getElementById("apiresp").innerText = `failed to contact server: \n` + error.message)
    }

    isBootRunning = false
    rendergAds()

}

function exe_about() {
    document.title = "About - uni"
    return
}

const exe_courses = (path) => wait_allSems(render_courses, path, "Courses - uni")
const exe_people = (path) => wait_allSems(render_people, path, "Instructors - uni")
const exe_room = (path) => wait_allSems(render_room, path, "Rooms - uni")

var studprog = "ug"
var listMode = "card"

var allSems = []
var allSemsF = []
var deptx = "ACCT"

function wait_allSems(cb, path, title) {

    document.title = title

    if (allSemsF.length) { allSems = JSON.parse(JSON.stringify(allSemsF)); cb(path); return }

    fetch("/!course/").then(r => r.json()).then(r => {
        if (r.status != 200) { document.getElementById("core").innerHTML = "failed to contact server"; return }
        allSemsF = r.resp
        allSems = JSON.parse(JSON.stringify(allSemsF))
        cb(path)
    }).catch(error => {
        console.log(error)
        document.getElementById("core").innerHTML = "failed to contact server or script crashed"
    })

}

function filterFunction(hideListIfEmpty = false) {
    var input, filter, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("button");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if ((hideListIfEmpty && !filter) || txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

function hideCourseSpecificPage() {
    document.body.style.height = 'auto'
    document.body.style.overflowY = 'auto'
    if (document.getElementById('courses_specific_wrp')) document.getElementById('courses_specific_wrp').style.display = 'none'
    if (wasInsideCoursePage) { 
        history.pushState({ plate: courseSpecificReturnURL }, window.title, courseSpecificReturnURL) 
        document.title = "" + courseSpecificReturnURL.split("/")[3] + " - " + ustTimeToString(courseSpecificReturnURL.split("/")[2]) + " - uni"
    }
}

let alwaysExecSetLoadingStatusImmediately = true
let chartx = ''
let wasInsideCoursePage = false

function render_courses_specific(path, insideCoursePage = false) {
    document.body.style.height = '100vh'
    document.body.style.overflowY = "hidden"
    document.getElementById("courses_specific_wrp").style.display = "block"

    let shtml = document.getElementById("courses_specific")
    shtml.innerHTML = `<br><br><center><div id="d_loading"></div></center>`

    fetch("/!course/" + path).then(r => r.json()).then(r => {
        if (r.status != 200) { shtml.innerHTML = "failed to contact server"; return }

        let html_draft = ""
        Object.keys(r.resp).forEach((course, ix) => {

            wasInsideCoursePage = insideCoursePage
            if (insideCoursePage) {
                if (parseInt(course[5]) > 0 && parseInt(course[5]) < 5 && studprog != "ug") {
                    studprog = "ug"
                    render_courses(path)
                    return
                } else if (parseInt(course[5]) >= 5 && studprog != "pg") {
                    studprog = "pg"
                    render_courses(path)
                    return
                }

                history.pushState({ plate: "/course/" + path }, window.title, "/course/" + path)
                document.title = "" + course.split(" - ")[0] + " - " + ustTimeToString(path.split("/")[0]) + " - uni"
            }

            html_draft += `<div class="edge2edge"><div style="page-break-inside:avoid" id="` + course.split(" ")[0] + course.split(" ")[1] + `">
            <div class="box"><div class="flx"><h4>` + course + `</h4></div><p2>` + r.resp[course].attr.DESCRIPTION + `</p2><br><br>
            <div class="flx" style="justify-content:flex-start;gap:0.5em"><p4>Also offered in: </p4><div id="alsoOfferedIn"><div id="d_loading"></div></div></div></div>`
            let attrHTML = renderCourseAttr(r.resp[course].attr, course)
            if (attrHTML) html_draft += `<div class="box"><h4>📚 Course Attributes</h4>` + attrHTML + `</div>`
            html_draft += `</div>`

            if (typeof r.resp[course].exam != "undefined") {
                html_draft += `<div class="box"><h4>🎓 Exam Schedule</h4><div class="flx" style="justify-content:flex-start">`
                Object.keys(r.resp[course].exam).forEach(key => {
                    html_draft += `<div class="box" style="box-shadow:0 0.5em 1em rgba(0,0,0,.1);border:0.1em solid rgba(128,128,128,.2);padding-top:0.85em">
                    <div style="border-bottom:0.1em dotted #888;padding-bottom:0.25em;margin-bottom:0.5em">
                    <h4>` + key + `</h4></div><div><p2>`
                    if (typeof r.resp[course].exam[key].Remarks != "undefined") {
                        if (r.resp[course].exam[key].Remarks == "No Final Exam") {
                            html_draft += "❌ No Final Exam"
                        } else {
                            html_draft += JSON.stringify(r.resp[course].exam[key])
                        }
                    } else {
                        html_draft += JSON.stringify(r.resp[course].exam[key])
                    }
                    html_draft += `</p2></div></div>`
                })
                html_draft += `</div></div>`
            }

            if (parseInt(path.split("/")[0]) >= 2230) html_draft += `<div class="box"><div id="charts"><h4>📈 Enrollment History</h4></div></div>`

            let htmls = { lec: [], lab: [], tut: [], rsh: [], otr: [] }

            Object.keys(r.resp[course].section).forEach(sectionName => {
                let attrs = JSON.parse(JSON.stringify(r.resp[course].section[sectionName][Object.keys(r.resp[course].section[sectionName])[0]]))
                let htmlsd = `<div class="dpv_ytemb lessonbox"><h4>` + sectionName + `</h4>`

                if (typeof attrs["Remarks"] != "undefined") {
                    htmlsd += "<p2>Remarks: " + attrs["Remarks"] + "</p2><br><br>"
                    delete attrs["Remarks"]
                }

                //not needed if dynrender
                delete attrs["Section"]
                delete attrs["Date & Time"]
                delete attrs["Room"]
                delete attrs["Instructor"]
                //

                htmlsd += JSON.stringify(attrs) + `<br>`
                let resp = {}
                Object.keys(r.resp[course].section[sectionName]).forEach(time => {
                    resp[time] = { Room: r.resp[course].section[sectionName][time].Room, Instructor: r.resp[course].section[sectionName][time].Instructor }
                })
                htmlsd += `` + renderTimetableGrid(resp, "courseDetail") + `</div>`

                htmls[lessonToType(sectionName)].push(htmlsd)
            })

            html_draft += `</div>`
            Object.keys(htmls).forEach(type => {
                if (htmls[type].length) {
                    html_draft += `<div class="edge2edge flx" style="justify-content:flex-start"><h3>` + type + `</h3><h5><span class="uniroomweek" style="border:0.15em solid rgba(128,128,128,.5)">` + htmls[type].length + `</span></h5></div></div><div class="flx edge2edge dpv_carrier" style="padding-top:0!important" id="` + type + `">`
                    htmls[type].forEach(h => html_draft += h)
                    html_draft += `</div>`
                }
            })

            html_draft += `<style>#courses_specific .uniroomtime{display:none} #courses_specific .uniroomweek{position:unset;margin-top:1em} #courses_specific .uniroomgrid{display:block}</style></div>`
        
            fetch("/!insem/" + course.split(" ")[0] + course.split(" ")[1] + "/").then(r => r.json()).then(u => {
                if (u.status != 200) { document.getElementById("alsoOfferedIn").innerHTML = "failed to contact server or script crashed"; return }
    
                u.resp.sort()
                u.resp.reverse()
                let draft = `<select style="width:100%" name="timeidx" id="timeidx" title="Select Semester" onchange="render_courses_specific('' + document.getElementById('timeidx').value + '/' + '` + course.split(" ")[0] + `' + '/' + '` + course.split(" ")[0] + course.split(" ")[1] + `' + '/', ` + insideCoursePage + `)">`
                let prevSem = "----"
                u.resp.forEach(sem => {
                    let thisSem = ustTimeToString(sem)
                    if (thisSem.split(" ")[0] != prevSem) {
                        if (prevSem != '----') draft += `</optgroup>`
                        draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
                        prevSem = thisSem.split(" ")[0]
                    }
                    draft += `<option value="` + sem + `"`
                    if (sem == path.split("/")[0]) {
                        draft += " selected"
                    }
                    draft += `>` + ustTimeToString(sem) + `</option>`
                })
                draft += `</optgroup></select>`
    
                document.getElementById("alsoOfferedIn").innerHTML = draft
            }).catch(error => {
                console.log(error)
                document.getElementById("alsoOfferedIn").innerHTML = "failed to contact server or script crashed"
            })
        })

        shtml.innerHTML = html_draft

        if (parseInt(path.split("/")[0]) >= 2230) {
            fetch("/!diff/" + path.split('/')[2].toUpperCase() + "/" + ((path.split("/")[0] != allSemsF[0]) ? ("" + path.split("/")[0] + "/") : "")).then(r => r.json()).then(rChart => {
                if (rChart.status != 200) { document.getElementById("charts").innerHTML = "failed to contact server or script crashed"; return }

                document.getElementById("charts").innerHTML += `<div class="chart-container"><canvas id="chart"></canvas></div>`

                let options = chartOptions(rChart.resp.t)
                rChart.resp.t.forEach((tx, i) => rChart.resp.t[i] = new Date(parseInt(tx)).toLocaleString());

                let chx = new Chart(
                    document.getElementById('chart'),
                    {
                        type: 'line',
                        options: options,
                        data: {
                            labels: rChart.resp.t,
                            datasets: rChart.resp.p
                        },
                    }
                )

            }).catch(error => {
                console.log(error)
                document.getElementById("charts").innerHTML = "failed to contact server or script crashed"
            })
        }
    }).catch(error => {
        console.log(error)
        shtml.innerHTML = "failed to contact server or script crashed"
    })
}

let courseSpecificReturnURL = ''

function render_courses_details(path, scrollIntoView = false) {
    courseSpecificReturnURL = "/course/" + path.slice(0, path.lastIndexOf("/") + 1)
    document.getElementById("courses_detail").innerHTML = renderTopBar(path.split("/")[1], ustTimeToString(path.split("/")[0]), "", false, "", !!(path.split("/")[2])) + `<style>.topbar{z-index:9999!important} @media (min-width: 1280px) {.topbar{padding: max(calc(env(safe-area-inset-top) + 0.5em), 2em) max(calc(env(safe-area-inset-right) + 0.5em), calc(16px + 1em)) calc( 0.5em - 0.08em ) max(calc(env(safe-area-inset-left) + 0.5em), calc(16px + 1em))}}</style><div id="courses_detail_content"></div>`
    html = document.getElementById("courses_detail_content")
    let withinCourseListPage = (path.split('/').length == 2 || (path.split('/').length == 3 && path.split('/')[2] == ""))
    let withinCourseDetailPage = false
    if (!withinCourseListPage) withinCourseDetailPage = (path.split('/').length == 3 || (path.split('/').length == 4 && path.split('/')[3] == ""))
    if (withinCourseDetailPage) {
        render_courses_specific(path, true)
        if (path.endsWith("/")) path = path.slice(0, path.length - 1)
        render_courses_details(path.slice(0, path.lastIndexOf("/") + 1))
        return
    }

    fetch("/!course/" + path).then(r => r.json()).then(r => {
        setLoadingStatus("hide")
        if (r.status != 200) { html.innerHTML = "failed to contact server"; return }

        let html_draft = `<style>.uniroomtime{display:none} .uniroomweek{position:unset;margin-top:1em} .uniroomgrid{display:block} .LR_Right{background:none}</style><br><div class="flx"><br><div class="flx" style="gap:0.5em"><p4>View Mode: </p4>`
        if (listMode === "card") {
            html_draft += `<p5><b><div class="ugpgbox flx">
                <button id="cardbtn" style="background:rgba(64,160,255,.4);cursor:default" title="Card View">📇</button>
                <button id="detailbtn" style="background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="listMode = 'detail'; render_courses(window.location.pathname.substring(8), true, true)" title="Detail View">🧾</button>
                </div></b></p5></div></div><div class="flx" style="margin-top:0.5em">`
        } else {
            html_draft += `<p5><b><div class="ugpgbox flx">
                <button id="cardbtn" style="background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="listMode = 'card'; render_courses(window.location.pathname.substring(8), true, true)" title="Card View">📇</button>
                <button id="detailbtn" style="background:rgba(64,160,255,.4);cursor:default" title="Detail View">🧾</button>
                </div></b></p5></div></div>`
        }
        Object.keys(r.resp).forEach((course, ix) => {
            if ((studprog === "ug" && parseInt(course[5]) > 0 && parseInt(course[5]) < 5) || (studprog === "pg" && parseInt(course[5]) >= 5)) {
                if (listMode === "card") {
                    html_draft += `<div style="padding:0;page-break-inside:avoid;background-image:url(` + ((course.split(" ")[0] == "COMP" && course.split(" ")[1] == "3511") ? (`https://ia601705.us.archive.org/16/items/windows-xp-bliss-wallpaper/windows-xp-bliss-4k-lu-1920x1080.jpg`) : (resourceNETpath + `uni_ai/` + course.split(" ")[0] + course.split(" ")[1] + `.png`)) + `)" id="` + course.split(" ")[0] + course.split(" ")[1] + `" class="course_sel selbox picbox" onclick="render_courses_specific('` + path.split('/')[0] + "/" + path.split('/')[1] + "/" + course.split(" ")[0] + course.split(" ")[1] + `/', true)" title="` + course.replaceAll('>', "").replaceAll('<', "").replaceAll('"', "'") + "\n\n" + r.resp[course].attr.DESCRIPTION.replaceAll('>', "").replaceAll('<', "").replaceAll('"', "'") + `"><div class="picbox_inner flx">
                    <div class="picbox_inner_up"><h5 style="opacity:0.85">` + ((typeof r.resp[course].attr["VECTOR"] === "undefined") ? course.split(" (")[1].split(")")[0] : r.resp[course].attr["VECTOR"]) + `</h5></div>
                    <div><h4>` + course.split(" (")[0].split(" - ")[0] + `</h4><h5>` + course.split(" (")[0].replace(course.split(" (")[0].split(" - ")[0] + " - ", "") + `</h5></div></div></div>`
                } else {
                    html_draft += `<div style="margin:1em 0.5em"><div style="page-break-inside:avoid" id="` + course.split(" ")[0] + course.split(" ")[1] + `" class="selbox" onclick="render_courses_specific('` + path.split('/')[0] + "/" + path.split('/')[1] + "/" + course.split(" ")[0] + course.split(" ")[1] + `/', true)"><div><div><h4>` + course + `</h4><p2 class="no_mobile">` + r.resp[course].attr.DESCRIPTION + `</p2></div>
                    <div class="no_mobile">` + renderCourseAttr(r.resp[course].attr, course) + `</div></div></div></div>`
                }
            }
        })

        if (listMode === "card") html_draft += `</div><div style="padding:0.5em 1em"><p3>The above pictures were generated using AI for illustration purposes only. It does not represent the actual course contents and/or learning outcomes.</p3></div>`
        html.innerHTML = html_draft

        if (scrollIntoView) { if ((Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) <= 520)) { document.getElementById("courses_detail").scrollIntoView() } else { document.body.scrollIntoView() } }

    }).catch(error => {
        console.log(error)
        html.innerHTML = "failed to contact server or script crashed"
    })
}

function render_courses(path, scrollIntoView = false, doNotCheckUGPG = false) {

    render_UGPG_switch()
    hideCourseSpecificPage()

    html = document.getElementById("courses_side")
    let semx = ((ustTimeToString(decodeURI(path.split("/")[0])) != '----') ? decodeURI(path.split("/")[0]) : allSems[0])
    let html_draft = `<select style="width:100%" name="timeid" id="timeid" title="Select Semester" onchange="render_courses('' + document.getElementById('timeid').value + '/' + deptx + '/')">`
    let prevSem = "----"
    allSemsF.forEach(sem => {
        let thisSem = ustTimeToString(sem)
        if (thisSem.split(" ")[0] != prevSem) {
            if (prevSem != '----') html_draft += `</optgroup>`
            html_draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
            prevSem = thisSem.split(" ")[0]
        }
        html_draft += `<option value="` + sem + `"`
        if (sem == semx) {
            document.title = "" + ustTimeToString(sem) + " - uni"
            html_draft += " selected"
        }
        html_draft += `>` + ustTimeToString(sem) + `</option>`
    })
    html_draft += `</optgroup></select>`

    if (parseInt(semx) > parseInt(allSems[0])) {
        alert('i hope i can know what courses would exist in the future too 👀')
        setTimeout(() => { boot("/") }, 1)
        return
    }

    fetch("/!course/" + semx + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { document.getElementById("core").innerHTML = "failed to contact server"; return }

        let depts = r.resp.both
        if (typeof r.resp[studprog] != "undefined") depts = depts.concat(r.resp[studprog])
        depts.sort()

        if (path.split("/").length > 1 && path.split("/")[1]) {
            let tdeptx = decodeURI(path.split("/")[1])
            if (depts.includes(tdeptx)) {
                deptx = tdeptx
            } else {
                if (doNotCheckUGPG) {
                    deptx = depts[0]
                } else {
                    if (studprog === "ug" && r.resp["pg"].includes(tdeptx)) {
                        studprog = "pg"
                        render_courses(path, scrollIntoView, true)
                        return
                    } else if (studprog === "pg" && r.resp["ug"].includes(tdeptx)) {
                        studprog = "ug"
                        render_courses(path, scrollIntoView, true)
                        return
                    } else {
                        deptx = depts[0]
                    }
                }
            }
        } else {
            deptx = depts[0]
        }

        let coursex = ((path.split("/").length > 2 && path.split("/")[2]) ? decodeURI(path) : "" + semx + "/" + deptx + "/")

        html_draft += `<div id="myDropdown" class="flx"><input type="text" placeholder="Filter..." id="myInput" onkeyup="filterFunction()">`
        depts.forEach(dept => {
            html_draft += `<button onclick="render_courses('' + document.getElementById('timeid').value + '/` + dept + `/', true)"`
            if (dept == deptx) {
                document.title = "" + deptx + " - " + ustTimeToString(semx) + " - uni"
                history.replaceState(null, window.title, "/course/" + semx + "/" + deptx + "/")
                html_draft += ` style="background:rgba(255,255,0,.4)"`
            }
            html_draft += `>` + dept + `</button>`
        })
        html_draft += `</div>`

        html.innerHTML = html_draft

        render_courses_details(coursex, scrollIntoView)

    }).catch(error => {
        console.log(error)
        document.getElementById("core").innerHTML = "failed to contact server or script crashed"
    })

}

function render_UGPG_switch() {
    let ugbtn = document.getElementById("ugbtn").style
    ugbtn.background = ((studprog === "ug") ? "rgba(64,255,160,.4)" : "var(--gbw)")
    ugbtn.cursor = ((studprog === "ug") ? "default" : "pointer")
    ugbtn.pointerEvents = ((studprog === "ug") ? "none" : "unset")

    let pgbtn = document.getElementById("pgbtn").style
    pgbtn.background = ((studprog === "pg") ? "rgba(192,64,255,.5)" : "var(--gbw)")
    pgbtn.cursor = ((studprog === "pg") ? "default" : "pointer")
    pgbtn.pointerEvents = ((studprog === "pg") ? "none" : "unset")
}

var peoplex = "LAM, Gibson"

function render_people(path) {

    hideCourseSpecificPage()

    let html_draft = `<div class="card" style="padding:1em;padding-top:0.5em" id="card3"><div style="margin:env(safe-area-inset-top) env(safe-area-inset-right) 0 env(safe-area-inset-left)"><div class="flxb"><div id="iR1"><div style="pointer-events:all">
        <h2>Instructors</h2><div class="box flx" style="justify-content:center;gap:0.5em;margin:0.5em 0">`
    let path_hv_people_match = false
    let target_people = "LAM, Gibson"
    html = document.getElementById("people")

    let hdraft = ""
    peoples.forEach(people => {
        hdraft += `<button onclick="peoplex='` + people + `';render_people('` + people + `/' + document.getElementById('timeid').value + '/')" style="display:none;`
        if (decodeURI(path.split("/")[0]) != "" && people === decodeURI(path.split("/")[0])) {
            target_people = decodeURI(path.split("/")[0])
            document.title = "" + target_people + " - uni"
            hdraft += ` background:rgba(255,255,0,.4)`
            path_hv_people_match = true
        }
        hdraft += `">` + people + `</button>`
    })
    hdraft += `</div>`
    if (!path_hv_people_match) {
        hdraft = hdraft.replace(`<option value="LAM, Gibson">`, `<option value="LAM, Gibson" selected>`)
        document.title = "LAM, Gibson - uni"
    }
    html_draft += `<div id="myDropdown" class="flx" style="flex-grow:1"><input type="text" placeholder="Search.." id="myInput" onclick="this.select()" onkeyup="filterFunction(true)" value="` + target_people + `">` + hdraft + `</select>`

    fetch("/!people/" + target_people + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
        let peopleAvilSems = r.resp

        let skippeopleRestriction = true
        let maxSem = Math.max(parseInt(allSems[0]), parseInt(peopleAvilSems[0]))
        let peopleMinSem = ((signinlevel === 0) ? (parseInt(allSems[0]) - 99) : 2000)
        let target_time = ((peopleAvilSems.includes(allSems[0])) ? allSems[0] : peopleAvilSems[0])
        if (peopleAvilSems.filter(n => parseInt(n) > peopleMinSem).length === 0) skippeopleRestriction = true
        if (skippeopleRestriction) {
            allSems = allSems.filter(n => parseInt(n) > 2000)
        } else {
            allSems = peopleAvilSems.filter(n => parseInt(n) > peopleMinSem)
        }
        html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="exe('/people/' + peoplex + '/' + document.getElementById('timeid').value + '/')">`
        if (path.split("/")[1] && ((!skippeopleRestriction && parseInt(decodeURI(path.split("/")[1])) < peopleMinSem) || ustTimeToString(decodeURI(path.split("/")[1])) === '----')) {
            html_draft += `<option value="1009" selected disabled hidden>` + ustTimeToString(decodeURI(path.split("/")[1])) + `</option>`
            history.replaceState(null, window.title, "/people/" + target_people + "/" + decodeURI(path.split("/")[1]) + "/")
            target_time = decodeURI(path.split("/")[1])
        } else if (path.split("/")[1] && !allSems.includes(decodeURI(path.split("/")[1]))) {
            allSems.push(decodeURI(path.split("/")[1]))
            allSems.sort()
            allSems.reverse()
        } else if (!path.split("/")[1]) {
            history.replaceState(null, window.title, "/people/" + target_people + "/" + target_time + "/")
        }
        let prevSem = '----'
        let noSigninAdDisplayed = (signinlevel === 0)
        allSems.every((time, index) => {
            if (!peopleAvilSems.includes(time) && time != decodeURI(path.split("/")[1])) return true
            let thisSem = ustTimeToString(time)
            if (thisSem.split(" ")[0] != prevSem) {
                if (prevSem != '----') html_draft += `</optgroup>`
                html_draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
                prevSem = thisSem.split(" ")[0]
            }
            if (noSigninAdDisplayed && (signinlevel === 0) && time < peopleMinSem) { html_draft += `<option disabled>↓ Signin Required ↓</option>`; noSigninAdDisplayed = false }
            html_draft += `<option value="` + time + `"`
            if (!peopleAvilSems.includes(time)) {
                html_draft += " disabled"
            }
            if (typeof decodeURI(path.split("/")[1]) != "undefined" && parseInt(decodeURI(path.split("/")[1])) > 1009) {
                if (time === decodeURI(path.split("/")[1])) {
                    html_draft += " selected"
                    history.replaceState(null, window.title, "/people/" + target_people + "/" + time + "/")
                    target_time = time
                }
            } else {
                if (index === 0) {
                    html_draft += " selected"
                    history.replaceState(null, window.title, "/people/" + target_people + "/" + time + "/")
                    target_time = time
                }
            }
            html_draft += `>` + thisSem + `</option>`
            return true
        })
        html_draft += `</optgroup></select></div>` + gAdsScript + `</div></div><div id="iL1">
                <div id="peopleinfo"><center><div id="d_loading"></div></center></div></div></div></div>`

        html.innerHTML = html_draft
        html = document.getElementById("peopleinfo")
        html_draft = ""

        if (ustTimeToString(target_time) === '----') { html.innerHTML = `the url is not in a valid format`; return }
        if (parseInt(target_time) > maxSem) { html.innerHTML = `i hope i can know what courses would exist in the future too 👀`; return }
        if (signinlevel === 0 && parseInt(target_time) < peopleMinSem && parseInt(target_time) > 1200) { html.innerHTML = `<a href="https://me.gafea.net/">sign in</a> now to get access to this page`; return }
        if ((!skippeopleRestriction && parseInt(target_time) < peopleMinSem) || parseInt(target_time) < 1200) { html.innerHTML = `we don't have data for semesters that are too old :(`; return }

        fetch("/!people/" + target_people + "/" + target_time + "/").then(r => r.json()).then(r => {
            if (r.status === 404) { html.innerHTML = `there are no lessons in this semester`; return }
            if (r.status != 200 && r.status != 404) { html.innerHTML = "failed to contact server"; return }

            html_draft = ''
            if (skippeopleRestriction && target_time < 2200) html_draft += `<p2>this might not be the full list since we only started collecting data extensively from 2022-23 :(</p2><br><br>`
            html_draft += renderTimetableGrid(r.resp, "people", target_time)

            html.innerHTML = html_draft

        }).catch(error => {
            console.log(error)
            html.innerHTML = "failed to contact server or script crashed"
        })

    }).catch(error => {
        console.log(error)
        html.innerHTML = "failed to contact server or script crashed"
    })

}

function render_room(path) {

    hideCourseSpecificPage()

    let html_draft = `<div class="card" style="padding:1em;padding-top:0.5em" id="card3"><div style="margin:env(safe-area-inset-top) env(safe-area-inset-right) 0 env(safe-area-inset-left)"><div class="flxb"><div id="iR1"><div style="pointer-events:all">
    <h2>Rooms</h2><div class="box flx" style="justify-content:center;gap:0.5em;margin:0.5em 0"><select name="roomid" id="roomid" title="Select Room" onchange="exe('/room/' + document.getElementById('roomid').value + '/' + document.getElementById('timeid').value + '/')">`
    let path_hv_room_match = false
    let target_room = "LTA"
    rooms.forEach(room => {
        html_draft += `<option value="` + room + `"`
        if (decodeURI(path.split("/")[0]) != "" && room === decodeURI(path.split("/")[0])) {
            target_room = decodeURI(path.split("/")[0])
            document.title = "" + target_room + " - uni"
            html_draft += " selected"
            path_hv_room_match = true
        }
        html_draft += `>` + room + `</option>`
    })
    if (!path_hv_room_match) {
        html_draft = html_draft.replace(`<option value="LTA">`, `<option value="LTA" selected>`)
        document.title = "LTA - uni"
    }
    html_draft += `</select>`

    fetch("/!room/" + target_room + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
        let roomAvilSems = r.resp

        let skipRoomRestriction = true
        let maxSem = Math.max(parseInt(allSems[0]), parseInt(roomAvilSems[0]))
        let roomMinSem = ((signinlevel === 0) ? (parseInt(allSems[0]) - 99) : 2000)
        let target_time = ((roomAvilSems.includes(allSems[0])) ? allSems[0] : roomAvilSems[0])
        if (roomAvilSems.filter(n => parseInt(n) > roomMinSem).length === 0) skipRoomRestriction = true
        if (skipRoomRestriction) {
            allSems = allSems.filter(n => parseInt(n) > 2000)
        } else {
            allSems = roomAvilSems.filter(n => parseInt(n) > roomMinSem)
        }
        html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="exe('/room/' + document.getElementById('roomid').value + '/' + document.getElementById('timeid').value + '/')">`
        if (path.split("/")[1] && ((!skipRoomRestriction && parseInt(decodeURI(path.split("/")[1])) < roomMinSem) || ustTimeToString(decodeURI(path.split("/")[1])) === '----')) {
            html_draft += `<option value="1009" selected disabled hidden>` + ustTimeToString(decodeURI(path.split("/")[1])) + `</option>`
            history.replaceState(null, window.title, "/room/" + target_room + "/" + decodeURI(path.split("/")[1]) + "/")
            target_time = decodeURI(path.split("/")[1])
        } else if (path.split("/")[1] && !allSems.includes(decodeURI(path.split("/")[1]))) {
            allSems.push(decodeURI(path.split("/")[1]))
            allSems.sort()
            allSems.reverse()
        } else if (!path.split("/")[1]) {
            history.replaceState(null, window.title, "/room/" + target_room + "/" + target_time + "/")
        }
        let prevSem = '----'
        let noSigninAdDisplayed = (signinlevel === 0)
        allSems.every((time, index) => {
            if (!roomAvilSems.includes(time) && time != decodeURI(path.split("/")[1])) return true
            let thisSem = ustTimeToString(time)
            if (thisSem.split(" ")[0] != prevSem) {
                if (prevSem != '----') html_draft += `</optgroup>`
                html_draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
                prevSem = thisSem.split(" ")[0]
            }
            if (noSigninAdDisplayed && (signinlevel === 0) && time < roomMinSem) { html_draft += `<option disabled>↓ Signin Required ↓</option>`; noSigninAdDisplayed = false }
            html_draft += `<option value="` + time + `"`
            if (!roomAvilSems.includes(time)) {
                html_draft += " disabled"
            }
            if (typeof decodeURI(path.split("/")[1]) != "undefined" && parseInt(decodeURI(path.split("/")[1])) > 1009) {
                if (time === decodeURI(path.split("/")[1])) {
                    html_draft += " selected"
                    history.replaceState(null, window.title, "/room/" + target_room + "/" + time + "/")
                    target_time = time
                }
            } else {
                if (index === 0) {
                    html_draft += " selected"
                    history.replaceState(null, window.title, "/room/" + target_room + "/" + time + "/")
                    target_time = time
                }
            }
            html_draft += `>` + thisSem + `</option>`
            return true
        })
        html_draft += `</optgroup></select></div>` + gAdsScript + `</div></div><div id="iL1">
            <div id="roominfo"><center><div id="d_loading"></div></center></div></div></div></div>`

        html.innerHTML = html_draft
        html = document.getElementById("roominfo")
        html_draft = ""

        if (ustTimeToString(target_time) === '----') { html.innerHTML = `the url is not in a valid format`; return }
        if (parseInt(target_time) > maxSem) { html.innerHTML = `i hope i can know what courses would exist in the future too 👀`; return }
        if (signinlevel === 0 && parseInt(target_time) < roomMinSem && parseInt(target_time) > 1200) { html.innerHTML = `<a href="https://me.gafea.net/">sign in</a> now to get access to this page`; return }
        if ((!skipRoomRestriction && parseInt(target_time) < roomMinSem) || parseInt(target_time) < 1200) { html.innerHTML = `we don't have data for semesters that are too old :(`; return }

        fetch("/!room/" + target_room + "/" + target_time + "/").then(r => r.json()).then(r => {
            if (r.status === 404) { html.innerHTML = `there are no lessons in this semester`; return }
            if (r.status != 200 && r.status != 404) { html.innerHTML = "failed to contact server"; return }

            html_draft = ''
            if (skipRoomRestriction && target_time < 2200) html_draft += `<p2>this might not be the full list since we only started collecting data extensively from 2022-23 :(</p2><br><br>`
            html_draft += renderTimetableGrid(r.resp, "room", target_time)

            html.innerHTML = html_draft

        }).catch(error => {
            console.log(error)
            html.innerHTML = "failed to contact server or script crashed"
        })

    }).catch(error => {
        console.log(error)
        html.innerHTML = "failed to contact server or script crashed"
    })

}

const chartOptions = (timeRange) => {
    let options = {
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'xy'
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time of Snapshot'
                },
                ticks: {
                    display: false
                },
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Enrollment Percentage (%)'
                }
            }
        },
        layout: {
            padding: 4
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + "%";
                        }
                        return label;
                    }
                }
            },
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 100,
                        yMax: 100,
                        borderColor: 'rgb(128,128,128)',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        drawTime: 'beforeDatasetsDraw',
                    }
                }
            }
        }
    }

    let timeNow = timeRange[0]
    let lastTime = timeRange[timeRange.length - 1]
    let i = 0, startMissing = ((timeNow + 8 * 60 * 60 * 1000) % (24 * 60 * 60 * 1000)) / (20 * 60 * 1000)

    while (timeNow < lastTime) {
        options.plugins.annotation.annotations["box" + i] = { type: 'box', xMin: i * 24 * 3 - startMissing + 24 * 3 - ((i) ? 2 : 0), xMax: i * 24 * 3 - startMissing + 24 * 3 * 2 - ((i) ? 2 : 1), backgroundColor: 'rgba(128,128,128,0.05)', borderWidth: 0, drawTime: 'beforeDatasetsDraw' }
        i += 2; timeNow += 2 * 24 * 60 * 60 * 1000
    }
    //console.log(options)

    return options
}

const renderCourseAttr = (attrs, course) => {
    let html_draft = ``
    Object.keys(attrs).forEach(attr => {
        if (attr != "DESCRIPTION") {
            if (attr === "INTENDED LEARNING OUTCOMES") { html_draft += `</div><div>` }
            html_draft += `<div style="margin:0.5em;border-radius:0.5em;padding:0.5em;padding-top:0.25em;border:0.1em solid rgba(128,128,128,.3)"><div style="padding:0.25em 0em;border-bottom:0.1em dotted #888;margin-bottom:0.25em"><p4>`
            switch (attr) {
                case "MATCHING":
                    html_draft += "⛓️ Matching"
                    break

                case "ATTRIBUTES":
                    html_draft += "ℹ️ Attr"
                    break

                case "PRE-REQUISITE":
                    html_draft += "⚠️ Pre-req"
                    break

                case "CO-REQUISITE":
                    html_draft += "➕ Co-req"
                    break

                case "EXCLUSION":
                    html_draft += "❌ Excl"
                    break

                case "CO-LIST WITH":
                    html_draft += "🔗 Co-list"
                    break

                case "PREVIOUS CODE":
                    html_draft += "⬅️ Prev code"
                    break

                case "ALTERNATE CODE(S)":
                    html_draft += "↔️ Alt code"
                    break

                case "INTENDED LEARNING OUTCOMES":
                    html_draft += "📖 Intended Learning Outcomes"
                    break

                case "VECTOR":
                    html_draft += "ℹ️ Vector"
                    break

                default:
                    html_draft += "[" + attr + "]"
                    break
            }
            html_draft += '</p4></div><div><p2>' + attrs[attr]
            if (attr === "VECTOR") {
                let v = attrs[attr].replace("[", "").replace("]", "")
                if ((new RegExp(/\d[-]\d[-]\d[:]\d/gm)).test(v)) {
                    html_draft += `<br><br><b>` + v.split(":")[0].split("-")[0] + `</b> Lecture hours per week<br>
                                    <b>` + v.split(":")[0].split("-")[1] + `</b> Tutorial, seminar or recitation hours per week<br>
                                    <b>` + v.split(":")[0].split("-")[2] + `</b> Laboratory or field study hours per week<br>          
                                    <b>` + v.split(":")[1] + `</b> Course credits`
                }
            } else if ((attr === "PREVIOUS CODE" || attr === "ALTERNATE CODE(S)") && course.toUpperCase().startsWith("CORE")) {
                html_draft += `<br><br><a target="_blank" href="https://ust.space/review/` + attrs[attr].replace(" ", "") + `">try check ustspace</a>`

            }
            html_draft += "</p2></div></div>"
        }
    })
    return ((html_draft) ? (`<div class="flx" style="justify-content:flex-start">` + html_draft + `</div>`) : "")
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

const lessonToType = lesson => {
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

const ustTimeToMinute = (time) => {
    let hour = parseInt(time.split(":")[0])
    let minute = parseInt(time.split(":")[1].substring(0, 2))
    if (time.split(":")[1][2] === "P" && hour != 12) hour += 12
    return [(hour * 60 + minute), "" + zeroPad(hour, 2) + ":" + zeroPad(minute, 2)]
}

const ustTimeToString = (time) => {
    if (!(time.length === 4 && time[3] === "0" && parseInt(time) > 1009 && parseInt(time) < 9900 && parseInt(time) % 100 < 41)) return "----"
    let string = `20` + time.substring(0, 2) + "-" + (parseInt(time.substring(0, 2)) + 1) + " "
    switch (time[2]) {
        case "1":
            string += "Fall"
            break
        case "2":
            string += "Winter"
            break
        case "3":
            string += "Spring"
            break
        case "4":
            string += "Summer"
            break
        default:
            break
    }
    return string
}

function renderTimetableGrid(resp, type, target_time = 0) {
    let html_draft = `<div class="uniroomgrid">`
    let sday = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    let sfday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    let days = { Mo: [], Tu: [], We: [], Th: [], Fr: [], Sa: [], Su: [], Other: [] }
    Object.keys(resp).forEach(key => {
        resp[key]["date"] = key
        if (type == "people" && key == "TBA") {
            days.Other.push(...resp["TBA"])
        } else if (!sday.includes(key.substring(0, 2))) {
            days.Other.push(resp[key])
        } else {
            sday.forEach(day => {
                if (key.includes(day)) days[day].push(resp[key])
            })
        }
    })
    let minStartTime = 0, maxEndTime = 0, minWeekStartTime = -1, haveWeekRendered = false
    sday.forEach((day) => {
        if (days[day].length > 0) {
            days[day].forEach(lesson => {
                let startTime = ustTimeToMinute(lesson.date.split(" ")[1])[0]
                let endTime = ustTimeToMinute(lesson.date.split(" ")[3])[0]
                if (!minStartTime || startTime < minStartTime) minStartTime = startTime
                if (!maxEndTime || endTime > maxEndTime) maxEndTime = endTime
            })
        }
    })
    minStartTime -= minStartTime % 60
    let textTime = minStartTime
    if (maxEndTime) {
        while (textTime <= maxEndTime) {
            html_draft += `<p5 class="uniroomtime" style="
                grid-row-start: ` + ((textTime - minStartTime) / 10 + 2) + `;
                grid-row-end: ` + ((textTime - minStartTime) / 10 + 3) + `;
                grid-column-start: 1;
                grid-column-end: 2;
                ">` + Math.floor(textTime / 60) + ":" + zeroPad(textTime % 60, 2) + `</p5>`
            textTime += 60
        }
        html_draft += `<p5 class="uniroomtime" style="
                grid-row-start: ` + ((textTime - minStartTime) / 10 + 2) + `;
                grid-row-end: ` + ((textTime - minStartTime) / 10 + 3) + `;
                grid-column-start: 1;
                grid-column-end: 2;
                ">` + (Math.floor(textTime / 60) % 24) + ":" + zeroPad(textTime % 60, 2) + `</p5>`
    }
    sday.forEach((day, index) => {
        if (days[day].length > 0) {
            haveWeekRendered = true
            html_draft += `<div class="uniroomweek" style="
                grid-row-start: 1;
                grid-row-end: 2;
                grid-column-start: ` + (index - minWeekStartTime + 1) + `;
                grid-column-end: ` + (index - minWeekStartTime + 2) + `;">
                <h3 style="font-size:1.25em;border-bottom:0em dotted rgba(128,128,128,.5)">` + sday[index] + `<span>` + sfday[index].slice(2) + `</span></h3></div>`
            let dayList = []
            days[day].forEach(lesson => {
                dayList.push("" + zeroPad(ustTimeToMinute(lesson.date.split(" ")[1])[0], 4) + JSON.stringify(lesson))
            })
            dayList.sort()
            dayList.forEach(lesson => {
                lesson = JSON.parse(lesson.slice(4))
                let startTime = ustTimeToMinute(lesson.date.split(" ")[1])
                let endTime = ustTimeToMinute(lesson.date.split(" ")[3])
                html_draft += `<div class="`
                if (type == "room" || type == "people") {
                    html_draft += `selbox" style="cursor:pointer;`
                } else {
                    html_draft += `box" style="width:fit-content;box-shadow:0 0.5em 1em rgba(0,0,0,.1);`
                }
                html_draft += `padding:1.25em;margin:0.25em;
                    grid-row-start: ` + (((startTime[0] - minStartTime) / 10) + 2) + `;
                    grid-row-end: ` + (((endTime[0] - minStartTime) / 10) + 2) + `;
                    grid-column-start: ` + (index - minWeekStartTime + 1) + `;
                    grid-column-end: ` + (index - minWeekStartTime + 2) + `" 
                    ` + ((type == "room" || type == "people") ? `onclick="render_courses_specific('` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/')"` : '') + `>
                    <div style="position:sticky;top:2.75em;padding-left:0em;border-left:0em solid #88ff88cc">
                    <h4>` + startTime[1] + ` <span style="opacity:0.4">→</span> ` + endTime[1] + `</h4><p2>`
                if (type === "room") {
                    html_draft += lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i>`
                } else if (type === "people") {
                    html_draft += lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i><small><br>` + lesson.room + `</small>`
                } else if (type === "courseDetail") {
                    html_draft += `Room: ` + lesson.Room + `<br><i>Instructor: ` + JSON.stringify(lesson.Instructor) + `</i>`
                }
                html_draft += `</p2></div></div>`
            })
            html_draft += ``
        } else if (!haveWeekRendered) {
            minWeekStartTime = index
        }
    })
    html_draft += `</div>`

    if (days.Other.length > 0) {
        html_draft += `<div>`
        if (type != "courseDetail") html_draft += `<h3 style="padding-left:1em">Others</h3>`
        html_draft += `<div class="box" style="padding:0.5em 1em">`
        days.Other.forEach(lesson => {
            if (type === "room") {
                html_draft += `<div style="margin:0.75em 0.5em 0.75em 0.25em;padding:0.25em 0.5em 0.25em 0.75em;border-left:0.25em solid #ff888888;cursor:pointer" 
                onclick="render_courses_specific('` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/')">
                <h4>` + lesson.date.substring(0, 25) + `</h4><h5>` + lesson.date.slice(25) + `</h5>
                <p2>` + lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i></p2>
                </div>`
            } else if (type === "people") {
                html_draft += `<div style="margin:0.75em 0.5em 0.75em 0.25em;padding:0.25em 0.5em 0.25em 0.75em;border-left:0.25em solid #ff888888;cursor:pointer" onclick="render_courses_specific('` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/')"><h4>` + lesson.course.split(" - ")[0] + ` (` + lesson.section.split(' (')[0] + `)</h4><p2><i>` + lesson.course.split(" - ")[1] + ` (` + lesson.section.split(' (')[1] + `</i><small><br>` + ((typeof lesson.date != "undefined") ? '' + lesson.date.substring(0, 25) + `<br>` + lesson.date.slice(25) + '<br>' : '') + lesson.room + `</small></p2></div>`
            } else if (type === "courseDetail") {
                html_draft += `<div style="margin:0.75em 0.5em 0.75em 0.25em;padding:0.25em 0.5em 0.25em 0.75em;border-left:0.25em solid #ff888888">
                <h4>` + lesson.date.substring(0, 25) + `</h4><h5>` + lesson.date.slice(25) + `</h5>
                <p2>Room: ` + lesson.Room + `<br><i>Instructor: ` + JSON.stringify(lesson.Instructor) + `</i></p2>
                </div>`
            }
        })
        html_draft += `</div></div>`
    }

    return html_draft
}

const waitCSS = () => { try { installCSS('uni.css') } catch { setTimeout(() => { waitCSS() }, 20) } }
waitCSS()