var script1 = document.createElement('script'); script1.src = '/!acc/uniplus.js'; document.head.appendChild(script1);

const bottombarIcon = "" + resourceNETpath + "image/uni.svg"

const bottombarbuttons = [
    'Me,/me/,me,' + resourceNETpath + 'image/me.png,1',
    'Browse,/course/,course,' + resourceNETpath + 'image/browse.png,2',
    'Planning,/plan/,plan,' + resourceNETpath + 'image/plan.png,4',
    'Search,/search/,search,' + resourceNETpath + 'image/search.png,3',
    'About,/about/,about,' + resourceNETpath + 'image/info.png,0'
]

function bootID_mapper(path = "") {
    if (!path || path == "/") {
        return -1
    } else if (path.toLowerCase().startsWith("/about/")) {
        return 0
    } else if (path.toLowerCase().startsWith("/me/")) {
        return 1
    } else if (path.toLowerCase().startsWith("/course/") || path.toLowerCase().startsWith("/group/") || path.toLowerCase().startsWith("/people/") || path.toLowerCase().startsWith("/room/")) {
        return 2
    } else if (path.toLowerCase().startsWith("/search/")) {
        return 3
    } else if (path.toLowerCase().startsWith("/plan/")) {
        return 4
    } else {
        return -1
    }
}

function signout_reboot_customScript() {
    try { config = {} } catch (error) { }
}

function getPageHTML_404() {
    return `<meta http-equiv="refresh" content="0;URL=/!404/">`
}

document.body.style.overflowY = "scroll" //make scrollbar always visible

let disableSigninRequirement = true, scrollIntoView = false, doNotCheckUGPG = false
let studprog = "ug", listMode = "card", config = {}
let allSems = [], allSemsF = [], deptx = "ACCT"
let rooms = [], roomx = "LTA"
let peoples = [], peoplex = ""
let majorminorreqs = {}
let experiments = {
    plan_beta: {
        hidden: false,
        enabled: true,
    },
    room_show_textbox: {
        hidden: false,
        enabled: false,
    }
}

var prev_call = 'none'
function init(path) {

    if (prev_call != path) { //if already initPage page then don't initPage it again

        prev_call = path

        let exphtml = ""
        Object.keys(experiments).forEach(experiment => {
            if (!experiments[experiment].hidden) {
                exphtml += `
                <div class="flx" style="justify-content:flex-start;gap:0.5em;margin-top:0.75em">
                    <label class="switch">
                        <input id="` + experiment + `" type="checkbox" ` + ((experiments[experiment].enabled) ? " checked" : "") + ` onclick="experiments.` + experiment + `.enabled = !experiments.` + experiment + `.enabled`

                switch (experiment) {
                    case "room_show_textbox":
                        exphtml += `; if (window.location.pathname.toLowerCase().startsWith('/room')) setTimeout(reboot, 120)`
                        break

                    case "plan_beta":
                        exphtml += `; if (window.location.pathname.toLowerCase().startsWith('/plan')) setTimeout(reboot, 120)`
                        break
                }

                exphtml += `">
                        <span class="slider"></span>
                    </label>
                    <label for="` + experiment + `" style="cursor:pointer"><p2>` + experiment + `</p2></label>
                </div>
                `
            }
        })

        // document.getElementById("cover_screen").innerHTML = `
        // <img src="` + resourceNETpath + `image/uni.svg" style="height:8em;width:100%;object-fit:contain;margin:3em 0 1.5em 0">
        //     <div id="cover_spin"></div>
        //     <style>
        //   #cover_screen{background-color:var(--bw);z-index:10000;opacity:1;transition-duration:0.15s;display:flex;flex-flow:column;justify-content:center;align-items:center;width:100%;height:100%;position:fixed;top:0;bottom:0;left:0;right:0}
        //   #cover_spin{padding:0.005em;text-align:center;line-height:1;opacity:1;transition-duration:0.15s;border-radius:50%;animation:1.25s linear infinite spinner;border:solid 0.25em rgba(96,96,96,.3);border-top-color:#99f;height:1em;width:1em;will-change:transform}
        //   @keyframes spinner { 0% {transform:rotate(0deg)} 100% {transform:rotate(360deg)} }
        // </style>`

        if (path == '/' || path == '') { //home page, not decided what to do yet so redir to /course/ ;)
            setTimeout(() => {
                boot("/course/", true, 2)
            }, 150); return ""
            return `<meta http-equiv="refresh" content="0;URL=/course/">`

        } else if (path.toLowerCase().startsWith("/me/")) { //me page
            return `<div id="me_wrp"></div>` + renderBottomBar('me', false, bottombarIcon)

        } else if (path.toLowerCase().startsWith("/course/") || path.toLowerCase().startsWith("/group/") || path.toLowerCase().startsWith("/people/") || path.toLowerCase().startsWith("/room/")) { //course + people + room
            return `<div id="courses_select_wrp">
                <div class="edge2edge flxb" id="courses_select_main" style="transition-timing-function:cubic-bezier(.65,.05,.36,1);transition-duration:0.6s">
                    <div class="LR_Left" id="courses_select_left">
                        <div class="LR_Left_Content">
                            <div class="box flx" style="justify-content:center;gap:0.5em;margin:0.5em 0">
                                <button onclick="boot('/course/', false, 2)">course</button>
                                <button onclick="peoplex='';boot('/people/', false, 2)">people</button>
                                <button onclick="roomx='LTA';boot('/room/', false, 2)">room</button>
                            </div>
                            <div id="courses_select_left_top"></div>
                            <div class="flx" style="justify-content:center;gap:0.5em;margin:0.5em 0;border-top:0.15em dotted rgba(128,128,128,.2);padding-top:0.75em" id="courses_select_left_optionBox"></div>
                            <div id="courses_select_left_extra">
                                <div class="box" style="margin:1em 0;display:none">
                                    <h4>Experiments</h4>
                                    ` + exphtml + `
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="LR_Right" id="courses_select_right"></div>
                </div>
            </div>` + renderBottomBar('course', false, bottombarIcon)

        } else if (path.toLowerCase().startsWith("/search/")) { //search

            return `<div id="courses_select_wrp">
                <div class="edge2edge flxb" id="courses_select_main" style="transition-timing-function:cubic-bezier(.65,.05,.36,1);transition-duration:0.6s">
                    <div class="LR_Left" id="courses_select_left">
                        <div class="LR_Left_Content">
                            <br>
                            <div id="courses_select_left_top"></div>
                            <div class="box flx" style="justify-content:center;gap:0.5em;margin:0.5em 0" id="courses_select_left_optionBox"></div>
                        </div>
                    </div>
                    <div class="LR_Right" id="courses_select_right"></div>
                </div>
            </div>` + renderBottomBar('search', false, bottombarIcon)

        } else if (path.toLowerCase().startsWith("/plan/")) { //plan

            return `<div id="courses_select_wrp">
                <div class="edge2edge flxb" id="courses_select_main" style="transition-timing-function:cubic-bezier(.65,.05,.36,1);transition-duration:0.6s">
                    <div class="LR_Left" id="courses_select_left">
                        <div class="LR_Left_Content">
                            <br>
                            <div id="courses_select_left_top"></div>
                            <div class="flx" style="gap:0.5em;margin:0.5em 0;border-top:0.15em dotted rgba(128,128,128,.2);padding-top:0.75em" id="courses_select_left_optionBox"></div>
                            <div id="courses_select_left_extra">
                                <div class="box" style="margin:1em 0;display:none">
                                    <h4>Experiments</h4>
                                    ` + exphtml + `
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="LR_Right" id="courses_select_right">
                        <div id="major_select_topbox" class="box" style="gap:0.25em"></div>
                        <div id="major_select_cont"></div>
                    </div>
                </div>
            </div>` + renderBottomBar('plan', false, bottombarIcon)

        } else if (path.toLowerCase().startsWith("/about/")) { //about page
            return `<div id="about"><div class="edge2edge_page">
            
            <h2>About</h2>
            <p3><br>
                uni.gafea.net is not affiliated with the Hong Kong University of Science and Technology (HKUST).
            <br>
                This project would not be possible without the <a target="_blank" href="https://w5.ab.ust.hk/wcq/cgi-bin/">HKUST Class Schedule & Quota</a> and <a target="_blank" href="https://w5.ab.ust.hk/wex/cgi-bin/">HKUST Final Examination Schedule</a> system, which was first adapted from a student contribution in 2011-12 Fall.
            <br>
                Some of the class data comes from the <a target="_blank" href="https://web.archive.org/">Wayback Machine</a> and <a target="_blank" href="https://ust.space/">ust.space</a>.
            </p3>

            <br><br><h3>Licenses</h3>
            <div class="box">
                <div class="flx" style="justify-content: start; gap: 0.5em; align-items: baseline">
                    <h4>Chart.js</h4>
                    <p2><a href="https://github.com/chartjs/Chart.js" class="aobh" target="_blank">GitHub</a></p2>
                </div>
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
            <div class="box">
                <div class="flx" style="justify-content: start; gap: 0.5em; align-items: baseline">
                    <h4>chartjs-plugin-annotation.js</h4>
                    <p2><a href="https://github.com/chartjs/chartjs-plugin-annotation" class="aobh" target="_blank">GitHub</a></p2>
                </div>
                <p3>
                    The MIT License (MIT)
                <br><br>
                    Copyright (c) 2016-2021 chartjs-plugin-annotation Contributors
                <br><br>
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                <br><br>
                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                <br><br>
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                </p3>
            </div>
            <div class="box">
                <div class="flx" style="justify-content: start; gap: 0.5em; align-items: baseline">
                    <h4>Chart.js Graphs</h4>
                    <p2><a href="https://github.com/sgratzl/chartjs-chart-graph" class="aobh" target="_blank">GitHub</a></p2>
                </div>
                <p3>
                    The MIT License (MIT)
                <br><br>
                    Copyright (c) 2019-2022 Samuel Gratzl
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

            </div></div>` + renderBottomBar('about', false, bottombarIcon)

        } else if (false && path.startsWith('/!') && !(path === '/!404' || path.startsWith('/!404/'))) { //reserved for api call, invalid for HTML
            let spath = document.createTextNode(path).textContent
            return `<div class="edge2edge_page"><p2><b><i>Did you mean: <a href="` + spath.replace("/!", "/") + `">` + spath.replace("/!", "/") + `</a></i></b><br><br>This is the response of the following API call:<br></p2><code style="font-family: monospace, monospace">` + spath + `</code><br><br><div class="box"><div id="apiresp" style="line-break:anywhere"><div id="d_loading"></div></div></box></div>`

        } else { //404 page
            return getPageHTML_404()

        }

    }

}

function exe(path) {

    if (path === 'cleanup') { return }

    if (path.toLowerCase().startsWith("/course/") || path.toLowerCase().startsWith("/group/")) {
        exe_courses(path)
    } else if (path.toLowerCase().startsWith("/people/")) {
        document.getElementById('courses_select_main').classList.add('edge2edge_wide')
        html = document.getElementById("courses_select_right")
        if (peoples.length === 0) {
            fetch("/!people/").then(r => r.json()).then(r => {
                if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
                peoples = r.resp
                exe_people(path.substring(8))
            }).catch(error => {
                console.log(error)
                html.innerHTML = "failed to contact server or script crashed"
            })
        } else {
            exe_people(path.substring(8))
        }
    } else if (path.toLowerCase().startsWith("/room/")) {
        document.getElementById('courses_select_main').classList.add('edge2edge_wide')
        html = document.getElementById("courses_select_right")
        if (rooms.length === 0) {
            fetch("/!room/").then(r => r.json()).then(r => {
                if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
                rooms = r.resp
                exe_room(path.substring(6))
            }).catch(error => {
                console.log(error)
                html.innerHTML = "failed to contact server or script crashed"
            })
        } else {
            exe_room(path.substring(6))
        }
    } else if (path.toLowerCase().startsWith("/me/")) {
        exe_me(path.substring(4))
    } else if (path.toLowerCase().startsWith("/search/")) {
        document.getElementById('courses_select_main').classList.remove('edge2edge_wide')
        exe_search()
    } else if (path.toLowerCase().startsWith("/plan/")) {
        exe_plan(path.substring(6))
    } else if (path.toLowerCase().startsWith("/about/")) {
        exe_about()
    } else if (false && path.startsWith('/!') && !(path === '/!404' || path.startsWith('/!404/'))) {
        document.getElementById("bottomBar").innerHTML = ""
        fetch(path).then(r => r.json()).then(r => document.getElementById("apiresp").innerText = JSON.stringify(r)).catch(error => document.getElementById("apiresp").innerText = `failed to contact server: \n` + error.message)
    }

    isBootRunning = false
    rendergAds()

}

const exe_courses = (path) => wait_allSems(render_courses, path, "Courses - uni")
const exe_people = (path) => wait_allSems(render_people, path, "People - uni")
const exe_room = (path) => wait_allSems(render_room, path, "Rooms - uni")
const exe_me = (path) => wait_allSems(render_me, path, "Me - uni")
const exe_search = (path) => wait_allSems(render_search, path, "Search - uni")
const exe_plan = (path) => wait_allSems(render_plan, path, "Planning - uni")
const exe_about = (path) => wait_allSems(render_about, path, "About - uni")

function render_about() {
    document.title = "About - uni"
    return
}

const courseCodeNamedb = JSON.parse('{"ACCT":"Accounting","BIBU":"Biotechnology and Business","BIEN":"Bioengineering","BIPH":"Biological Physics","CENG":"Chemical and Biological Engineering","CHEM":"Chemistry","CIVL":"Civil and Environmental Engineering","COMP":"Computer Science and Engineering","CORE":"Common Core","CPEG":"Computer Engineering","DASC":"Data Analytics in Science","DSCT":"Data Science and Technology","ECON":"Economics","ELEC":"Electronic and Computer Engineering","EMIA":"Emerging Interdisciplinary Areas","ENEG":"Energy","ENGG":"School of Engineering","ENTR":"Entrepreneurship","ENVR":"Environment","ENVS":"Environmental Science","FINA":"Finance","FYTG":"HKUST Fok Ying Tung Graduate School","GBUS":"Global Business","GNED":"General Education","HART":"Studio Arts courses offered by HUMA","HLTH":"Health and Physical Education","HUMA":"Humanities","IDPO":"Interdisciplinary Programs Office","IEDA":"Industrial Engineering and Decision Analytics","IIMP":"Individualized Interdisciplinary Major","IROP":"International Research Opportunities Program","ISDN":"Integrative Systems and Design","ISOM":"Information Systems, Business Statistics and Operations Management","LABU":"Language for Business","LANG":"Language","LEGL":"Legal Education","LIFS":"Life Science","MARK":"Marketing","MATH":"Mathematics","MECH":"Mechanical and Aerospace Engineering","MGMT":"Management","OCES":"Ocean Science","PHYS":"Physics","PPOL":"Public Policy","RMBI":"Risk Management and Business Intelligence","SBMT":"School of Business and Management","SCIE":"School of Science","SHSS":"School of Humanities and Social Science","SISP":"Summer Institute for Secondary School Students","SOSC":"Social Science","SUST":"Sustainability","TEMG":"Technology and Management","UROP":"Undergraduate Research Opportunities Program","WBBA":"SF program in World Business"}')
const courseCode_to_fullName = (code) => {
    if (typeof courseCodeNamedb[code] === 'undefined')
        return code
    else
        return courseCodeNamedb[code]
}

const hotnessEmoji = {"-2": "🧊", "-1": "❄️", "0": "", "1": "🔥", "2": "❤️‍🔥"}
function generate_course_selbox(courseCode = "COMP 3511", courseName = "Operating Systems", sem = "2230", units = "3", picbox_inner_up_html = "", noSpecialOverlay = false, onclickfx = "", hotnessinfo = {hotness: 0}) { //this only support courses
    let code = courseCode.replaceAll(" ", ""), url = "" + resourceNETpath + `uni_ai/` + code + `.webp`, deptName = courseCode_to_fullName(courseCode.split(" ")[0])

    if (courseCode == "COMP 3511") url = `https://ia601705.us.archive.org/16/items/windows-xp-bliss-wallpaper/windows-xp-bliss-4k-lu-1920x1080.jpg`

    return `<button id="` + code + `" aria-label="Course selection button. ` + courseCode.replace(new RegExp(`.{${1}}`, 'g'), '$&' + " ") + ", " + courseName + `. A` + ((deptName[0] == "A" || deptName[0] == "E" || deptName[0] == "I" || deptName[0] == "O" || deptName[0] == "U") ? "n " : " ") + deptName + ` course, offered in ` + ustTimeToString(sem, true).replace("-", " to ") + `. Double click for details." class="course_sel selbox picbox" 
    onclick="` + ((onclickfx) ? onclickfx(courseCode, courseName, sem, units) : (`boot('/course/` + sem + "/" + courseCode.split(' ')[0] + "/" + code + `/', false, 2)`)) + `">
        <img referrerpolicy="no-referrer" src="` + url + `" loading="lazy" fetchpriority="low" onerror="this.onerror=null;this.src=emptyimg">    
        <div class="picbox_inner flx">
            <div class="picbox_inner_up flx">
                ` + picbox_inner_up_html + `
            </div>
            <div class="picbox_inner_down flx">
                <div>
                    <h4>` + courseCode + `</h4>
                    <h5>` + courseName + `</h5>
                </div>
                <div>
                    <h5 style="opacity:0.85">
                        ` + (hotnessinfo.hotness ? hotnessEmoji[hotnessinfo.hotness] : ((typeof hotnessinfo.avgEnrollPercent != "undefined" && hotnessinfo.avgEnrollPercent !== null) ? "👤" : "")) + `
                        ` + ((typeof hotnessinfo.avgEnrollPercent != "undefined" && hotnessinfo.avgEnrollPercent !== null) ? ("" + (hotnessinfo.hotness ? " " : "") + (+(hotnessinfo.avgEnrollPercent).toFixed(1)) + `%`) : "") + `
                    </h5>
                </div>
            </div>
        </div>` + ((noSpecialOverlay) ? "" : ((typeof config.courses != "undefined" && typeof config.courses[courseCode] != "undefined" && config.courses[courseCode][Object.keys(config.courses[courseCode]).sort().reverse()[0]].grade != "AU") ? (`
        <div class="picbox_inner_success picbox_inner flx"><h4>✅ Taken</h4></div>
        `) : ((typeof config._ != "undefined" && typeof config._[code] != "undefined" && !config._[code].pass) ? (`
        ` + (((typeof config._[code].EXCLUSION != "undefined" && config._[code].EXCLUSION.pass) || (typeof config._[code].respattr != "undefined" && typeof config._[code].respattr.PrevAltrCrash != "undefined" && config._[code].respattr.PrevAltrCrash)) ? (`
        <div class="picbox_inner_blocked picbox_inner flx"><h4>❌ Blocked</h4></div>
        `) : (`
        <div class="picbox_inner_locked picbox_inner flx"><h4>🔒 Locked</h4></div>
        `))) : ``))) + `
    </button>`
}

function courseStringToParts(course) {
    let dept = course.split(" ")[0]
    let code = course.split(" - ")[0]
    let units = course.substring(course.lastIndexOf(" (") + 2, course.length).split(")")[0]
    let name = course.replace(course.split(" - ")[0] + " - ", "").substring(course.replace(course.split(" - ")[0] + " - ", ""), course.replace(course.split(" - ")[0] + " - ", "").lastIndexOf(" ("))

    return { dept: dept, code: code, units: units, name: name }
}

const startSearchingHTML = `<br><br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>Type in keywords to start searching!</b></p1></center>`

function render_search(path, queryX = "", selectCourse = false) {
    let query = ""
    if (!path && queryX) {
        path = "?q=" + queryX
        query = queryX
    } else {
        path = window.location.search
        let params = new URLSearchParams(path)
        query = params.get('q')
    }

    if (!selectCourse) {
        document.getElementById("courses_select_left_top").innerHTML = `<div class="flx"><h2>Search</h2></div>`
        document.getElementById("courses_select_left_optionBox").innerHTML = `<style>#courses_select_left_optionBox{display:none}</style>`
        document.getElementById("courses_select_right").innerHTML = `<br><div id="fdigbtn" class="flx"><label for="search_dw_box"><img alt="Search" src="` + resourceNETpath + `image/search.png" draggable="false"></label><p3 id="digsrtxt">Search</p3>
    <form onsubmit="boot('/search/?q='.concat(encodeURIComponent(document.getElementById('search_dw_box').value)), true, 3);this.blur();return false"><input ` + ((!query) ? "autofocus " : "") + `id="search_dw_box" name="dw" type="search" placeholder="Search for anything" value="" title="Search"></form></div>
    <div id="search_result"></div>`
        document.getElementById("search_dw_box").focus()

        if (!query) {
            document.title = "Search - uni"
            document.getElementById("search_result").innerHTML = startSearchingHTML
            return
        }

        document.title = "🔍 " + query + " - uni"
        document.getElementById("search_dw_box").value = query
        document.getElementById("search_dw_box").blur()
    }
    document.getElementById("search_result").innerHTML = `<br><div class="flx" style="justify-content:center;gap:0.5em;text-align:center"><div id="d_loading"></div><p2><b>Loading...</b></p2></div>`

    let tmark = (new Date()).getTime()
    fetch("/!search/" + encodeURIComponent(path)).then(r => r.json()).then(r => {
        switch (r.status) {
            case 404:
                r.resp = []
            case 200:
                if (selectCourse && r.resp.length > 100) {
                    if (queryX == add_course_search_history) {
                        document.getElementById("search_result").innerHTML = `<br><p3 style="margin-left:0.5em">Total ` + r.resp.length + ` result` + ((r.resp.length === 1) ? "" : "s") + ` (` + ((new Date()).getTime() - tmark) + ` ms).</p3><br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch_empty.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>Too many results, try using course codes (e.g. COMP1021) ?</b></p1></center>`
                    }
                    return
                }
                document.getElementById("search_result").innerHTML = `<br><p3 style="margin-left:0.5em">Total ` + r.resp.length + ` result` + ((r.resp.length === 1) ? "" : "s") + ` (` + ((new Date()).getTime() - tmark) + ` ms).</p3><br><div class="flx" id="search_out"><div id="d_loading"></div></div>`
                setTimeout(() => {
                    let draft = [], scores = [], score = 0, queryAmt = query.split(" "), lastQueryAmt = queryAmt.pop(), qLength = queryAmt.length; if (lastQueryAmt) qLength++
                    r.resp.sort((a, b) => { return parseInt(b.result.SEM) - parseInt(a.result.SEM) }).forEach(ans => {
                        switch (ans.type) {
                            case "course":
                                if (r.resp.length === 1 && !selectCourse) {
                                    boot(`/course/` + ans.result.SEM + "/" + ans.result.CODE.substring(0, 4) + "/" + ans.result.CODE + `/`, true, 2)
                                    return
                                }
                                score = 0
                                ans.found.forEach(f => {
                                    if (f === "CODE") score += 1 / qLength
                                    if (f === "NAME") score += 0.6 / qLength / qLength + 0.3 / qLength / qLength + 0.1 / qLength / qLength
                                })
                                if (selectCourse) {
                                    draft.push({
                                        score: score, html: generate_course_selbox(ans.result.CODE.substring(0, 4) + " " + ans.result.CODE.substring(4), ans.result.NAME, ans.result.SEM, ans.result.UNITS, `<h5></h5><h5 style="opacity:0.85">` + ans.result.UNITS + ` unit` + ((ans.result.UNITS === "1") ? '' : 's') + `</h5>`, true, (courseCode = "COMP 3511", courseName = "Operating Systems", sem = "2230", units = "3") => {
                                            return `add_course(false, {'code': '` + courseCode + `', 'name': '` + courseName.replaceAll('"', '\\"').replaceAll("'", "\\'") + `', 'sem': '` + sem + `', 'units': '` + units + `'})`
                                        }) /*+ score /* + ", " + JSON.stringify(ans.found) */
                                    })
                                } else {
                                    draft.push({ score: score, html: generate_course_selbox(ans.result.CODE.substring(0, 4) + " " + ans.result.CODE.substring(4), ans.result.NAME, ans.result.SEM, ans.result.UNITS, `<h5></h5><h5 style="opacity:0.85">` + ans.result.UNITS + ` unit` + ((ans.result.UNITS === "1") ? '' : 's') + `</h5>`, true) /*+ score /* + ", " + JSON.stringify(ans.found) */ })
                                }
                                break;

                            case "people":
                                if (r.resp.length === 1 && !selectCourse) {
                                    peoplex = ans.result
                                    boot(`/people/` + ans.result + `/`, true, 2)
                                    return
                                }
                                if (selectCourse) return
                                score = 1
                                draft.push({
                                    score: score, html: `<div style="padding:0;page-break-inside:avoid" id="` + ans.result + `" class="course_sel selbox picbox" onclick="peoplex='` + ans.result + `';boot('/people/` + ans.result + `/', false, 2)" title="` + ans.result + `"><div class="picbox_inner flx">
                                <div class="picbox_inner_up flx"><h5 style="opacity:0.85"> </h5></div>
                                <div><h4>` + ans.result + `</h4></div></div></div>`
                                })
                                break;

                            case "room":
                                if (r.resp.length === 1 && !selectCourse) {
                                    roomx = ans.result
                                    boot(`/room/` + ans.result + `/`, true, 2)
                                    return
                                }
                                if (selectCourse) return
                                score = 1
                                draft.push({
                                    score: score, html: `<div style="padding:0;page-break-inside:avoid" id="` + ans.result + `" class="course_sel selbox picbox" onclick="roomx='` + ans.result + `';boot('/room/` + ans.result + `/', false, 2)" title="` + ans.result + `"><div class="picbox_inner flx">
                                <div class="picbox_inner_up flx"><h5 style="opacity:0.85"> </h5></div>
                                <div><h4>` + ans.result + `</h4></div></div></div>`
                                })
                                break;

                            default:
                                if (selectCourse) return
                                score = 0
                                draft.push({ score: score, html: `<div class="box">` + JSON.stringify(ans) + "</div>" })
                                break;
                        }
                        if (!scores.includes(score)) scores.push(score)
                    })
                    let maxScoreDraft = "", normDraft = "", oldDraft = "", maxScore = scores.sort().reverse()[0], tHold = Math.min((0.6 + 0.3 + 0.1) / qLength, Math.max(1 / qLength, maxScore))//; console.log(tHold)
                    draft.sort((a, b) => { return b.score - a.score }).forEach(d => { if (d.score >= tHold) { maxScoreDraft += d.html } else if (d.score < 0) { oldDraft += d.html } else { normDraft += d.html } })
                    document.getElementById("search_out").innerHTML = ""
                    if (maxScoreDraft) {
                        document.getElementById("search_out").innerHTML += `<div style="width:100%;margin-top:0.75em;padding-top:0.75em;border-top:0.15em dotted #8886"><h4>✨ Best Matches</h4><div class="flx">` + maxScoreDraft + `</div></div>`
                    } else {
                        document.getElementById("search_out").innerHTML += `<div style="width:100%"><br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch_empty.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>` + ((!r.resp.length && query === "keywords") ? `sure.` : `Not much great matches were found. Try again with different keywords?`) + `</b></p1></center><br></div>`
                    }
                    if (normDraft) document.getElementById("search_out").innerHTML += `<div style="width:100%;margin-top:0.75em;padding-top:0.75em;border-top:0.15em dotted #8886"><h4 style="padding-left:0.5em">` + (maxScoreDraft ? "Other" : "Related") + ` Matches</h4><div class="flx">` + normDraft + `</div></div>`
                    if (oldDraft && signinlevel > 1) document.getElementById("search_out").innerHTML += `<div style="width:100%;margin-top:0.75em;padding-top:0.75em;border-top:0.15em dotted #8886"><h4 style="padding-left:0.5em">Undecodable Matches (Admin)</h4><div class="flx">` + oldDraft + `</div></div>`
                }, 10)
                break;
            default:
                document.getElementById("search_result").innerHTML = `<br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch_empty.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>Server error, try again later</b></p1></center>`
                break;
        }
    }).catch(error => {
        console.log(error)
        document.getElementById("search_result").innerHTML = `<br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch_empty.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>Server error or script crashed, try again later</b></p1></center>`
    })
}

function render_plan(path) {
    document.getElementById("courses_select_left_top").innerHTML = "<h2>Planning</h2>"

    function find_in_local_cache(year, majorminor, cb) {
        if (majorminor && year > -1) { //return major/minor data of that year
            if (typeof majorminorreqs[year][majorminor] != "undefined" && Object.keys(majorminorreqs[year][majorminor]).length) { cb(majorminorreqs[year][majorminor]); return }
            fetch("/!plan/" + year.toString() + "/" + majorminor + "/").then(r => r.json()).then(r => {
                if (r.status != 200) { cb({}); return }
                majorminorreqs[year][majorminor] = JSON.parse(JSON.stringify(r.resp))
                cb(r.resp)
            })

        } else if (majorminor && year <= 0) { //return year of offerings of that major/minor
            cb("unsupported-yet")

        } else if (!majorminor && year > -1) { //return major/minor offerings of that year
            if (typeof majorminorreqs[year] != "undefined" && Object.keys(majorminorreqs[year]).length) { cb(Object.keys(majorminorreqs[year])); return }
            fetch("/!plan/" + year.toString() + "/").then(r => r.json()).then(r => {
                if (r.status != 200) { cb([]); return }
                if (typeof majorminorreqs[year] === "undefined") majorminorreqs[year] = {}
                r.resp.forEach(mmid => majorminorreqs[year][mmid] = {})
                cb(r.resp)
            })

        } else { //return years keys only
            if (Object.keys(majorminorreqs).length) { cb(Object.keys(majorminorreqs)); return }
            fetch("/!plan/").then(r => r.json()).then(r => {
                if (r.status != 200) { cb([]); return }
                r.resp.forEach(year => majorminorreqs[year] = {})
                cb(r.resp)
            })
        }
    }

    let paths = path.split("/")
    let yearx = -1, majorminorx = "", mmdraft = ""
    if (paths[0] && !isNaN(paths[0]) && !isNaN(parseFloat(paths[0]))) yearx = parseInt(paths[0])
    if (typeof paths[1] != "undefined" && paths[1]) majorminorx = decodeURIComponent(paths[1]).replaceAll("-", " ")

    find_in_local_cache(-1, "", (years) => {

        if (signinlevel > 0 && yearx > -1) mmdraft += `<button onclick="boot('/plan/', false, 4)" class="aobh acss"><b>く home</b></button><div class="flx" style="gap:0.5em">`
        years.sort().reverse().forEach(mm => {
            if (mm == "0") {
                mmdraft += `<button onclick="boot('/plan/` + mm + `/', false, 4)">For all students</button>`
            } else {
                mmdraft += `<button onclick="boot('/plan/` + mm + `/', false, 4)">For students intaked in ` + mm + `</button>`
            }
        })
        if (signinlevel > 0) mmdraft += `</div>`
        mmdraft += "<br>"
        document.getElementById("courses_select_left_optionBox").innerHTML = mmdraft
        mmdraft = ""

        if (yearx < 0) {

            if (signinlevel <= 0 || typeof config.profile == "undefined" || typeof config.profile.currentStudies == "undefined" || typeof config.profile.currentStudies.yearOfIntake == "undefined") {
                setTimeout(() => { boot("/plan/" + years[0] + "/", true, 4) }, 150);
                return
            }

            document.getElementById("major_select_topbox").innerHTML = ``
            setTimeout(() => {
                let htmldft = `
                <div class="flx" style="justify-content:space-around">
                    <div class="flx" style="justify-content:center">
                        <div class="usericon" style="pointer-events: none;cursor: default;text-decoration: none;"><a href="#"><img alt="" src="https://me.gafea.net/getpp/_` + Math.random() + `" draggable="false"></a></div>
                        <div class="usertext">
                                <h4>`
                if (signinlevel >= 1) {
                    htmldft += document.getElementById("ckusrinfo").getElementsByClassName("usertext")[0].innerHTML
                } else {
                    htmldft += `Guest`
                }
                htmldft += `    </h4>
                            </div>
                        </div>
                        <div><center>
                            <p2> Study Program: <b>` + config.profile.currentStudies.studyProgram + `</b></p2><br>
                            <p2> Year of Intake: <b>` + ustTimeToString(config.profile.currentStudies.yearOfIntake, true) + `</b></p2><br>
                            <button class="acss aobh" onclick="boot('/me/profile/', false, 1)">Modify in My Profile</button>
                        </center></div>
                    </div>`

                document.getElementById("major_select_topbox").innerHTML = htmldft
            }, 500)

            document.getElementById("major_select_cont").innerHTML = `
            <br>
            <h4>My programs</h4><br>
            <div id="major_minor_sel">
                <div id="d_loading"></div>
            </div>

            <br><br>
            <h4>Recommended courses</h4><br>
            <div id="courses_recommend">
                <div id="d_loading"></div>
            </div>

            <br><br>
            <h4>Recommended programs</h4><br>
            <div id="major_minor_recommend">
                <div id="d_loading"></div>
            </div>

            <br><br>
            <h4>Recommended study pathway</h4><br>
            <div id="arrange_recommend">
                <div id="d_loading"></div>
            </div>
            `

            fetch("/!plan/20" + config.profile.currentStudies.yearOfIntake.substring(0, 2) + "/?majoronly=true").then(r => r.json()).then(r => {
                if (r.status != 200) { document.getElementById("major_select_cont").innerHTML = `failed to contact server`; return }
                let mmlength = 0, mmdraft = "", majoronly = r.resp
                fetch("/!plan/20" + config.profile.currentStudies.yearOfIntake.substring(0, 2) + "/").then(r => r.json()).then(r => {
                    if (r.status != 200) { document.getElementById("major_select_cont").innerHTML = `failed to contact server`; return }
                    let everymm = JSON.parse(JSON.stringify(r.resp))
                    fetch("/!plan/0/").then(r => r.json()).then(r => {
                        if (r.status == 200) everymm = [...everymm, ...r.resp]

                        if (typeof config.profile == "undefined") config.profile = {}
                        if (typeof config.profile.currentStudies == "undefined") config.profile.currentStudies = {}
                        if (typeof config.profile.currentStudies.mm == "undefined") config.profile.currentStudies.mm = []
                        mmlength = config.profile.currentStudies.mm.length + 1

                        for (let index = 0; index < mmlength; index++) {
                            mmdraft += `[` + (index + 1) + `]: <select id="mmsel-` + index + `" onchange="let n = []; if (typeof config.profile.currentStudies.mm != 'undefined') n = config.profile.currentStudies.mm; let v = document.getElementById('mmsel-` + index + `').value;if (v === '----') {n.splice(` + index + `, 1)} else {n[` + index + `] = v};updateProfile('currentStudies', 'mm', n, reboot)">`
                            if (index || (typeof config.profile.currentStudies.mm[index] == "undefined" || config.profile.currentStudies.mm.length > 1)) {
                                mmdraft += `<option value="----" selected>----</option>`
                            }
                            let selectedmm = ["", "0"];
                            (index ? everymm : majoronly).forEach(mmx => {
                                if (!(!(config.profile.currentStudies.mm[index] == mmx) && (config.profile.currentStudies.mm.includes(mmx)))) {
                                    mmdraft += `<option ` + ((config.profile.currentStudies.mm[index] == mmx) ? "selected " : "") + `value="` + mmx + `">` + mmx + `</option>`
                                    if (config.profile.currentStudies.mm[index] == mmx) {
                                        selectedmm[0] = mmx
                                        if (!r.resp.includes(mmx)) selectedmm[1] = "20" + config.profile.currentStudies.yearOfIntake.substring(0, 2)
                                    }
                                }
                            })
                            if (index + 1 < mmlength) {
                                mmdraft += `</select><p2><button class="aobh acss" onclick="boot('/plan/` + selectedmm[1] + `/` + selectedmm[0].replaceAll(" ", "-") + `/', false, 4)">View details</button></p2><br>`
                            } else {
                                mmdraft += `</select><br>`
                            }
                        }

                        if (typeof config.profile.currentStudies.mm[0] == "undefined" || config.profile.currentStudies.mm.length < 1) {
                            mmdraft += `<div class="box">Please choose your first major. If you don't have one yet, select the one you want.</div>`
                        } else {

                        }

                        document.getElementById("major_minor_sel").innerHTML = mmdraft
                    })
                })
            }).catch(e => {
                console.log(e)
                document.getElementById("major_minor_sel").innerHTML = `failed to contact server or script crashed`
                return
            })

            let reqx1 = { "fx": "recommend-courses" }
            if (signinlevel < 1) reqx1.userdb = config
            post((signinlevel >= 1) ? "/!acc/userfx/" : "/!guestfx/", reqx1).then(r => r.json()).then(r => {
                if (r.status != 200 || (typeof r.resp != "undefined" && typeof r.resp.error != "undefined")) {
                    document.getElementById("courses_recommend").innerHTML = `failed to contact server`
                    return
                }

                let draft = ""
                r.resp.sort((a, b) => a.matches < b.matches).forEach(course => {
                    if (course.pass && course.units && parseInt(course.sem) > parseInt(allSemsF[0]) - 600) {
                        draft += generate_course_selbox(course.code.substring(0, 4) + " " + course.code.substring(4), course.name, course.sem, course.units, `
                        <h5>
                            ` + ((course.matches == 1) ? '' : ('' + course.matches + ` matches`)) + `
                        </h5>
                        <h5 style="opacity:0.85">
                            ` + course.units + ` unit` + ((course.units == "1") ? '' : 's') + `
                        </h5>`)
                    }
                })

                document.getElementById("courses_recommend").innerHTML = `<div class="flx">` + draft + `</div>`

            }).catch(error => {
                console.log(error)
                document.getElementById("courses_recommend").innerHTML = `failed to contact server or script crashed`
                return
            })

            let reqx2 = { "fx": "recommend-prog", "prog": config.profile.currentStudies.mm }
            if (signinlevel < 1) reqx2.userdb = config
            post((signinlevel >= 1) ? "/!acc/userfx/" : "/!guestfx/", reqx2).then(r => r.json()).then(r => {
                if (r.status != 200 || (typeof r.resp != "undefined" && typeof r.resp.error != "undefined")) {
                    document.getElementById("major_minor_recommend").innerHTML = `failed to contact server`
                    return
                }

                let draft = ""
                r.resp.sort((a, b) => a.percent < b.percent).forEach(mm => {
                    draft += `<div class="box">`
                    draft += `<h5>` + mm.name + `</h5>`
                    draft += `<p3>[` + mm.type + `] Completed ` + mm.percent + `%</p3>`
                    draft += `<p2><br><br><button class="aobh acss" onclick="boot('/plan/` + mm.year + `/` + mm.name.replaceAll(" ", "-") + `/', false, 4)">View details</button></p2>`
                    draft += `</div>`
                })

                document.getElementById("major_minor_recommend").innerHTML = `<div class="flx" style="gap:1em;justify-content:flex-start">` + draft + `</div>`

            }).catch(error => {
                console.log(error)
                document.getElementById("major_minor_recommend").innerHTML = `failed to contact server or script crashed`
                return
            })

            let reqx3 = { "fx": "arrange" }
            if (signinlevel < 1) reqx3.userdb = config
            post((signinlevel >= 1) ? "/!acc/userfx/" : "/!guestfx/", reqx3).then(r => r.json()).then(r => {
                if (r.status != 200 || (typeof r.resp != "undefined" && typeof r.resp.error != "undefined")) {
                    document.getElementById("arrange_recommend").innerHTML = `failed to contact server`
                    return
                }

                let draft = ""
                Object.keys(r.resp["arrange"]).sort().forEach(sem => {
                    draft += `<div id="` + sem + `">
                    <h5>` + ustTimeToString(sem) + `</h5><br>
                    ` + generate_html_from_action(r.resp["arrange"][sem], false, true) + `
                    </div>`
                })

                document.getElementById("arrange_recommend").innerHTML = `<div class="flx" style="gap:1em">` + draft + `</div>`

            }).catch(error => {
                console.log(error)
                document.getElementById("arrange_recommend").innerHTML = `failed to contact server or script crashed`
                return
            })

            document.getElementById('courses_select_main').classList.remove('edge2edge_wide')

            return
        }

        document.getElementById('courses_select_main').classList.add('edge2edge_wide')
        find_in_local_cache(yearx, "", (majorminors) => {
            if (!majorminorx) {
                setTimeout(() => {
                    let gotomm = majorminors[0].replaceAll(" ", "-")
                    if (signinlevel > 0) {
                        if (yearx.toString().length == 4 && config.profile.currentStudies.yearOfIntake.substring(0, 2) == yearx.toString().substring(2, 4)) {
                            gotomm = config.profile.currentStudies.mm[0].replaceAll(" ", "-")
                        }
                    }
                    boot("/plan/" + yearx + "/" + gotomm + "/", true, 4)
                }, 150)
                return
            }
            document.title = "" + majorminorx + ((yearx != "0") ? " (" + yearx + ")" : "") + " - Planning - uni"
            majorminors.forEach(mm => {
                mmdraft += `<button onclick="boot('/plan/` + yearx + `/` + mm.replaceAll(" ", "-") + `/', false, 4)">` + mm + `</button>`
            })
            document.getElementById("major_select_topbox").innerHTML = mmdraft
            mmdraft = ""
            if (signinlevel > 0) {
                let reqx = { "fx": "checking", "prog": [majorminorx] }
                if (signinlevel < 1) reqx.userdb = config
                post((signinlevel >= 1) ? "/!acc/userfx/" : "/!guestfx/", reqx).then(r => r.json()).then(r => {
                    if (r.status === 200) {

                        let mnote = rndStr(10)

                        document.getElementById("major_select_cont").innerHTML = `<br>
                        <h3>` + majorminorx + ((yearx != "0") ? " (" + yearx + ")" : "") + `</h3><br>
                        <div style="display:none">
                            <div id="mminfo-short-` + mnote + `"></div>
                            <div id="mminfo-type-` + mnote + `"></div>
                            <div id="mminfo-year-` + mnote + `"></div>
                        </div>
                        <div class="box" style="aspect-ratio:2.25"><canvas id="canvas"></canvas></div><br>
                        <div id="major_select_cont_out"></div>`

                        generate_graph_from_action(JSON.parse(JSON.stringify(r.resp[majorminorx])), majorminorx + ((yearx != "0") ? " (" + yearx + ")" : ""))

                        document.getElementById("mminfo-short-" + mnote).innerText = r.resp[majorminorx].attr.short
                        document.getElementById("mminfo-type-" + mnote).innerText = r.resp[majorminorx].attr.type
                        document.getElementById("mminfo-year-" + mnote).innerText = yearx

                        document.getElementById("major_select_cont_out").innerHTML = generate_html_from_action(JSON.parse(JSON.stringify(r.resp[majorminorx])), false, false, {}, mnote)

                    } else {
                        document.getElementById("major_select_cont").innerHTML = "failed to contact server"
                    }
                }).catch(error => {
                    console.log(error)
                    document.getElementById("major_select_cont").innerHTML = "failed to contact server or script crashed"
                })
            } else {
                find_in_local_cache(yearx, majorminorx, (reqs) => {
                    //document.getElementById("courses_select_right").innerHTML = JSON.stringify(reqs)
                    document.getElementById("major_select_cont").innerHTML = `<h3>` + majorminorx + ((yearx != "0") ? " (" + yearx + ")" : "") + `</h3><br>` + generate_html_from_action(JSON.parse(JSON.stringify(reqs)))
                })
            }
        })
    })
}

const mergeExisting = (obj1, obj2) => {
    const mutableObject1 = Object.assign({}, obj1)
    const mutableObject2 = Object.assign({}, obj2)
    mergeFunction(mutableObject1, mutableObject2)
    return mutableObject1
}
const mergeFunction = (obj1, obj2) => Object.keys(obj2).forEach(key => ((typeof obj1[key] === 'object') ? mergeFunction(obj1[key], obj2[key]) : obj1[key] = JSON.parse(JSON.stringify(obj2[key]))))

function create_new_profile_cb() {
    reboot()
}

function create_new_profile(studyProgram = "----", yearOfIntake = "----", mm = [], back = false, skip = false) {

    document.getElementById("profile_new_model").innerHTML = `<dialog id="profile_new_dialog">
    <form id="profile_new_dialog_form" action="javascript:void(0);">
        <div class="flx" style="gap:1em;flex-wrap: wrap-reverse;">
            <h4>Create ` + (signinlevel >= 1 ? `New` : `Guest`) + ` Profile</h4>
            <button value="cancel" formmethod="dialog" class="closebtn"` + ((signinlevel >= 1) ? ` style="display:none"` : ``) + `><img src="` + resourceNETpath + `image/circle-cross.png" title="Close"></button>
        </div><br>

        <div id="profile_new_dialog_content">
        </div><br>

        <div id="profile_new_dialog_buttons" class="flx">
        
            <br>
            <button id="security_dialog_confirmBtn" onclick="create_new_profile(document.getElementById('me_profile_currentStudies_studyProgram').value, document.getElementById('me_profile_currentStudies_yearOfIntake').value)">Next</button>
        
        </div>
    </form>
    </dialog>`

    if ((back && !(studyProgram == "----" || yearOfIntake == "----")) || (studyProgram == "----" || yearOfIntake == "----")) {
        let tempconfig = JSON.parse(JSON.stringify(config))
        if (typeof tempconfig.profile == "undefined") tempconfig.profile = {}
        if (typeof tempconfig.profile.currentStudies == "undefined") tempconfig.profile.currentStudies = {}
        tempconfig.profile.currentStudies.studyProgram = studyProgram
        tempconfig.profile.currentStudies.yearOfIntake = yearOfIntake
        document.getElementById("profile_new_dialog_content").innerHTML = `
        <p2>
        ` + (signinlevel >= 1 ? `It looks like this is your first time visiting ` + window.location.host + `<br>Create a profile to get personalized recommendations just for you!<br><br>` : ``) + `
        ` + generate_new_profile_selHTML(JSON.parse(JSON.stringify(tempconfig)), false) + `
        </p2>`
        document.getElementById("profile_new_dialog").showModal()
    } else if ((back && !((!mm.length || mm[0] == "----"))) || ((!mm.length || mm[0] == "----") && !skip)) {
        document.getElementById("profile_new_dialog_buttons").innerHTML = `
            <button id="security_dialog_backBtn" onclick="create_new_profile('` + studyProgram + `', '` + yearOfIntake + `', ` + JSON.stringify(mm).replaceAll('"', "'") + `, true)">Back</button>
            <div>
                <button style="display:none" id="security_dialog_confirmBtn" onclick="create_new_profile('` + studyProgram + `', '` + yearOfIntake + `', [], false, true)">Skip</button>
                <button id="security_dialog_confirmBtn" onclick="create_new_profile('` + studyProgram + `', '` + yearOfIntake + `', [document.getElementById('mmsel-0').value])">Next</button>
            </div>
        `
        document.getElementById("profile_new_dialog_content").innerHTML = `<p2>Please choose your first major</p2><br><p4>If you don't have one yet, select the one you want</p4><br><br><div id="major_select_cont"><div id="d_loading"></div></div>`
        fetch("/!plan/20" + yearOfIntake.substring(0, 2) + "/?majoronly=true").then(r => r.json()).then(r => {
            if (r.status != 200) { document.getElementById("major_select_cont").innerHTML = `no major data avaliable`; return }
            let mmdraft = "", majoronly = r.resp

            mmdraft += `<select id="mmsel-0">`
            mmdraft += `<option value="----" selected disabled>----</option>`
            majoronly.forEach(mm => {
                mmdraft += `<option value="` + mm + `">` + mm + `</option>`
            })
            mmdraft += `</select><br>`

            document.getElementById("major_select_cont").innerHTML = mmdraft

        }).catch(e => {
            console.log(e)
            document.getElementById("major_select_cont").innerHTML = `failed to contact server or script crashed`
            return
        })
        document.getElementById("profile_new_dialog").showModal()
    } else {
        document.getElementById("profile_new_dialog").close()
        config = {
            profile: {
                currentStudies: {
                    studyProgram: studyProgram,
                    yearOfIntake: yearOfIntake,
                    mm: mm
                }
            },
            courses: {
            }
        }
        if (signinlevel >= 1) {
            update_config("profile", config.profile, () => {
                update_config("courses", config.courses, () => {
                    create_new_profile_cb()
                })
            })
        } else {
            signinlevel = 0.1
            if (localStorage) {
                localStorage.clear()
                Object.keys(config).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(config[key]))
                })
            }
            create_new_profile_cb()
        }
    }

}

function check_course_exists(code, sem, cb) {
    if (typeof config.courses[code] != "undefined" && typeof config.courses[code][sem] != "undefined") { cb(true); return }
    fetch("/!course/" + sem + "/" + code.substring(0, 4) + "/" + code + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { cb(false); return }
        cb(true)
    })
}

var add_course_search_history = ""

function add_course(back = false, course = {}) {
    document.getElementById("add_course_model").innerHTML = `<dialog id="add_course_dialog">
    <form id="add_course_dialog_form" action="javascript:void(0)" onsubmit="return false">
        <div class="flx" style="gap:1em;flex-wrap: wrap-reverse;">
            <h4 id="add_course_title">Add Course</h4>
            <button value="cancel" formmethod="dialog" class="closebtn" onclick="document.getElementById('add_course_dialog').close()"><img src="` + resourceNETpath + `image/circle-cross.png" title="Close"></button>
        </div><br>

        <div id="add_course_dialog_content">
        </div>

        <div id="add_course_dialog_buttons" class="flx">
        </div>
    </form>
    </dialog>`

    let contentDiv = document.getElementById("add_course_dialog_content")
    let buttonDiv = document.getElementById("add_course_dialog_buttons")

    if (!Object.keys(course).length || back) {
        contentDiv.innerHTML = `<div class="flx" style="gap:0.5em; margin:0.5em 0"><label for="search_dw_box">
        <img alt="Search" src="` + resourceNETpath + `image/search.png" draggable="false" style="vertical-align: middle;object-fit: contain;width: 2rem;height: 2rem;cursor: pointer;user-select: none;-webkit-touch-callout: none;"></label><p3 id="digsrtxt">Search</p3>
        <input autofocus autocomplete="off" id="search_dw_boxX" name="dw" type="search" placeholder="Search for courses" value="" title="Search" onkeypress="if ((event.charCode || event.keyCode || 0) == 13) event.preventDefault();" onkeyup="
            let nc = document.getElementById('search_dw_boxX').value;
            if (!nc) {document.getElementById('search_result').innerHTML = startSearchingHTML; add_course_search_history = nc; return false}; 
            if (nc != add_course_search_history) {render_search('', nc, true); add_course_search_history = nc; return false}
        "></form></div>
        <style>@media (min-width:800px) {dialog #search_result {max-height:35em}}</style>
        <div id="search_result" style="width:45em;max-width:100%;min-height:17.5em;overflow:scroll">`+ startSearchingHTML + `</div>`
        buttonDiv.innerHTML = ``

    } else if (Object.keys(course).length) {
        let newConfig = JSON.parse(JSON.stringify(config)), rawCourse = JSON.parse(JSON.stringify(course))
        if (typeof newConfig.courses === "undefined") newConfig.courses = {}
        if (typeof newConfig.courses[course.code] === "undefined") newConfig.courses[course.code] = {}

        if (typeof newConfig.courses != "undefined" && typeof newConfig.courses[course.code] != "undefined" && Object.keys(newConfig.courses[course.code]).includes(course.sem)) {
            course = mergeExisting(newConfig.courses[course.code][course.sem], course)
            course.existsinconfig = true
            document.getElementById("add_course_title").innerText = "Edit Course"
        }

        if (typeof course.actual_cred == "undefined") course.actual_cred = course.units

        contentDiv.innerHTML = `
            Course: <input readonly name="code" type="text" value="` + course.code + `"><br>
            Name: <input readonly name="name" type="text" value="` + course.name + `"><br>
            Semester: <select id="course_update_sem" name="sem">` + generate_year_of_intake_select(course.sem, true) + `</select><br>
            Grade: <select name="grade">` + generate_grade_selection((course.existsinconfig ? course.grade : "----"), []) + `</select><br>
            <br><h4>Extra</h4><br>
            <input type="checkbox" id="is_SPO" name="is_SPO" value="Yes" ` + (course.is_SPO ? "checked" : "") + `> <label for="is_SPO"> [SPO] Self-Paced Online Learning</label><br>
            Actual credit: <input name="actual_cred" type="number" min="0" value="` + course.actual_cred + `"><br>
            Total credit: <input name="units" type="number" min="0" value="` + course.units + `"><br>
            <div class="box" style="display:none">
                <p2>Lec: </p2><br>
                <p2>Lab: </p2><br>
                <p2>Tut: </p2><br>
                <p2>Rsh: </p2><br>
            </div>
            <br>`

        document.getElementById("course_update_sem").onchange = () => { rawCourse.sem = document.getElementById("course_update_sem").value; add_course(false, rawCourse) }

        buttonDiv.innerHTML = ((course.existsinconfig ? `
            <button id="security_dialog_confirmBtn" onclick="submitCourseUpdate(true)">Remove</button>
            <button id="security_dialog_confirmBtn" onclick="submitCourseUpdate(false)">Save</button>
            ` : `
            <br>
            <button id="security_dialog_confirmBtn" onclick="submitCourseUpdate(false)">Add</button>
        `))
    }

    document.getElementById("add_course_dialog").showModal()
}

function generate_new_profile_selHTML(configTemp, onChangeScript = true) {
    if (typeof configTemp.profile === "undefined") configTemp.profile = {}
    if (typeof configTemp.profile.currentStudies === "undefined") configTemp.profile.currentStudies = {}
    return `<div>
    <div class="flx" style="gap:0.5em;margin:0.25em 0;max-width:20em">
    <p2>Study Program: </p2>
    <select id="me_profile_currentStudies_studyProgram" name="me_profile_currentStudies_studyProgram"` + (onChangeScript ? ` onchange="updateProfile('currentStudies', 'studyProgram', document.getElementById('me_profile_currentStudies_studyProgram').value)"` : ``) + `>
        <option disabled value="" ` + ((typeof configTemp.profile.currentStudies.studyProgram === "undefined" || !(configTemp.profile.currentStudies.studyProgram === "UG" || configTemp.profile.currentStudies.studyProgram === "PG")) ? "selected" : "hidden") + `>----</option>
        <option value="UG"` + ((typeof configTemp.profile.currentStudies.studyProgram != "undefined" && configTemp.profile.currentStudies.studyProgram === "UG") ? " selected" : "") + `>Undergraduate</option>
        <option value="PG"` + ((typeof configTemp.profile.currentStudies.studyProgram != "undefined" && configTemp.profile.currentStudies.studyProgram === "PG") ? " selected" : "") + `>Postgraduate</option>
    </select>
    </div>
    <div class="flx" style="gap:0.5em;margin:0.25em 0;max-width:20em">
    <p2>Year of Intake: </p2>
    <select id="me_profile_currentStudies_yearOfIntake" name="me_profile_currentStudies_yearOfIntake"` + (onChangeScript ? ` onchange="updateProfile('currentStudies', 'yearOfIntake', document.getElementById('me_profile_currentStudies_yearOfIntake').value)"` : ``) + `>
        ` + generate_year_of_intake_select((typeof configTemp.profile.currentStudies.yearOfIntake === "undefined") ? "" : configTemp.profile.currentStudies.yearOfIntake) + `
    </select>
    </div>
    </div>`
}

function render_me(path) {
    document.title = "Me - uni"
    if (signinlevel <= 0) {
        me_wrp.innerHTML = `<div class="edge2edge_page">
        <p2>Please sign in first!
        <br><div id="profile_new_model"></div><br>
        ...or continue with a 
        <button onclick="create_new_profile_cb = () => {reboot()}; create_new_profile()">
            Guest Profile
        </button>
        , this temporary profile ` + ((localStorage) ? "" : " will be wiped when you close or refresh your browser, and ") + `is not migratable when you sign in later
        </p2>
        </div>`
        return
    }

    let paths = path.split("/")
    switch (paths[0]) {
        case "":
            me_wrp.innerHTML = `<div class="edge2edge_page" style="padding-bottom:0">
            <button onclick="boot('/me/', false, 1)">home</button>
            <button onclick="boot('/me/course/', false, 1)">my courses</button>
            <button onclick="boot('/me/profile/', false, 1)">my profile</button>
            </div>

            <div class="edge2edge_page">
                <h3>Welcome back!</h3><br>
                ` + ((signinlevel < 1) ? `<div class="box">[!] You are using a Guest Profile, this temporary profile ` + ((localStorage) ? "" : " will be wiped when you close or refresh your browser, and ") + `is not migratable when you sign in later<br><br>
                    <button onclick="config = {}; signinlevel = 0; if (localStorage) {localStorage.clear()}; reboot(); setTimeout(() => alert('Guest Profile Deleted'), 1)">delete this profile now</button></div><br>` : "") + `
                <div class="flx">
                    <div class="selbox" onclick="boot('/me/course/', false, 1)" style="flex-grow:1">
                        <h4>My Courses</h4><br><br>
                        <div style="text-align:right"><p2 class="acss aobh">View My Courses →</p2></div>
                    </div>
                    <div class="selbox" onclick="boot('/me/profile/', false, 1)" style="flex-grow:1">
                        <h4>My Profile</h4><br><br>
                        <div style="text-align:right"><p2 class="acss aobh">View My Profile →</p2></div>
                    </div>
                </div>
            </div>`
            break

        case "profile":
            document.title = "My Profile - uni"
            me_wrp.innerHTML = `<div class="edge2edge_page" style="padding-bottom:0;background:var(--bw)">
            <button onclick="boot('/me/', false, 1)">home</button>
            <button onclick="boot('/me/course/', false, 1)">my courses</button>
            <button onclick="boot('/me/profile/', false, 1)">my profile</button>
            </div>
            ` + renderTopBar("My Profile", '', '', false, '', false, "", false) + `
            <div class="edge2edge_page">

            <div class="box">
                <h4>Current Studies</h4><br>
                <div id="me_profile_currentStudies"></div>
            </div>

            <div class="box">
                <h4>Special Approvals</h4><br>
                <div id="me_profile_specialApproval"></div>
            </div>

            <div class="box">
                <h4>Past Qualifications</h4><br>
                <div id="me_profile_pastQuali"></div>
            </div>

            </div>`

            setLoadingStatus("hide")

            let htmlp = ""
            let currentStudiesHTML = document.getElementById("me_profile_currentStudies")
            let pastQualiHTML = document.getElementById("me_profile_pastQuali")
            let specialApprovalHTML = document.getElementById("me_profile_specialApproval")

            if (typeof config.profile === "undefined") config.profile = {}
            let configTemp = JSON.parse(JSON.stringify(config))
            configTemp.profile = mergeExisting({
                currentStudies: {
                    studyProgram: "",
                    yearOfIntake: ""
                },
                pastQuali: {
                    HKDSE: {
                        "Chinese Language": {
                            "Reading": "",
                            "Writing": "",
                            "Listening": "",
                            "Speaking": ""
                        },
                        "English Language": {
                            "Reading": "",
                            "Writing": "",
                            "Listening": "",
                            "Speaking": ""
                        },
                        "Mathematics (Compulsory Part)": "",
                        "Liberal Studies": "",
                        "Mathematics Extended Part (M1: Calculus and Statistics)": "",
                        "Mathematics Extended Part (M2: Algebra and Calculus)": "",
                        "Biology": "",
                        "Business, Accounting and Financial Studies": "",
                        "Business, Accounting and Financial Studies (Accounting)": "",
                        "Business, Accounting and Financial Studies (Business Management)": "",
                        "Chemistry": "",
                        "Chinese History": "",
                        "Chinese Literature": "",
                        "Combined Science (Chemistry + Biology)": "",
                        "Combined Science (Physics + Biology)": "",
                        "Combined Science (Physics + Chemistry)": "",
                        "Design and Applied Technology": "",
                        "Economics": "",
                        "Ethics and Religious Studies": "",
                        "Geography": "",
                        "Health Management and Social Care": "",
                        "History": "",
                        "Information and Communication Technology": "",
                        "Integrated Science": "",
                        "Literature in English": "",
                        "Music": "",
                        "Physical Education": "",
                        "Physics": "",
                        "Technology and Living (Fashion, Clothing and Textiles)": "",
                        "Technology and Living (Food Science and Technology)": "",
                        "Tourism and Hospitality Studies": "",
                        "Visual Arts": ""
                    }
                },
                specialApprovals: {
                    selfDeclear: [

                    ]
                }
            }, config.profile)

            htmlp += generate_new_profile_selHTML(configTemp)

            htmlp += `<textarea id="configTemp" style="display:none">` + JSON.stringify(configTemp) + `</textarea>`

            currentStudiesHTML.innerHTML = htmlp
            htmlp = ""

            let dseTemplate = `<div class="flx" style="gap:0.5em;align-items:flex-end">`
            Object.keys(configTemp.profile.pastQuali.HKDSE).forEach((subject, i) => {
                if (typeof configTemp.profile.pastQuali.HKDSE[subject] === "object") {
                    dseTemplate += `<div class='flx' style="align-items:baseline;gap:0.5em;border-bottom:0.15em dotted #8882;padding-bottom:0.5em;width:calc(50% - 0.5em);` + ((i % 1) ? "background-color:#8882" : "") + `"><p2><b> ` + subject + `</b></p2><div style="flex-grow:1">`;
                    ["Overall", ...Object.keys(configTemp.profile.pastQuali.HKDSE[subject]).filter(a => a != "Overall")].forEach((subsubject, j) => {
                        let mval = (typeof configTemp.profile.pastQuali.HKDSE[subject][subsubject] != "undefined") ? configTemp.profile.pastQuali.HKDSE[subject][subsubject] : ""
                        dseTemplate += `<div class='flx' style="justify-content:flex-end;gap:0.5em;padding:0.25em 0;width:100%">` + ((j) ? (`<p2>` + subsubject + `</p2>`) : (`<p2><b>` + subsubject + `</b></p2>`)) + `
                        <select style="max-width:15em;min-width:7.5em" id="me_profile_pastQuali_HKDSE_` + subject.replaceAll(" ", "") + "_" + subsubject.replaceAll(" ", "") + `" name="me_profile_pastQuali_HKDSE_` + subject.replaceAll(" ", "") + `" onchange="
                            let configTemp = JSON.parse(document.getElementById('configTemp').innerHTML);
                            configTemp.profile.pastQuali.HKDSE['` + subject + `']['` + subsubject + `'] = document.getElementById('me_profile_pastQuali_HKDSE_` + subject.replaceAll(" ", "") + "_" + subsubject.replaceAll(" ", "") + `').value;
                            document.getElementById('configTemp').innerHTML = JSON.stringify(configTemp);
                            Object.keys(configTemp.profile.pastQuali.HKDSE).forEach(a => {
                                if (typeof configTemp.profile.pastQuali.HKDSE[a] === 'object') {
                                    Object.keys(configTemp.profile.pastQuali.HKDSE[a]).forEach(b => {
                                        if (typeof configTemp.profile.pastQuali.HKDSE[a][b] != 'object' && !configTemp.profile.pastQuali.HKDSE[a][b]) delete configTemp.profile.pastQuali.HKDSE[a][b]
                                    })
                                    if (!Object.keys(configTemp.profile.pastQuali.HKDSE[a]).length) delete configTemp.profile.pastQuali.HKDSE[a]
                                } else {
                                    if (!configTemp.profile.pastQuali.HKDSE[a]) delete configTemp.profile.pastQuali.HKDSE[a]
                                }
                            })
                            updateProfile('pastQuali', 'HKDSE', configTemp.profile.pastQuali.HKDSE);
                        ">
                            <option value="" ` + ((!["5**", "5*", "5", "4", "3", "2", "1", "U"].includes(mval)) ? " selected" : "") + `> </option>
                            <option value="5**"` + ((mval === "5**") ? " selected" : "") + `>5**</option>
                            <option value="5*"` + ((mval === "5*") ? " selected" : "") + `>5*</option>
                            <option value="5"` + ((mval === "5") ? " selected" : "") + `>5</option>
                            <option value="4"` + ((mval === "4") ? " selected" : "") + `>4</option>
                            <option value="3"` + ((mval === "3") ? " selected" : "") + `>3</option>
                            <option value="2"` + ((mval === "2") ? " selected" : "") + `>2</option>
                            <option value="1"` + ((mval === "1") ? " selected" : "") + `>1</option>
                            <option value="U"` + ((mval === "U") ? " selected" : "") + `>U</option>
                        </select></div>`
                    })
                    dseTemplate += `</div></div>`

                } else {
                    let mval = (typeof configTemp.profile.pastQuali.HKDSE[subject] != "undefined") ? configTemp.profile.pastQuali.HKDSE[subject] : ""
                    dseTemplate += `<div class='flx' style="gap:0.5em;border-bottom:0.15em dotted #8882;padding-bottom:0.5em;width:calc(50% - 0.5em);` + ((i % 1) ? "background-color:#8882" : "") + `"><p2><b> ` + subject + `</b></p2>
                        <select style="max-width:15em;min-width:7.5em" id="me_profile_pastQuali_HKDSE_` + subject.replaceAll(" ", "") + `" name="me_profile_pastQuali_HKDSE_` + subject.replaceAll(" ", "") + `" onchange="
                            let configTemp = JSON.parse(document.getElementById('configTemp').innerHTML); 
                            configTemp.profile.pastQuali.HKDSE['` + subject + `'] = document.getElementById('me_profile_pastQuali_HKDSE_` + subject.replaceAll(" ", "") + `').value;
                            document.getElementById('configTemp').innerHTML = JSON.stringify(configTemp);
                            Object.keys(configTemp.profile.pastQuali.HKDSE).forEach(a => {
                                if (typeof configTemp.profile.pastQuali.HKDSE[a] === 'object') {
                                    Object.keys(configTemp.profile.pastQuali.HKDSE[a]).forEach(b => {
                                        if (typeof configTemp.profile.pastQuali.HKDSE[a][b] != 'object' && !configTemp.profile.pastQuali.HKDSE[a][b]) delete configTemp.profile.pastQuali.HKDSE[a][b]
                                    })
                                    if (!Object.keys(configTemp.profile.pastQuali.HKDSE[a]).length) delete configTemp.profile.pastQuali.HKDSE[a]
                                } else {
                                    if (!configTemp.profile.pastQuali.HKDSE[a]) delete configTemp.profile.pastQuali.HKDSE[a]
                                }
                            })
                            updateProfile('pastQuali', 'HKDSE', configTemp.profile.pastQuali.HKDSE);
                        ">
                            <option value="" ` + ((!["5**", "5*", "5", "4", "3", "2", "1", "U"].includes(mval)) ? " selected" : "") + `> </option>
                            <option value="5**"` + ((mval === "5**") ? " selected" : "") + `>5**</option>
                            <option value="5*"` + ((mval === "5*") ? " selected" : "") + `>5*</option>
                            <option value="5"` + ((mval === "5") ? " selected" : "") + `>5</option>
                            <option value="4"` + ((mval === "4") ? " selected" : "") + `>4</option>
                            <option value="3"` + ((mval === "3") ? " selected" : "") + `>3</option>
                            <option value="2"` + ((mval === "2") ? " selected" : "") + `>2</option>
                            <option value="1"` + ((mval === "1") ? " selected" : "") + `>1</option>
                            <option value="U"` + ((mval === "U") ? " selected" : "") + `>U</option>
                        </select>
                    </div>`
                }
            })
            dseTemplate += `</div>`

            let selfDeclearTemplate = `<div>`
            if (configTemp.profile.specialApprovals.selfDeclear.length) {
                configTemp.profile.specialApprovals.selfDeclear.forEach((item, i) => {
                    let snote = rndStr()
                    selfDeclearTemplate += `<div class='flx' style="gap:0.5em;padding:1em;border-radius:1em;width:calc(100% - 2em);` + ((i % 2) ? "" : "background-color:#ccc1") + `">
                    <p2> ` + item + `</p2>
                    <button onclick="
                        xm = document.getElementById('aprvtext-` + snote + `').innerText;
                        updateProfile('specialApprovals', 'selfDeclear', config.profile.specialApprovals.selfDeclear.filter(a => a != xm), () => {
                            if (typeof config.profile.specialApprovals.selfDeclearMapping == 'undefined' || typeof config.profile.specialApprovals.selfDeclearMapping[xm] == 'undefined') {
                                reboot();
                                return
                            }

                            delete config.profile.specialApprovals.selfDeclearMapping[xm]
                            updateProfile('specialApprovals', 'selfDeclearMapping', config.profile.specialApprovals.selfDeclearMapping, () => {
                                reboot()
                            })
                        })">delete</button>
                    <textarea id="aprvtext-` + snote + `" style="display:none"></textarea>
                    </div>`
                    setTimeout(() => document.getElementById("aprvtext-" + snote).innerText = item, 100)
                })
            } else {
                selfDeclearTemplate += `<p2>No records found</p2>`
            }
            selfDeclearTemplate += `</div>`



            specialApprovalHTML.innerHTML = `<div><p2>
            <b>Cleared Requirements</b></p2><br>
            <p3>Since some requirements are hard to parse and automatically checked, here are a list of requirements that you have decleared as cleared and passed.</p3><br><br>
            ` + selfDeclearTemplate + `
            <div style="opacity:0.3;display:none"><hr>
            <b>Others (Coming soon)</b><br><br>
            Requisites Waiver<br>
            Cross-career (UG/PG) Enrollment<br>
            Instructor's Consent<br>
            Credit Overload<br>
            <br>
            [RR-8]/[RR-8a] Application for Leave from Study (UG)/(PG)<br>
            [RR-31] Application for Extension of Study (UG)<br>
            [GR-23] Application for Deviation from Curriculum (UG)<br>
            <!-- [GR-27] Application for Course Substitution / Deviation from Curriculum (PG)<br> -->
            </div>
            </p2></div>`

            pastQualiHTML.innerHTML = `<div><p2>
            <b>HKDSE</b><br><br>
            ` + dseTemplate + `
            <div style="opacity:0.3;display:none">
            <b>Others (Coming soon)</b><br><br>
            HKALE<br>
            HKASLE<br>
            HKCEE<br>
            IELTS<br>
            GCE-A<br>
            JEE<br>
            </div>
            </p2></div>`

            break

        case "course":
            document.title = "My Courses - uni"
            me_wrp.innerHTML = `<div class="edge2edge_page" style="padding-bottom:0;background:var(--bw)">
            <button onclick="boot('/me/', false, 1)">home</button>
            <button onclick="boot('/me/course/', false, 1)">my courses</button>
            <button onclick="boot('/me/profile/', false, 1)">my profile</button>
            </div>
            <div class="edge2edge_page" style="padding-bottom:0;background:var(--bw)">
            <h3>My Courses</h3>
            <div id="titlecard_subtitle"></div>
            </div>
            
            <div id="my_courses">
                ` + renderTopBar(`...`, " ", `<div><button onclick="add_course()">add course</button><div id="add_course_model"></div></div>`, false, "", false, "", true) + `
                <div id="my_courses_content"></div>
                <div id="course_enroll_model"></div>
            </div>`

            let htmld = "", total_cred = 0, total_passed_cred = 0, total_gpacred = 0, total_grade_points = 0
            if (typeof config.courses === "undefined" || Object.keys(config.courses).length === 0) {
                htmld = `<div class="edge2edge_page"><p2>No courses found!</p2></div>`
            } else {
                let semsdb = {}

                Object.keys(config.courses).forEach(course => {
                    Object.keys(config.courses[course]).forEach(sem => {
                        if (typeof semsdb[sem] === "undefined") semsdb[sem] = {}
                        semsdb[sem][course] = config.courses[course][sem]
                    })
                })

                Object.keys(semsdb).sort().reverse().forEach(sem => {
                    let mhtmld = "", gpacred = 0, total_term_cred = 0, termcredload = 0, gpasum = 0, haveunfilled = false
                    Object.keys(semsdb[sem]).forEach(course => {
                        let cred = parseInt(semsdb[sem][course].units)
                        let actualcred = cred
                        if (typeof semsdb[sem][course].actual_cred != "undefined") actualcred = parseInt(semsdb[sem][course].actual_cred)
                        mhtmld += generate_course_selbox(
                            course,
                            semsdb[sem][course].name,
                            sem,
                            cred,
                            `` + ((semsdb[sem][course].grade === "----") ? (`<style>#` + course.replace(" ", "") + `{border:0.25em solid #fffc;margin:0.25em}</style><h5 class="textbox" style="background:#fffc;color:#333">`) : (`<h5 class="textbox">`)) + semsdb[sem][course].grade + `</h5><h5 style="opacity:0.85">` + ((actualcred != cred) ? ("" + actualcred + " of ") : "") + semsdb[sem][course].units + ` unit` + ((semsdb[sem][course].units === "1") ? '' : 's') + `</h5>`,
                            true,
                            (course, name, sem, units) => {
                                let coursen = course.replaceAll(" ", ""); return `setLoadingStatus('show'); check_course_exists('` + coursen + `', '` + sem + `', (exist) => {
                                if (exist) {
                                    boot('/course/` + sem + `/` + coursen.substring(0, 4) + '/' + coursen + `/', false, 2)
                                } else {
                                    setLoadingStatus('hide');
                                    add_course(false, {'code': '` + course + `', 'name': '` + name + `', 'sem': '` + sem + `', 'units': '` + units + `'})
                                }
                            })`},
                        )
                        total_term_cred += actualcred
                        total_cred += actualcred
                        termcredload += actualcred
                        if (semsdb[sem][course].grade === "----") {
                            haveunfilled = true
                            return
                        };
                        ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].forEach((grade, index) => {
                            if (semsdb[sem][course].grade === grade) {
                                gpacred += cred
                                total_gpacred += cred
                                if (grade != "F") total_passed_cred += cred
                                gpasum += ([4.3, 4, 3.7, 3.3, 3, 2.7, 2.3, 2, 1.7, 1, 0][index]) * cred
                                total_grade_points += ([4.3, 4, 3.7, 3.3, 3, 2.7, 2.3, 2, 1.7, 1, 0][index]) * cred
                            }
                        })
                        if (["P", "T", "CR", "DI", "DN", "PA", "PS"].includes(semsdb[sem][course].grade)) {
                            total_passed_cred += cred
                            if (semsdb[sem][course].grade === "T") termcredload -= actualcred
                        }
                        if (["AU", "W"].includes(semsdb[sem][course].grade)) {
                            total_term_cred -= actualcred
                            total_cred -= actualcred
                            if (semsdb[sem][course].grade === "W") termcredload -= actualcred
                        }
                    })
                    htmld += `<div class="edge2edge_page"><div class="flx"><h3>` + ustTimeToString(sem) + `</h3><div class="flx" style="gap:0.5em">` + ((gpacred) ? (`<h5>TGA <span class="textbox"` + (haveunfilled ? ` title="There are courses missing grade information">⌛ ` : ">") + (gpasum / gpacred).toFixed(3) + `</span></h5>`) : "") + ((termcredload != total_term_cred) ? (`<h5>Actual Credit Load <span class="textbox" title="The actual credit load after deducting transferred credits">` + termcredload + `</span></h5>`) : "") + `<h5>Credits <span class="textbox">` + total_term_cred + `</span></h5></div></div><div class="flx">` + mhtmld + `</div></div>`
                })
            }
            let courseSum = `<div class="flx" style="gap:0.5em;width:fit-content">` + ((total_gpacred) ? (`<h5>CGA <span class="textbox">` + (total_grade_points / total_gpacred).toFixed(3) + `</span></h5>`) : "") + `<h5>Passed Credits <span class="textbox">` + total_passed_cred + `</span></h5><h5>Total Credits <span class="textbox">` + total_cred + `</span></h5></div>`

            document.getElementById("titlecard_subtitle").innerHTML = `<div class="only_mobile" style="padding:0.25em 0"><br>` + courseSum + `</div>`
            document.getElementById("topbar_title").innerHTML = `<div class="no_mobile" style="padding:0.25em 0">` + courseSum + `</div>`
            document.getElementById("my_courses_content").innerHTML = htmld

            setLoadingStatus("hide")
            break
    }
}

function generate_year_of_intake_select(selection = "", full = false) {
    let years = [], pyears = []
    if (!selection) {
        years.push("----")
    }
    for (let y = (new Date().getFullYear()); y > (new Date().getFullYear()) - 7; y--) {
        if (full) pyears.push("" + ((y - 2000) * 100 + 40))
        pyears.push("" + ((y - 2000) * 100 + 30))
        if (full) pyears.push("" + ((y - 2000) * 100 + 20))
        pyears.push("" + ((y - 2000) * 100 + 10))
    }
    if (selection && !pyears.includes(selection)) {
        years.push(selection)
    }
    pyears.forEach(y => years.push(y))

    let prevSem = "----", draft = ""
    years.forEach(sem => {
        let thisSem = ustTimeToString(sem, true)
        if (thisSem.split(" ")[0] != prevSem) {
            if (prevSem != '----') draft += `</optgroup>`
            draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
            prevSem = thisSem.split(" ")[0]
        }
        draft += `<option value="` + sem + `"`
        if (sem == selection) {
            draft += " selected"
        }
        draft += `>` + ustTimeToString(sem, true) + `</option>`
    })
    draft += `</optgroup>`

    return draft
}

function updateProfile(category, target, value, cb) {
    try { setLoadingStatus("show") } catch (error) { }
    let configTemp = JSON.parse(JSON.stringify(config))
    if (typeof configTemp.profile === "undefined") configTemp.profile = {}
    if (typeof configTemp.profile[category] === "undefined") configTemp.profile[category] = {}
    configTemp.profile[category][target] = value
    update_config("profile", configTemp.profile, (err) => {
        if (err) { alert(err); console.log(err); return }
        //alert("Profile updated!")
        setTimeout(() => {
            if (cb) cb()
            setLoadingStatus("success", false, "Profile updated")
        }, 10)
    })
}

function update_config(newKey = "", newVal = "", cb = (err) => { }) {
    if (signinlevel <= 0) {
        cb("not-signed-in")
        return
    }
    if (signinlevel < 1) {
        if (newKey) {
            config[newKey] = newVal
            if (localStorage) {
                localStorage.setItem(newKey, JSON.stringify(newVal))
            }
        }
        apply_config()
        cb()
        return
    }
    if (!newKey && !newVal) {
        fetch("/!acc/config/").then(r => r.json()).then(r => {
            if (r.status === 200) {
                config = r.resp
                apply_config()
            }
            cb()
        }).catch(error => {
            console.log(error)
            cb(err)
        })
    } else {
        post("/!acc/config/", { [newKey]: newVal }).then(r => r.json()).then(r => {
            if (r.status === 200) {
                config = r.resp
                apply_config()
            }
            cb()
        }).catch(error => {
            console.log(error)
            cb(err)
        })
    }
}

function apply_config() {
    if (typeof config.studprog != "undefined") {
        studprog = config.studprog
    }
    if (typeof config.listMode != "undefined") {
        listMode = config.listMode
    }
}

function wait_allSems(cb, path, title) {

    document.title = title

    if (allSemsF.length) { allSems = JSON.parse(JSON.stringify(allSemsF)); setOverlayStatus("hide", false, "cover"); cb(path); return }

    fetch("/!course/").then(r => r.json()).then(r => {
        if (r.status != 200 || !r.resp.length) {
            document.getElementById("core").innerHTML = `
            <div class="edge2edge_page">
                <h2>Oops</h2><br>
                <p3>It seems that there are nothing we can show to you at the moment. Try coming back later.</p3>
            </div>
            `
            return
        }
        allSemsF = r.resp
        allSems = JSON.parse(JSON.stringify(allSemsF))

        fetch("/!acc/config/").then(r => r.json()).then(r => {
            if (r.status === 200) {
                config = r.resp
            }
            if (typeof config.profile == "undefined" && signinlevel >= 1) {
                document.body.innerHTML += `<div id="profile_new_model"></div>`
                create_new_profile_cb = () => { reboot() }
                create_new_profile()
            }
            cb(path)
        }).catch(error => {
            console.log(error)
            cb(path)
        }).finally(() => {
            if (localStorage.getItem("profile")) {
                signinlevel = 0.1
                for (var i = 0, len = localStorage.length; i < len; ++i) {
                    config[localStorage.key(i)] = JSON.parse(localStorage.getItem(localStorage.key(i)))
                }
            }
            setOverlayStatus("hide", true, "cover")
        })

    }).catch(error => {
        console.log(error)
        document.getElementById("core").innerHTML = `
        <div class="edge2edge_page">
            <h2>Oops</h2><br>
            <p3>Connect to the internet, and then refresh the page.</p3>
        </div>
        `
        setOverlayStatus("hide", true, "cover")
    }).finally(() => {
        if (localStorage.getItem("profile")) {
            signinlevel = 0.1
            for (var i = 0, len = localStorage.length; i < len; ++i) {
                config[localStorage.key(i)] = JSON.parse(localStorage.getItem(localStorage.key(i)))
            }
        }
        setOverlayStatus("hide", false, "cover")
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

function approval_course_selbox(snote, mnote) {
    let d = `
    <dialog id="approval_course_selbox_dialog_` + snote + `">
    <form id="approval_course_selbox_dialog_form" action="javascript:void(0);">
        <div class="flx" style="gap:1em; flex-wrap: wrap-reverse;">
            <div>
                <h4>Any courses used to fulfill this requirement?</h4>
                <p3>This is used to calculate related data like MCGA.</p3>
            </div>
            <button value="cancel" formmethod="dialog" class="closebtn"><img src="` + resourceNETpath + `image/circle-cross.png" title="Close" onclick="document.getElementById('aprvswitch-` + snote + `').checked = false"></button>
        </div>

        <div id="approval_course_selbox_dialog_content">
            <p2><div class="box" id="approval_course_selbox_string_` + snote + `"></div></p2>`

    if (typeof config.courses == "undefined" || Object.keys(config.courses).length == 0) {
        d += "No courses found!"
    } else {
        //create a list of checkbox to select courses of each semester using HTML
        let semsdb = {}
        Object.keys(config.courses).forEach(course => {
            Object.keys(config.courses[course]).forEach(sem => {
                if (typeof semsdb[sem] === "undefined") semsdb[sem] = {}
                semsdb[sem][course] = config.courses[course][sem]
            })
        })
        //console.log(semsdb)
        Object.keys(semsdb).sort().reverse().forEach(sem => {
            let mhtmld = ``, unote = rndStr()
            Object.keys(semsdb[sem]).sort().forEach(course => {
                mhtmld += `<div class="flx" style="gap:0.5em;justify-content:flex-start;align-items:flex-start;margin:0.5em 0">
                <input 
                    style="flex-grow:unset" 
                    onchange="
                        document.getElementById('aprvcourse-titlecount-` + sem + `').innerText = (0 + parseInt(document.getElementById('aprvcourse-titlecount-` + sem + `').innerText) + (document.getElementById('aprvcourse-` + unote + `-` + course.replaceAll(" ", "") + `').checked ? 1 : -1));
                        if (document.getElementById('aprvcourse-titlecount-` + sem + `').innerText == 0) {
                            document.getElementById('aprvcourse-title-` + sem + `').style.fontWeight = 'unset'
                        } else {
                            document.getElementById('aprvcourse-title-` + sem + `').style.fontWeight = 'bolder'
                        }
                        " 
                    type="checkbox" 
                    id="aprvcourse-` + unote + `-` + course.replaceAll(" ", "") + `" 
                    name="aprvcourse-coursecheckbox-` + snote + `" 
                    value="` + course + `-` + sem + `"
                >
                <label for="aprvcourse-` + unote + `-` + course.replaceAll(" ", "") + `">
                    <p2>` + course + `</p2><br><p3>` + semsdb[sem][course].name + `</p3>
                </label>
                </div>`
            })
            d += `<details><summary style="cursor:pointer"><p2 id="aprvcourse-title-` + sem + `">` + ustTimeToString(sem) + ` - [<span id="aprvcourse-titlecount-` + sem + `">0</span>]</p2></summary><div style="margin:0 1em">` + mhtmld + `</div></details>`
        })
    }

    d += `</div><br>

        <div class="flx">
            <button id="security_dialog_confirmBtn" class="acss aobh" onclick="submit_approval_course('` + snote + `', true, '` + mnote + `')">No courses were used</button>
            <button id="security_dialog_confirmBtn" onclick="submit_approval_course('` + snote + `', false, '` + mnote + `')">Save</button>
        </div>
    </form>
    </dialog>`

    document.getElementById("aprvmodel-" + snote).innerHTML = d
    document.getElementById("aprvmodel-" + snote).querySelectorAll('details').forEach((D, _, A) => { D.ontoggle = _ => { if (D.open) A.forEach(d => { if (d != D) d.open = false }) } })
    document.getElementById('approval_course_selbox_string_' + snote).innerHTML = document.getElementById('aprvtext-' + snote).innerText
    document.getElementById('approval_course_selbox_dialog_' + snote).showModal()
}

function submit_approval_course(snote, noCourse = false, mnote = "") {
    document.getElementById('approval_course_selbox_dialog_' + snote).close()

    let mxc = []
    if (typeof config.profile == "undefined" || typeof config.profile.specialApprovals == "undefined" || typeof config.profile.specialApprovals.selfDeclear == "undefined") {
        mxc = [document.getElementById('aprvtext-' + snote).innerText]
    } else {
        mxc = [...config.profile.specialApprovals.selfDeclear, document.getElementById('aprvtext-' + snote).innerText]
    }

    updateProfile('specialApprovals', 'selfDeclear', mxc, () => {
        let x = document.querySelectorAll('input[name=aprvcourse-coursecheckbox-' + snote + ']:checked')

        if (noCourse || !x.length) {
            reboot(true)
            return
        }

        let mappings = {}
        x.forEach(item => {
            let m = item.value.split("-")
            if (typeof mappings[m[0]] === "undefined") mappings[m[0]] = []
            if (mnote) {
                mappings[m[0]].push([m[1], document.getElementById('mminfo-short-' + mnote).innerText, document.getElementById('mminfo-type-' + mnote).innerText, document.getElementById('mminfo-year-' + mnote).innerText])
            } else {
                mappings[m[0]].push([m[1]])
            }
        })

        let configTemp = JSON.parse(JSON.stringify(config))
        if (typeof configTemp.profile === "undefined") configTemp.profile = {}
        if (typeof configTemp.profile.specialApprovals === "undefined") configTemp.profile.specialApprovals = {}
        if (typeof configTemp.profile.specialApprovals.selfDeclearMapping === "undefined") configTemp.profile.specialApprovals.selfDeclearMapping = {}
        configTemp.profile.specialApprovals.selfDeclearMapping[document.getElementById('aprvtext-' + snote).innerText] = mappings

        updateProfile('specialApprovals', 'selfDeclearMapping', configTemp.profile.specialApprovals.selfDeclearMapping, () => {
            reboot(true)
            return
        })
    })
}

function generate_graph_from_action(json, startName = "Start") {
    let colors = [((json.pass) ? "green" : "red")]
    let pointRadius = [3]
    let pointStyle = [((json.pass) ? "rectRounded" : "circle")]
    let edgeLineBorderWidth = []
    let labels = [startName]
    let data = [
        { name: startName },
    ]

    function recur(json, prevID = 0, prevPass = false, keyName = "", forcegrey = false) {
        let thisID = data.length, thisName = json.action
        if (keyName) thisName = keyName

        switch (json.action) {
            case "not":
                if (!json.array && json.note) json.array = json.note
                break

            case "pass_course":
                thisName = json.course
                break

            case "spread":
                json.array = json.attr.array
                break
        }

        data.push({ name: thisName, parent: prevID })
        labels.push(thisName)
        if (json.pass && !forcegrey) {
            colors.push("green")
            edgeLineBorderWidth.push(1)
            pointRadius.push(3)
            pointStyle.push("circle")
        } else if (forcegrey || prevPass) {
            colors.push("grey")
            edgeLineBorderWidth.push(0.25)
            pointRadius.push(2)
            pointStyle.push("crossRot")
            forcegrey = true
        } else {
            colors.push("#ff3333")
            edgeLineBorderWidth.push(1)
            pointRadius.push(3)
            pointStyle.push("rectRounded")
        }

        switch (json.action) {
            case "spread":
            case "approval":
                forcegrey = true
                break
        }

        if (typeof json.array === "object") {
            if (Array.isArray(json.array)) {
                json.array.forEach(subarray => {
                    recur(subarray, thisID, json.pass, "", forcegrey)
                })
            } else {
                Object.keys(json.array).forEach(key => {
                    recur(json.array[key], thisID, json.pass, key, forcegrey)
                })
            }
        }
    }

    recur(json, 0, json.pass)

    const chart = new Chart(document.getElementById('canvas').getContext('2d'), {
        type: 'tree',
        data: {
            labels: labels,
            datasets: [
                {
                    pointBackgroundColor: colors,
                    pointBorderColor: colors,
                    edgeLineBorderColor: colors.slice(1),
                    edgeLineBorderWidth: edgeLineBorderWidth,
                    pointRadius: pointRadius,
                    pointStyle: pointStyle,
                    pointHoverRadius: 6,
                    data: data
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'nearest',
                axis: 'xy'
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            tree: {
                orientation: "vertical",
            },
        }
    })

    return
}

function generate_html_from_action(json, ignoreMissingAction = false, coursePlanning = false, courseids = {}, mminfo_note = "") {
    //json = JSON.parse(JSON.stringify(json))
    let html = "", htmlsigninpoints = ``, htmldft = ``, htmlcft = ``, bordercolorcss = `style="border:2px solid #8884"`, numPoints = 0, numPassed = 0
    switch (json.action) {
        case "not":
            htmldft = `<h4><small>Not fulfilling:</small></h4>`
            if (!json.array && !json.note) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            if (!json.array && json.note) json.array = json.note
            break;

        case "pass_course":
            htmldft = `<h5>Pass this course:</h5>`
            htmlcft = `<p2>` + json.course + `</p2>`
            if (!json.course) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            if (typeof json.pass == "undefined" && signinlevel > 0 && typeof config.courses != "undefined" && Object.keys(config.courses).includes(json.course)) {
                bordercolorcss = `style="border: 2px solid #8fcc; background-color: #8fc2"`
                json.pass = true
            }
            break;

        case "grade_course":
            htmldft = `<h5>Pass this course:</h5>`
            htmlcft = `<p2>Grade ` + json.grade + ` or above in ` + json.course + `</p2>`
            if (!json.course || !json.grade) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        case "pass_certain_level":
            htmldft = `<h5>Pass this course:</h5>`
            htmlcft = `<p2>Any ` + json.level + `-level or above course from ` + ((json.dept) ? json.dept : json.school) + `</p2>`
            if (!json.level || (!json.dept && !json.school)) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;


        case "CGA":
        case "cga":
            htmldft = `<h5>Attaining minimum CGA:</h5>`
            if (json.cga) {
                htmlcft = `<p2>` + json.cga + `</p2>`
            } else if (json.CGA) {
                htmlcft = `<p2>` + json.CGA + `</p2>`
            } else {
                htmlcft = `<p2>` + json.CGA + `</p2>`
                bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            }
            break;

        case "is_major":
            htmldft = `<h5>Studying in the major of:</h5>`
            htmlcft = `<p2>` + json.major + `</p2>`
            if (!json.major) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        case "is_school":
            htmldft = `<h5>Studying in the school of:</h5>`
            htmlcft = `<p2>` + json.school + `</p2>`
            if (!json.school) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        case "fail_attr":
            htmldft = `<h5>For students without:</h5>`
            htmlcft = `<p2>` + json.target_attr + `</p2>`
            if (!json.target_attr) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        case "spread":
            htmldft = `<h4><small>Fulfill this requirement in each area:</small></h4>`
            if (json.attr.min_course_spread) {
                let mtx = {}
                json.attr.min_course_spread.forEach(item => {
                    if (item) {
                        if (typeof mtx[item] === "undefined") mtx[item] = 0
                        mtx[item]++
                    }
                })
                htmldft += `<div><p2>ℹ️ `
                Object.keys(mtx).sort().reverse().forEach((item, index) => {
                    if (index === 0) {
                        htmldft += `At least `
                    } else if (index === Object.keys(mtx).length - 1) {
                        htmldft += `, and at least `
                    } else {
                        htmldft += `, at least `
                    }
                    htmldft += item + ` course` + ((item === "1") ? "" : "s") + ` in ` + mtx[item] + ` area` + ((mtx[item] === 1) ? "" : "s")
                })
                htmldft += `</p2></div>`
            }
            if (json.attr.min_credit_spread) {
                let mtx = {}
                json.attr.min_credit_spread.forEach(item => {
                    if (item) {
                        if (typeof mtx[item] === "undefined") mtx[item] = 0
                        mtx[item]++
                    }
                })
                htmldft += `<div><p2>ℹ️ `
                Object.keys(mtx).sort().reverse().forEach((item, index) => {
                    if (index === 0) {
                        htmldft += `At least `
                    } else if (index === Object.keys(mtx).length - 1) {
                        htmldft += `, and at least `
                    } else {
                        htmldft += `, at least `
                    }
                    htmldft += item + ` credit` + ((item === "1") ? "" : "s") + ` in ` + mtx[item] + ` area` + ((mtx[item] === 1) ? "" : "s")
                })
                htmldft += `</p2></div>`
            }
            htmlcft = ``
            if (!json.attr || !json.attr.array) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            json.array = json.attr.array
            ignoreMissingAction = true
            break;

        case "pass_qualification":
            htmldft = `<h5>Pass this qualification:</h5>`
            htmlcft = `<p2>Level ` + json.level + ` or above in ` + json.quali.join(" ") + `</p2>`
            if (!json.quali || !json.level) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        case "pass_qualifcation":
            htmldft = `<h5>Pass this qualification:</h5>`
            if (!json.array) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        case "level_DSE":
            if (!json.subject) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            htmldft = `<h5>HKDSE ` + json.subject + `</h5>`
            try {
                delete json.action
                delete json.subject
                delete json.attr
            } catch (error) { }
            if (!Object.keys(json).length) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            Object.keys(json).forEach(key => {
                if (key != "pass" && key != "respattr") {
                    htmlcft += `<p2>` + key + ": " + json[key] + `</p2><br>`
                }
            })
            break;

        case "approval":
            let snote = rndStr()
            //console.log((typeof json.pass == "undefined"), json.pass, snote, config.profile.specialApprovals.selfDeclear, json.note)
            if (typeof json.pass == "undefined" && signinlevel > 0) json.pass = (typeof config.profile != "undefined" && typeof config.profile.specialApprovals != "undefined" && typeof config.profile.specialApprovals.selfDeclear != "undefined" && config.profile.specialApprovals.selfDeclear.includes(json.note))
            let onclickScript = ``
            if (json.pass) {
                onclickScript = `
                    let tgx = document.getElementById('aprvtext-` + snote + `').innerText;
                    updateProfile('specialApprovals', 'selfDeclear', config.profile.specialApprovals.selfDeclear.filter(a => a != tgx), () => {
                        if (typeof config.profile.specialApprovals.selfDeclearMapping != 'undefined' && typeof config.profile.specialApprovals.selfDeclearMapping[tgx] != 'undefined') {
                            delete config.profile.specialApprovals.selfDeclearMapping[tgx]
                            updateProfile('specialApprovals', 'selfDeclearMapping', config.profile.specialApprovals.selfDeclearMapping, () => {
                                reboot(true)
                            })
                        } else {
                            reboot(true)
                        }
                    })`
            } else {
                if (mminfo_note) {
                    onclickScript = `approval_course_selbox('` + snote + `', '` + mminfo_note + `')`
                } else {
                    onclickScript = `approval_course_selbox('` + snote + `')`
                }
            }
            htmldft = `<div id="aprvmodel-` + snote + `"></div><h4><small>Fulfill this requirement:</small></h4>`
            htmlcft = `<p2 id="aprvstr-` + snote + `">` + json.note + `</p2>`
            if (signinlevel > 0) {
                htmlcft += `<div class="flx box-dash" style="justify-content:flex-start;gap:0.5em;padding:0.75em 0 0 0;margin:0.5em 0 0 0">
                    <label class="switch">
                        <input id="aprvswitch-` + snote + `" type="checkbox" ` + (json.pass ? "checked " : "") + `onclick="` + onclickScript + `">
                        <span class="slider"></span>
                    </label>
                    <label for="aprvswitch-` + snote + `" style="cursor:pointer"><p2>I have fulfilled this requirement</p2></label>
                    <textarea style="display:none" id="aprvtext-` + snote + `"></textarea>
                </div>`
            }
            setTimeout(() => document.getElementById("aprvtext-" + snote).innerText = json.note, 100)
            if (!json.note) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            break;

        default:
            if (!ignoreMissingAction) {
                if (typeof json.action === "undefined") {
                    bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
                } else {
                    bordercolorcss = `style="border: 2px solid #ff8c; background-color: #ff82"`
                }
                htmldft = `<h5>[` + json.action + `]</h5>`
                htmlcft = `<p2>` + JSON.stringify(json.attr) + `</p2>`
            }
            break;
    }

    if (typeof json.array === "object") {
        if (Array.isArray(json.array)) {
            html += `<div class="flx" style="gap:0.5em;align-items:start;justify-content:flex-start">`
            json.array.forEach(subarray => {
                html += `<div style="min-width:12em">`
                html += generate_html_from_action(subarray, ignoreMissingAction, coursePlanning, courseids, mminfo_note)
                html += `</div>`
            })
            html += `</div>`
        } else {
            html += `<div class="flx" style="gap:0.5em;align-items:start;justify-content:flex-start">`
            Object.keys(json.array).forEach(key => {
                let rs = "reqbid-" + rndStr()
                html += `<div style="min-width:12em">`
                let rslt = generate_html_from_action(json.array[key], ignoreMissingAction, coursePlanning, courseids, mminfo_note)
                html += `<div style="margin:0.25em 0">` + ((json.array[key].pass) ? `✅ ` : ` • `) + `<p3>` + key + `</p3></div>`
                html += `<div id="` + rs + `-wrp">`
                if ((!json.pass && json.array[key].pass)) {
                    html += ` <button id="` + rs + `-button" class="requirement-showbtn-green" onclick="document.getElementById('` + rs + `-wrp').innerHTML = document.getElementById('` + rs + `-buf').innerHTML">show</button><div id="` + rs + `-buf" style="display:none">` + rslt + `</div>`
                } else {
                    html += rslt
                }
                html += `</div></div>`
            })
            html += `</div>`
        }
    }

    let rs = "reqbid-" + rndStr()

    if (signinlevel > 0 && typeof json.array != "undefined") {
        if (Array.isArray(json.array)) {
            json.array.forEach(subarray => {
                if (subarray.pass) numPassed++
                numPoints++
            })
        } else {
            Object.keys(json.array).forEach(key => {
                if (json.array[key].pass) numPassed++
                numPoints++
            })
        }
    }
    if (json.action == "or") numPoints = ((typeof json.attr != "undefined" && typeof json.attr.min_course != "undefined") ? parseInt(json.attr.min_course) : 1)
    if (signinlevel > 0) {
        htmlsigninpoints += ` (` + numPassed + `/` + numPoints + `)`
        // let i = 0
        // while (numPoints > i) {
        //     htmlsigninpoints += ((numPassed > i) ? ` ✔ ` : ` ✘ `)
        //     i++
        // }
    }
    switch (json.action) {
        case "and":
            htmldft = `<h4><small>Fulfill everything below:` + htmlsigninpoints + `</small></h4>`
            bordercolorcss = `style="border:2px solid #8884"`
            htmlcft = ``
            if (!json.array) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            if (typeof json.pass == "undefined" && signinlevel > 0 && numPassed >= numPoints) json.pass = true
            if (numPassed >= numPoints) htmlcft = `<style>
            #` + rs + ` .boxcolor-normal, #` + rs + ` .boxcolor-green {background-color:transparent!important}
            </style>`
            break;

        case "or":
            htmldft = `<h4><small>Fulfill at least ` + numPoints + ` requirement` + ((numPoints == "1") ? "" : "s") + `:` + htmlsigninpoints + `</small></h4>`
            bordercolorcss = `style="border:2px solid #8884"`
            htmlcft = ``
            if (!json.array) bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
            if (typeof json.pass == "undefined" && signinlevel > 0 && numPassed >= numPoints) json.pass = true
            if (numPassed >= numPoints) htmlcft = `<style>
            #` + rs + ` > div > div > .boxcolor-normal {opacity:0.25}
            #` + rs + ` .boxcolor-normal, #` + rs + ` .boxcolor-green {background-color:transparent!important}
            </style>`
            break;
    }

    if (json.pass) {
        bordercolorcss = `style="border: 2px solid #8fcc; background-color: #8fc2"`
        htmldft = htmldft.replace("<h4><small>", `<h4><small>✅ `).replace("<h5>", `<h5>✅ `)
    } else if (json.action == "not") {
        bordercolorcss = `style="border: 2px solid #f8cc; background-color: #f8c2"`
        htmldft = htmldft.replace("<h4><small>", `<h4><small>❌ `).replace("<h5>", `<h5>❌ `)
    }

    let boxcolorid = "boxcolor-normal"
    switch (bordercolorcss) {
        case `style="border: 2px solid #8fcc; background-color: #8fc2"`:
            boxcolorid = "boxcolor-green"
            break

        case `style="border: 2px solid #ff8c; background-color: #ff82"`:
            boxcolorid = "boxcolor-yellow"
            break

        case `style="border: 2px solid #f8cc; background-color: #f8c2"`:
            boxcolorid = "boxcolor-red"
            break
    }

    htmldft = `<div id="` + rs + `" class="` + boxcolorid + ` box" style="margin:0">` + htmldft
    if (typeof json.attr != "undefined") {
        let htmlaft = []
        if (json.attr.course) { json.attr.min_course = json.attr.course; json.attr.max_course = json.attr.course; delete json.attr.course }
        if (json.attr.min_course && json.action != "or") htmlaft.push(`<p2>ℹ️ Minimum Courses: ` + json.attr.min_course + `</p2>`)
        if (json.attr.min_credit) htmlaft.push(`<p2>ℹ️ Minimum Credits: ` + json.attr.min_credit + `</p2>`)
        if (json.attr.max_course) htmlaft.push(`<p2>ℹ️ Maximum Courses Counted: ` + json.attr.max_course + `</p2>`)
        if (json.attr.max_credit) htmlaft.push(`<p2>ℹ️ Maximum Credits Counted: ` + json.attr.max_credit + `</p2>`)
        htmldft += htmlaft.join("<br>")
    }
    if (!(ignoreMissingAction && typeof json.action == "undefined")) htmldft += `<div class="box-dash"></div>`
    htmldft += htmlcft + html + `</div>`



    return htmldft
}

function generate_grade_selection(selection = "----", possibleGrades = []) {
    selection = selection.toUpperCase()
    function loop(grades, selection) {
        let t = ""
        grades.forEach(grade => {
            t += `<option value="` + grade + `"` + (grade === selection ? " selected" : "") + `>` + (grade === "----" ? "---- (TBA)" : grade) + `</option>`
        })
        return t
    }
    return ((possibleGrades.length) ? ("" + loop(["----"], selection) + `<optgroup label="Grades">` + loop(possibleGrades, selection) + `</optgroup><optgroup>` + loop(["AU", "I", "T", "W"], selection)) + `</optgroup>` : ("" + loop(["----"], selection) + `<optgroup label="Toward GPA">` + loop(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"], selection) + `</optgroup><optgroup label="Not for GPA">` + loop(["P", "PP", "T", "AU", "W", "CR", "DI", "DN", "I", "PA", "PS"].sort(), selection) + `</optgroup>`))
}

function submitCourseUpdate(remove = false, cb = false) {

    if (document.getElementById('course_update_dialog')) document.getElementById('course_update_dialog').close()
    if (document.getElementById('add_course_dialog')) document.getElementById('add_course_dialog').close()
    setLoadingStatus('show')
    let formData = {}
    if (document.getElementById("course_update_dialog_form")) formData = formToJson(new FormData(document.getElementById("course_update_dialog_form")))
    if (document.getElementById("add_course_dialog_form")) formData = formToJson(new FormData(document.getElementById("add_course_dialog_form")))
    let newConfig = JSON.parse(JSON.stringify(config))

    if (remove) {
        delete newConfig.courses[formData.code][formData.sem]
        if (Object.keys(newConfig.courses[formData.code]).length === 0) delete newConfig.courses[formData.code]
    } else {
        if (typeof newConfig.courses === "undefined") newConfig.courses = {}
        if (typeof newConfig.courses[formData.code] === "undefined") newConfig.courses[formData.code] = {}
        if (typeof newConfig.courses[formData.code][formData.sem] === "undefined") newConfig.courses[formData.code][formData.sem] = {}
        newConfig.courses[formData.code][formData.sem] = { grade: formData.grade, units: formData.units, name: formData.name, actual_cred: formData.actual_cred }

        if (!!(typeof formData.is_SPO !== "undefined" && formData.is_SPO)) {
            newConfig.courses[formData.code][formData.sem].is_SPO = true
        } else if (typeof newConfig.courses[formData.code][formData.sem].is_SPO !== "undefined") {
            delete newConfig.courses[formData.code][formData.sem].is_SPO
        }
    }

    update_config("courses", newConfig.courses, (err) => {
        if (err) { setLoadingStatus('error', false, "change failed, please try again", err.message); if (cb) cb(); return }
        setLoadingStatus('success', false)
        update_enroll_course_gui(formData.currentsem, formData.code)
        reboot(true)
        if (cb) cb()
    })

}

function update_enroll_course_gui(sem, code) {
    try {
        let btn = document.getElementById("course_enroll_btn")
        let newConfig = JSON.parse(JSON.stringify(config))
        if (typeof newConfig.courses != "undefined" && typeof newConfig.courses[code] != "undefined" && Object.keys(newConfig.courses[code]).includes(sem)) {
            btn.innerText = "✅ Enrolled (grade: " + newConfig.courses[code][sem].grade + ")"
            document.getElementById("course_enroll_notice").innerHTML = ""
        } else {
            btn.innerText = "Enroll"
            document.getElementById("course_enroll_notice").innerHTML = ((typeof newConfig.courses != "undefined" && typeof newConfig.courses[code] != "undefined" && Object.keys(newConfig.courses[code]).length) ? (`<p4>Last enrolled at ` + ustTimeToString(Object.keys(newConfig.courses[code]).sort().reverse()[0]) + `</p4>`) : "")
        }
    } catch (error) {

    }
}

function enroll_course(sem, course, make_switch = false, is_SPO = false, possibleGrades = [], actual_cred = []) {
    let btn = document.getElementById("course_enroll_btn")
    let model = document.getElementById("course_enroll_model")

    if (make_switch && !(signinlevel > 0)) {
        if (confirm("You are not signed in. Do you want to create a Guest Profile now?\n\nThis temporary profile " + ((localStorage) ? "" : " will be wiped when you close or refresh your browser, and ") + "is not migratable when you sign in later.")) {
            document.getElementById("course_enroll_notice").innerHTML = `<div id="profile_new_model"></div>`
            create_new_profile_cb = () => { alert("Guest Profile Created"); enroll_course(sem, course, make_switch, is_SPO, possibleGrades, actual_cred) }
            create_new_profile()
        }
        return
    }
    let newConfig = JSON.parse(JSON.stringify(config))
    let courseParts = courseStringToParts(course)
    //console.log(courseParts)
    if (typeof newConfig.courses === "undefined") newConfig.courses = {}
    if (typeof newConfig.courses[courseParts.code] === "undefined") newConfig.courses[courseParts.code] = {}
    if (make_switch) {
        //TODO: make this less ugly and a unified way of calling "add new course" dialog
        let unit = ((typeof newConfig.courses != "undefined" && typeof newConfig.courses[courseParts.code] != "undefined" && typeof newConfig.courses[courseParts.code][sem] != "undefined" && typeof newConfig.courses[courseParts.code][sem].units != "undefined") ? newConfig.courses[courseParts.code][sem].units : courseParts.units.split(" ")[0])
        model.innerHTML = `<dialog id="course_update_dialog">
            <form id="course_update_dialog_form" action="javascript:void(0);">
                <div class="flx" style="gap:1em;flex-wrap: wrap-reverse">
                    <h4>Enroll Course</h4>
                    <button value="cancel" formmethod="dialog" class="closebtn"><img src="` + resourceNETpath + `image/circle-cross.png" title="Close"></button>
                </div><br>

                <div id="course_update_dialog_content"><p2>
                    <input readonly name="actual_cred" type="hidden" value="` + (actual_cred.length ? actual_cred[parseInt("" + sem[2]) - 1] : unit) + `"><input readonly name="currentsem" type="hidden" value="` + document.getElementById("timeidx").value + `"><input readonly name="name" type="hidden" value="` + courseParts.name + `"><input hidden type="checkbox" id="is_SPO" name="is_SPO" value="yes"` + (is_SPO ? " checked" : "") + `>
                    <input name="units" type="hidden" min="0" value="` + unit + `">
                    Course: <input readonly name="code" type="text" value="` + courseParts.code + `"><br>
                    Semester: <select id="course_update_sem" name="sem" onchange="enroll_course(document.getElementById('course_update_sem').value, '` + course.replaceAll("'", '"') + `', ` + make_switch + `, ` + is_SPO + `, ` + JSON.stringify(possibleGrades).replaceAll('"', "'") + `, ` + JSON.stringify(actual_cred).replaceAll('"', "'") + `)">` + document.getElementById("timeidx").innerHTML + `</select><br>
                    Grade: <select name="grade">` + generate_grade_selection((Object.keys(newConfig.courses[courseParts.code]).includes(sem) ? newConfig.courses[courseParts.code][sem].grade : "----"), possibleGrades) + `</select><br>
                    <div class="box" style="display:none">
                        <p2>Lec: </p2><br>
                        <p2>Lab: </p2><br>
                        <p2>Tut: </p2><br>
                        <p2>Rsh: </p2><br>
                    </div>

                </p2></div><br>

                <div class="flx">
                ` + (Object.keys(newConfig.courses[courseParts.code]).includes(sem) ? `
                    <button id="security_dialog_confirmBtn" onclick="submitCourseUpdate(true)">Remove</button>
                    <button id="security_dialog_confirmBtn" onclick="submitCourseUpdate(false)">Save</button>
                ` : `
                    <br>
                    <button id="security_dialog_confirmBtn" onclick="submitCourseUpdate(false)">Add</button>
                `) + `
                </div>
            </form>
            </dialog>`

        document.getElementById('course_update_sem').value = sem
        document.getElementById('course_update_dialog').showModal()
    } else {
        update_enroll_course_gui(sem, courseParts.code)
    }

}

function checkCourseEnrollOK(course) {
    let reqx = { "fx": "checking", "course": [course], "prog": config.profile.currentStudies.mm }
    if (signinlevel <= 0) return
    if (signinlevel < 1 || (typeof config._ === "undefined" || typeof config._[course] === "undefined")) {
        if (signinlevel < 1) reqx.userdb = config
        post((signinlevel >= 1) ? "/!acc/userfx/" : "/!guestfx/", reqx).then(r => r.json()).then(r => {
            if (r.status === 200) {
                //document.getElementById("exp-api-checking-result").innerHTML = ""
                let x = r.resp[Object.keys(r.resp)[0]]
                delete x.attr
                document.getElementById("course-attrs").innerHTML = `<h4>📚 Course Attributes</h4>` + renderCourseAttr(({ ...temp_prev_course_attr, ...x }), course, temp_prev_course_attr)
            } else {
                //document.getElementById("exp-api-checking-result").innerHTML = JSON.stringify(r)
                setLoadingStatus("error", false, "failed to contact server", JSON.stringify(r))
            }
        }).catch(error => {
            console.log(error)
            setLoadingStatus("error", false, "failed to contact server or script crashed")
        })
    } else {
        if (!(typeof config._[course] === "undefined" || typeof config._[course] != "undefined" && typeof config._[course].respattr != "undefined" && typeof config._[course].respattr.error != "undefined")) {
            let x = config._[course]
            delete x.attr
            document.getElementById("course-attrs").innerHTML = `<h4>📚 Course Attributes</h4>` + renderCourseAttr(({ ...temp_prev_course_attr, ...x }), course, temp_prev_course_attr)
        }
    }
}

let temp_prev_course_attr = {}

function render_courses_specific(path, insideCoursePage = false) {
    fetch("/!course/" + path).then(r => r.json()).then(r => {
        if (r.status != 200) { setLoadingStatus("error", false, "failed to contact server"); return }

        let html_draft = ""
        let course = Object.keys(r.resp)[0]

        if (insideCoursePage) {
            if (parseInt(course[5]) > 0 && parseInt(course[5]) < 5 && studprog != "ug") {
                studprog = "ug"
                render_courses(`/course/` + path)
                return
            } else if (parseInt(course[5]) >= 5 && studprog != "pg") {
                studprog = "pg"
                render_courses(`/course/` + path)
                return
            }

            history.replaceState(null, window.title, "/course/" + path)
            document.title = "" + course.split(" - ")[0] + " - " + ustTimeToString(path.split("/")[0], true) + " - uni"
        }

        temp_prev_course_attr = r.resp[course].attr

        let is_SPO = "false"
        if (typeof r.resp[course].attr.ATTRIBUTES != "undefined" && r.resp[course].attr.ATTRIBUTES.includes("[SPO] Self-paced online delivery")) is_SPO = "true"

        let possibleGrades = []
        let desc = r.resp[course].attr.DESCRIPTION
        if (desc.includes("Graded P or F") && !desc.toUpperCase().includes("GRADED PP")) {
            possibleGrades = ["P", "F"]
        } else if ((desc.includes("Graded P or F") && desc.toUpperCase().includes("GRADED PP")) || desc.includes("Graded PP, P or F") || desc.includes("Graded P, PP or F") || desc.includes("Graded P/PP/F")) {
            possibleGrades = ["P", "PP", "F"]
        } else if (desc.includes("Graded DI, PA or F") || desc.includes("Graded DI/PA/F")) {
            possibleGrades = ["DI", "PA", "F"]
        }

        let actual_cred = []
        if (typeof r.resp[course].section != "undefined" && Object.keys(r.resp[course].section).length && typeof r.resp[course].section[Object.keys(r.resp[course].section)[0]][Object.keys(r.resp[course].section[Object.keys(r.resp[course].section)[0]])[0]]["Remarks"] != "undefined") {
            let remarks = r.resp[course].section[Object.keys(r.resp[course].section)[0]][Object.keys(r.resp[course].section[Object.keys(r.resp[course].section)[0]])[0]]["Remarks"]
            let extract = ""
            if (remarks.split("> The credit load will usually be spread in the following pattern: ").length > 1) {
                extract = remarks.split("> The credit load will usually be spread in the following pattern: ")[1].split("Instructor Consent Required")[0]
            } else if (remarks.split("> The credit load is spread in the following pattern: ").length > 1) {
                extract = remarks.split("> The credit load is spread in the following pattern: ")[1].split("Instructor Consent Required")[0]
            }
            if (extract) {
                let kp = {}
                extract.split("; ").forEach(spec => {
                    kp[spec.split(": ")[0]] = spec.split(": ")[1]
                });
                ["Fall", "Winter", "Spring", "Summer"].forEach(semu => {
                    if (typeof kp[semu] != "undefined") {
                        actual_cred.push(kp[semu])
                    } else {
                        actual_cred.push("0")
                    }
                })
            }
        }

        let draft = `<select style="width:100%" name="timeidx" id="timeidx" title="Select Semester" onchange="boot('/course/' + document.getElementById('timeidx').value + '/' + '` + course.split(" ")[0] + `' + '/' + '` + course.split(" ")[0] + course.split(" ")[1] + `' + '/', false, 2)">`
        let prevSem = "----"
        r.resp[course].insem.sort().reverse().forEach(sem => {
            let thisSem = ustTimeToString(sem), thisSemSel = thisSem.split(" ")[0] + " " + thisSem.split(" ")[1]
            if (thisSem.includes("-")) thisSemSel = thisSem.split(" ")[0]
            if (thisSemSel != prevSem) {
                if (prevSem != '----') draft += `</optgroup>`
                draft += `<optgroup label="` + ustTimeToString(sem, true).split(" ")[0] + `">`
                prevSem = thisSemSel
            }
            draft += `<option value="` + sem + `"`
            if (sem == path.split("/")[0]) {
                draft += " selected"
            }
            draft += `>` + ustTimeToString(sem, true) + `</option>`
        })
        draft += `</optgroup></select>`

        html_draft += `<div class="edge2edge_page"><div style="page-break-inside:avoid" id="` + course.split(" ")[0] + course.split(" ")[1] + `">
            <div class="box"><div class="flx"><h4>` + course + `</h4></div><p2>` + r.resp[course].attr.DESCRIPTION + `</p2>
            <br><br>
            <div id="course_enroll_model"></div>
            <div class="flx" style="gap:0.5em">
                <div class="flx" style="justify-content:flex-start;gap:0.5em">
                    <p4>Also offered in: </p4>
                    <div id="alsoOfferedIn">` + draft + `</div>
                </div>
                <div>
                    <a target="_blank" class="aobh" href="https://ust.space/review/` + course.split(" ")[0] + course.split(" ")[1] + `">try check ustspace</a>
                    <a target="_blank" class="aobh" href="http://petergao.net/ustpastpaper/index.php?course=` + course.split(" ")[0] + course.split(" ")[1] + `">try check petergao</a>
                </div>
            </div>
        </div>`

        document.getElementById('topbar_buttons_wrp').innerHTML = `<div class="enroll_btn_wrp flx">
            <button id="course_enroll_btn" ` + ((true || signinlevel > 0) ? "" : `style="display:none" `) + `onclick="enroll_course(` + '`' + path.split("/")[0] + '`,`' + course + '`' + `, true, ` + is_SPO + `, ` + JSON.stringify(possibleGrades).replaceAll('"', "'") + `, ` + JSON.stringify(actual_cred).replaceAll('"', "'") + `)">Enroll</button>
            <div id="course_enroll_notice"></div>
        </div>`

        if (true) {
            let listofColors = ["red", "orange", "#cc6", "#cc6", "#cc6", "#9c6", "#9c6", "#9c6", "#44e044", "#44e044", "#44e044"]
            let listofGrades = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"]

            function ustspacedb_scorerender(score) {
                let index = Math.max(0, Math.round(((score - 1) / 4) * listofGrades.length) - 1)
                if (score <= 1.5) {
                    index = 0
                } else if (score < 2.5) {
                    index = 1
                } else if (score <= 2.83) {
                    index = 2
                } else if (score <= 3.17) {
                    index = 3
                } else if (score < 3.5) {
                    index = 4
                } else if (score <= 3.83) {
                    index = 5
                } else if (score <= 4.17) {
                    index = 6
                } else if (score < 4.5) {
                    index = 7
                } else if (score <= 4.75) {
                    index = 8
                } else if (score <= 4.9) {
                    index = 9
                } else if (score <= 5) {
                    index = 10
                }
                return `<div class="ustspacedb_score" style="background-color:` + listofColors[index] + `"><p1><b>` + listofGrades[index] + `</b></p1></div>`
            }

            if (typeof r.resp[course].ustspacedb != "undefined" && r.resp[course].ustspacedb.review_count) html_draft += `
            <div class="box" id="ustspacedb">
                <h4>📝 ustspace Rating</h4>
                <div class="flx" style="gap: 1em; justify-content: space-around; text-align:center; background-color:#88888808; margin: 1em 0; padding: 1em; border-radius: 1em">
                    <div>
                        <p2>Content</p2><br><p2>` + ustspacedb_scorerender(r.resp[course].ustspacedb.rating_content) + `</p2>
                    </div>
                    <div>
                        <p2>Teaching</p2><br><p2>` + ustspacedb_scorerender(r.resp[course].ustspacedb.rating_teaching) + `</p2>
                    </div>
                    <div>
                        <p2>Grading</p2><br><p2>` + ustspacedb_scorerender(r.resp[course].ustspacedb.rating_grading) + `</p2>
                    </div>
                    <div>
                        <p2>Workload</p2><br><p2>` + ustspacedb_scorerender(r.resp[course].ustspacedb.rating_workload) + `</p2>
                    </div>
                </div>
                <style>.ustspacedb_score{margin:0.25em;padding:0.5em;border-radius:0.5em;color:white;min-width:2em}</style>
                <p2>Number of reviews: <b>` + r.resp[course].ustspacedb.review_count + `</b><br>
                Date of capture: <b>June 20, 2023</b></p2>
            </div>`
        }

        let attrHTML = renderCourseAttr(((typeof r.resp[course].phrasedattr != "undefined") ? { ...r.resp[course].attr, ...r.resp[course].phrasedattr } : r.resp[course].attr), course, r.resp[course].attr)
        if (attrHTML) html_draft += `<div class="box" id="course-attrs"><h4>📚 Course Attributes</h4>` + attrHTML + `</div>`
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

        if (parseInt(path.split("/")[0]) >= 2230) html_draft += `<div class="box" id="charts"><h4>📈 Enrollment History</h4></div>`

        let htmls = { lec: [], lab: [], tut: [], rsh: [], otr: [] }

        if (typeof r.resp[course].section != "undefined" && r.resp[course].section && Object.keys(r.resp[course].section)) {
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
                delete attrs["TA/IA/GTA"]
                //

                htmlsd += JSON.stringify(attrs) + `<br>` // TODO: do not relay on this info as it is cached, use the one from /!diff/ instead

                let resp = {}
                Object.keys(r.resp[course].section[sectionName]).forEach(time => {
                    let rt = {}
                    if (typeof r.resp[course].section[sectionName][time].Room != "undefined") rt.Room = r.resp[course].section[sectionName][time].Room
                    if (typeof r.resp[course].section[sectionName][time].Instructor != "undefined") rt.Instructor = r.resp[course].section[sectionName][time].Instructor
                    if (typeof r.resp[course].section[sectionName][time]["TA/IA/GTA"] != "undefined") rt["TA/IA/GTA"] = r.resp[course].section[sectionName][time]["TA/IA/GTA"]
                    resp[time] = rt
                })
                htmlsd += `` + renderTimetableGrid(resp, "courseDetail", path.split("/")[0]) + `</div>`

                htmls[lessonToType(sectionName)].push(htmlsd)
            })
        }

        html_draft += `</div>`
        Object.keys(htmls).forEach(type => {
            if (htmls[type].length) {
                html_draft += `<div class="edge2edge flx" style="justify-content:flex-start"><h3>` + type + `</h3><h5><span class="uniroomweek" style="border:0.15em solid rgba(128,128,128,.5)">` + htmls[type].length + `</span></h5></div></div><div class="flx edge2edge dpv_carrier" style="padding-top:0!important" id="` + type + `">`
                htmls[type].forEach(h => html_draft += h)
                html_draft += `</div>`
            }
        })

        html_draft += `<style>
        #courses_detail_content .uniroomtime{display:none} 
        #courses_detail_content .uniroomweek{position:unset;margin-top:1em} 
        #courses_detail_content .uniroomgrid{display:block}
        </style></div>`

        document.getElementById("courses_detail_content").innerHTML = html_draft

        let timenow = new Date().getTime()

        if (parseInt(path.split("/")[0]) >= 2230) {
            fetch("/!diff/" + path.split('/')[2].toUpperCase() + "/" + ((path.split("/")[0] != allSemsF[0]) ? ("" + path.split("/")[0] + "/") : "")).then(r => r.json()).then(rChart => {
                if (rChart.status != 200) { 
                    document.getElementById("charts").innerHTML = "failed to contact server or script crashed"
                    document.getElementById("charts").style.display = "none"
                    return
                }

                setTimeout(() => {

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

                }, Math.max(500 - (new Date().getTime() - timenow), 1))

            }).catch(error => {
                console.log(error)
                document.getElementById("charts").innerHTML = "failed to contact server or script crashed"
                document.getElementById("charts").style.display = "none"
            })
        }

        setLoadingStatus("hide")
        document.getElementById("topbar_title").innerText = course.replace(course.split(" - ")[0] + " - ", "").substring(course.replace(course.split(" - ")[0] + " - ", ""), course.replace(course.split(" - ")[0] + " - ", "").lastIndexOf(" ("))
        document.getElementById("topbar_subtitle").innerText = path.split("/")[2].substring(0, 4) + " " + path.split("/")[2].replace(path.split("/")[2].substring(0, 4), "") + " • " + ustTimeToString(path.split("/")[0], true)
        document.getElementById('courses_select_main').classList.add('edge2edge_wide')
        document.getElementById("course_detail_topbar_specialStyles").innerHTML = `<style>
        #courses_select_main{padding:0}
        #courses_select_left{padding:0; max-width:0; width:0; height:0; opacity:0; overflow:clip}
        #courses_select_right{width:100%}
        #courses_detail_content{width:100vw; width:100dvw}

        .topbar{
            abox-shadow: 0 0.75em 0.75em rgba(0,0,0,0);
            aborder-bottom: 0.16em solid #8880;
            abackground: var(--transbg);
            backdrop-filter: blur(1.5em);
            border-radius: 0;
        }

        #courses_detail_content .box {margin: 0.5em 0}
        @media (max-width:700px) {#courses_select_left{display:none}}
        </style>`
        setTimeout(() => { document.getElementById("course_detail_topbar_specialStyles").innerHTML += "<style>#btn_back{transition-duration:0.1s!important}</style>" }, 500)
        setTimeout(enroll_course, 50, path.split("/")[0], course)
        if (path.split("/")[0] == r.resp[course].insem.sort().reverse()[0]) setTimeout(checkCourseEnrollOK, 50, course.split(" ")[0] + course.split(" ")[1])
    }).catch(error => {
        console.log(error)
        setLoadingStatus("error", false, "failed to contact server or script crashed")
    })
}

function render_courses_details(path, scrollIntoView = false, isGroup = false) {
    html = document.getElementById("courses_detail_content")
    let withinCourseListPage = (path.split('/').length == 2 || (path.split('/').length == 3 && path.split('/')[2] == ""))
    let withinCourseDetailPage = false
    if (!withinCourseListPage) withinCourseDetailPage = (path.split('/').length == 3 || (path.split('/').length == 4 && path.split('/')[3] == ""))
    if (withinCourseDetailPage) {
        if (path.endsWith("/")) path = path.slice(0, path.length - 1)
        render_courses_details(path.slice(0, path.lastIndexOf("/") + 1))
        return
    }

    fetch("/!" + (isGroup ? "group" : "course") + "/" + path).then(r => r.json()).then(r => {
        if (r.status != 200) { setLoadingStatus("error", false, "failed to contact server"); return }

        document.getElementById('topbar_buttons_wrp').innerHTML = ''

        let html_draft = `<style>.uniroomtime{display:none} .uniroomweek{position:unset;margin-top:1em} .uniroomgrid{display:block} .LR_Right{background:none}</style><br><div class="flx"><br><div class="flx" style="gap:0.5em"><p4>View Mode: </p4>`
        if (listMode === "card") {
            html_draft += `<p5><b><div class="ugpgbox flx">
                <button id="cardbtn" style="background:rgba(64,160,255,.4);cursor:default" title="Card View">📇</button>
                <button id="detailbtn" style="background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="listMode = 'detail'; config['listMode'] = 'detail'; update_config('listMode', 'detail'); scrollIntoView = true, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Detail View">🧾</button>
                </div></b></p5></div></div><div class="flx" style="margin-top:0.5em">`
        } else {
            html_draft += `<p5><b><div class="ugpgbox flx">
                <button id="cardbtn" style="background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="listMode = 'card'; config['listMode'] = 'card'; update_config('listMode', 'card'); scrollIntoView = true, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Card View">📇</button>
                <button id="detailbtn" style="background:rgba(64,160,255,.4);cursor:default" title="Detail View">🧾</button>
                </div></b></p5></div></div>`
        }
        Object.keys(r.resp).forEach((course, ix) => {
            if ((studprog === "ug" && parseInt(course[5]) > 0 && parseInt(course[5]) < 5) || (studprog === "pg" && parseInt(course[5]) >= 5)) {
                if (listMode === "card") {
                    let courseParts = courseStringToParts(course)
                    html_draft += generate_course_selbox(
                        courseParts.code,
                        courseParts.name,
                        path.split('/')[0],
                        courseParts.units.split(" ")[0],
                        "" + ((typeof config.courses != "undefined" && typeof config.courses[course.split(" - ")[0]] != "undefined" && typeof config.courses[course.split(" - ")[0]][path.split("/")[0]] != "undefined") ? (`<style>#` + course.split(" ")[0] + course.split(" ")[1] + `{border:0.25em solid #fffc;margin:0.25em}</style><h5 class="textbox" style="background:#fffc;color:#333">` + config.courses[course.split(" - ")[0]][path.split("/")[0]].grade + `</h5>`) : "<h5></h5>") + ((typeof r.resp[course].attr._cancelled != "undefined" && r.resp[course].attr._cancelled) ? `<div class="textbox"><h5>❌ Cancelled</h5></div>` : (`<h5 style="opacity:0.85">` + ((typeof r.resp[course].attr["VECTOR"] === "undefined") ? course.substring(course.lastIndexOf(" (") + 2, course.length).split(")")[0] : r.resp[course].attr["VECTOR"])) + "</h5>"),
                        false,
                        "",
                        (typeof r.resp[course].hot != "undefined" ? r.resp[course].hot : {hotness: 0})
                    )
                } else {
                    html_draft += `<div style="margin:1em 0.5em"><div style="page-break-inside:avoid" id="` + course.split(" ")[0] + course.split(" ")[1] + `" class="selbox" onclick="boot('/course/` + path.split('/')[0] + "/" + course.split(" ")[0] + "/" + course.split(" ")[0] + course.split(" ")[1] + `/', false, 2)">
                    <div>
                        <div>
                            <div class="flx"><h4>` + course + `</h4>` + ((typeof r.resp[course].attr._cancelled != "undefined" && r.resp[course].attr._cancelled) ? `<div class="textbox" style="margin:0.25em"><h5>❌ Cancelled</h5></div>` : "") + `</div>
                            <p2 class="no_mobile">` + r.resp[course].attr.DESCRIPTION + `</p2>
                        </div>
                        <div>` + renderCourseAttr(r.resp[course].attr, course) + `</div>
                    </div></div></div>`
                }
            }
        })

        if (listMode === "card") html_draft += `</div><div style="padding:0.5em 1em"><p3>❤️‍🔥: Quotas are full for all sections<br>🔥: Enrollment Percentage >= 85%<br>❄️: Enrollment Percentage <= 30%<br>🧊: Enrollment Percentage <= 10%<br><hr>The above pictures were generated using AI for illustration purposes only. It does not represent the actual course contents and/or learning outcomes.</p3></div>`
        html.innerHTML = html_draft

        if (scrollIntoView) { if ((Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) <= 520)) { document.getElementById("courses_select_right").scrollIntoView() } else { document.body.scrollIntoView() } }

        setLoadingStatus("hide")
        document.getElementById("topbar_title").innerText = path.split("/")[1]
        document.getElementById("topbar_subtitle").innerText = ustTimeToString(path.split("/")[0], true)
        document.getElementById('courses_select_main').classList.remove('edge2edge_wide')
        document.getElementById("course_detail_topbar_specialStyles").innerHTML = `
        <style>
        .topbar{z-index:9999!important}
        #btn_back{max-width: 0em; padding: 0em}

        @media (min-width: 581px) {.topbar{border-radius: 1em 1em 0 0}}

        @media (min-width: 1281px) {
            #courses_detail_content{width:calc( 90vw - 29em ); max-width:100%}
            .topbar{padding: max(calc(env(safe-area-inset-top) + 0.5em), 2em) max(calc(env(safe-area-inset-right) + 0.5em), calc(16px + 1em)) calc( 0.5em - 0.08em ) max(calc(env(safe-area-inset-left) + 0.5em), calc(16px + 1em))}
        }
        </style>`

        document.getElementById("topbar_title").focus()
    }).catch(error => {
        console.log(error)
        setLoadingStatus("error", false, "failed to contact server or script crashed")
    })
}

function render_courses(pathF) {

    let isGroup = (pathF.toLowerCase().startsWith("/group/"))
    let path = pathF.substring(isGroup ? 7 : 8)

    if (!document.getElementById("course_detail_topbar_specialStyles")) document.getElementById("courses_select_right").innerHTML = renderTopBar(path.split("/")[1], ustTimeToString(path.split("/")[0], true), `<div id="topbar_buttons_wrp"></div>`, true, "", true, `boot('/search/?q='.concat(encodeURIComponent(document.getElementById('search_box').value)), false, 3)`) + `
    <style>#btn_back, .topbar, #courses_select_main, #courses_select_left, #courses_select_right{transition-timing-function: cubic-bezier(.65,.05,.36,1);transition-duration: 0.5s !important}</style>
    <div id="course_detail_topbar_specialStyles">
        <style>
            .topbar{z-index:9999!important} @media (min-width: 1281px) {.topbar{padding: max(calc(env(safe-area-inset-top) + 0.5em), 2em) max(calc(env(safe-area-inset-right) + 0.5em), calc(16px + 1em)) calc( 0.5em - 0.08em ) max(calc(env(safe-area-inset-left) + 0.5em), calc(16px + 1em))}}
        </style>
    </div>
    <div id="courses_detail_content"></div>`
    setLoadingStatus("show")
    document.getElementById("courses_select_left_top").innerHTML = `
    <div class="flx">
    <h2>Courses</h2>
    <p5><b><div class="ugpgbox flx">
        <button id="ugbtn" onclick="studprog = 'ug'; config['studprog'] = 'ug'; update_config('studprog', 'ug'); scrollIntoView = false, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Undergraduate Courses">UG</button>
        <button id="pgbtn" onclick="studprog = 'pg'; config['studprog'] = 'pg'; update_config('studprog', 'pg'); scrollIntoView = false, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Postgraduate Courses">PG</button>
    </div></b></p5>
    </div>`

    if (!(path.split('/').length <= 2 || (path.split('/').length == 3 && path.split('/')[2] == ""))) {
        render_courses_specific(path, true)
        return
    }

    apply_config()
    render_UGPG_switch()

    html = document.getElementById("courses_select_left_optionBox")
    let semx = ((ustTimeToString(decodeURI(path.split("/")[0]), true) != '----') ? decodeURI(path.split("/")[0]) : allSems[0])
    let html_draft = ""

    if (isGroup) {
        html_draft += `<div class="flx" style="padding:0.35em;width:100%;max-width:18em;border-radius:1.4em;box-shadow:0 0.25em 0.5em rgba(0,0,0,.1);background:var(--gbw)">
        <button style="padding:0.35em;flex-grow:1;min-width:50%;background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="boot('/course/' + document.getElementById('timeid').value + '/', true, 2)">Department</button>
        <button style="padding:0.35em;flex-grow:1;min-width:50%;border-radius:1em;background:rgba(255,160,64,.4);cursor:default">Group</button>
        </div>`
    } else {
        html_draft += `<div class="flx" style="padding:0.35em;width:100%;max-width:18em;border-radius:1.4em;box-shadow:0 0.25em 0.5em rgba(0,0,0,.1);background:var(--gbw)">
        <button style="padding:0.35em;flex-grow:1;min-width:50%;border-radius:1em;background:rgba(255,160,64,.4);cursor:default">Department</button>
        <button style="padding:0.35em;flex-grow:1;min-width:50%;background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="boot('/group/' + document.getElementById('timeid').value + '/', true, 2)">Group</button>
        </div>`
    }

    html_draft += `<select style="width:100%" name="timeid" id="timeid" title="Select Semester" onchange="boot('/` + (isGroup ? "group" : "course") + `/' + document.getElementById('timeid').value + '/' + deptx + '/', false, 2)">`
    let prevSem = "----"
    allSemsF.forEach(sem => {
        let thisSem = ustTimeToString(sem), thisSemSel = thisSem.split(" ")[0] + " " + thisSem.split(" ")[1]
        if (thisSem.includes("-")) thisSemSel = thisSem.split(" ")[0]
        if (thisSemSel != prevSem) {
            if (prevSem != '----') html_draft += `</optgroup>`
            html_draft += `<optgroup label="` + ustTimeToString(sem, true).split(" ")[0] + ((thisSemSel.startsWith("Year")) ? (` (` + thisSemSel + `)`) : "") + `">`
            prevSem = thisSemSel
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
        alert('i hope i can know what courses will exist in the future too 👀')
        boot("/", true)
        return
    }

    fetch("/!" + (isGroup ? "group" : "course") + "/" + semx + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { setLoadingStatus("error", false, "failed to contact server"); return }

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

        //let desktopHTML = `<div id="myDropdown" class="flx no_mobile"><!--<input type="text" style="position:sticky;top:0.5em" placeholder="Filter..." id="myInput" onkeyup="filterFunction()">-->`
        let mobileHTML = `<select class="only_mobile" name="deptid" id="deptid" title="Select Target" onchange="scrollIntoView = true, doNotCheckUGPG = false; boot('/` + (isGroup ? "group" : "course") + `/' + document.getElementById('timeid').value + '/' + document.getElementById('deptid').value + '/', false, 2)">`
        let newHTML = `<div><div>`

        let prevdept = ""
        depts.forEach(dept => {

            if (prevdept.charAt(0) != dept.charAt(0)) {
                if (!isGroup) {
                    if (prevdept) mobileHTML += `</optgroup>`
                    mobileHTML += `<optgroup label="` + dept.charAt(0) + `">`
                }
                newHTML += `</div></div><div class="flx courses_select_bigchar no_mobile">` + (isGroup ? "" : `<div class="flx" style="min-width:1.75em;justify-content:center;opacity:.4;position:sticky;top:0"><h4>` + dept.charAt(0) + `</h4></div>`) + `<div class="flx" style="justify-content:flex-start;gap:0.25em">`
            }

            //desktopHTML += `<button title="` + courseCode_to_fullName(dept) + `" onclick="scrollIntoView = true, doNotCheckUGPG = false; boot('/` + (isGroup ? "group" : "course") + `/' + document.getElementById('timeid').value + '/` + dept + `/', false, 2)"`
            mobileHTML += `<option value="` + dept + `"` + ((courseCode_to_fullName(dept) != dept) ? (` label="` + dept + ` - ` + courseCode_to_fullName(dept) + `"`) : ``)
            newHTML += `<button class="courses_select_deptbtn" title="` + courseCode_to_fullName(dept) + `" onclick="scrollIntoView = true, doNotCheckUGPG = false; boot('/` + (isGroup ? "group" : "course") + `/' + document.getElementById('timeid').value + '/` + dept + `/', false, 2)"`

            if (dept == deptx) {
                document.title = "" + deptx + " - " + ustTimeToString(semx, true) + " - uni"
                history.replaceState(null, window.title, "/" + (isGroup ? "group" : "course") + "/" + semx + "/" + deptx + "/")

                //desktopHTML += ` style="background:rgba(255,255,0,.4)"`
                mobileHTML += " selected"
                newHTML += ` style="background:rgba(160,160,160,.25)"`
            }

            //desktopHTML += `>` + dept + `</button>`
            mobileHTML += `>` + dept + `</option>`
            newHTML += isGroup ? (`><p2><b>• ` + dept + `</b></p2></button>`) : (`><h4>` + dept + `</h4></button>`)

            prevdept = dept

        })

        //desktopHTML += `</div>`
        if (prevdept) mobileHTML += `</optgroup>`
        mobileHTML += `</select>`
        newHTML += `</div></div>`

        //html_draft += desktopHTML + mobileHTML
        html_draft += mobileHTML + newHTML

        html.innerHTML = html_draft

        render_courses_details(coursex, scrollIntoView, isGroup)

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

function render_people(path) {
    document.getElementById("courses_select_left_top").innerHTML = `<h2>People</h2>`

    let html_draft = ""
    let target_people = decodeURI(path.split("/")[0])
    let randomPeople = false
    html = document.getElementById("courses_select_left_optionBox")

    if (!target_people) {
        target_people = peoples[Math.floor(Math.random() * peoples.length)]
        randomPeople = true
    }
    peoplex = target_people
    document.title = "" + target_people + " - uni"

    let hdraft = ""
    peoples.forEach(people => {
        hdraft += `<button onclick="peoplex='` + people + `';boot('/people/` + people + `/' + document.getElementById('timeid').value + '/', false, 2)" style="display:none;`
        if (people == target_people) {
            hdraft += ` background:rgba(255,255,0,.4)`
        }
        hdraft += `">` + people + `</button>`
    })
    hdraft += `</div>`
    html_draft += `<div id="myDropdown" class="flx" style="flex-grow:1"><input type="text" style="position:sticky;top:0.5em;margin-bottom:0" placeholder="Search.." id="myInput" onclick="this.select()" onkeyup="filterFunction(true)" value="` + target_people + `">` + hdraft + `</select>`

    fetch("/!people/" + target_people + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
        let peopleAvilSems = r.resp

        let absDeadline = 2000

        if (randomPeople && parseInt(peopleAvilSems[0]) < absDeadline) {
            setTimeout(() => {
                boot("/people/", true, 2)
            }, 1)
            return
        }

        let skippeopleRestriction = true
        let maxSem = Math.max(parseInt(allSems[0]), parseInt(peopleAvilSems[0]))
        let peopleMinSem = ((signinlevel === 0) ? (parseInt(allSems[0]) - 99) : Math.min(absDeadline, parseInt(peopleAvilSems[0])))
        let target_time = ((peopleAvilSems.includes(allSems[0])) ? allSems[0] : peopleAvilSems[0])
        if (peopleAvilSems.filter(n => parseInt(n) > peopleMinSem).length === 0) skippeopleRestriction = true
        if (skippeopleRestriction) {
            allSems = allSems.filter(n => parseInt(n) > (Math.min(absDeadline, parseInt(peopleAvilSems[0])) - 1))
        } else {
            allSems = peopleAvilSems.filter(n => parseInt(n) > peopleMinSem)
        }
        html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="boot('/people/' + peoplex + '/' + document.getElementById('timeid').value + '/', false, 2)">`
        if ((path.split("/")[1] && ((!skippeopleRestriction && parseInt(decodeURI(path.split("/")[1])) < peopleMinSem) || ustTimeToString(decodeURI(path.split("/")[1]), true) === '----'))) {
            html_draft += `<option value="1009" selected disabled hidden>` + ustTimeToString(decodeURI(path.split("/")[1]), true) + `</option>`
            history.replaceState(null, window.title, "/people/" + target_people + "/" + decodeURI(path.split("/")[1]) + "/")
            target_time = decodeURI(path.split("/")[1])
        } else if (path.split("/")[1] && !allSems.includes(decodeURI(path.split("/")[1]))) {
            allSems.push(decodeURI(path.split("/")[1]))
            allSems.sort()
            allSems.reverse()
        } else if (!path.split("/")[1] || (parseInt(peopleAvilSems[0]) < 2200)) {
            history.replaceState(null, window.title, "/people/" + target_people + "/" + target_time + "/")
        }
        let prevSem = '----'
        let noSigninAdDisplayed = (signinlevel === 0)
        allSems.every((time, index) => {
            if (!peopleAvilSems.includes(time) && time != decodeURI(path.split("/")[1])) return true
            let thisSem = ustTimeToString(time, true)
            if (thisSem.split(" ")[0] != prevSem) {
                if (prevSem != '----') html_draft += `</optgroup>`
                html_draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
                prevSem = thisSem.split(" ")[0]
            }
            if (!disableSigninRequirement) { if (noSigninAdDisplayed && (signinlevel === 0) && time < peopleMinSem) { html_draft += `<option disabled>↓ Signin Required ↓</option>`; noSigninAdDisplayed = false } }
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
        html_draft += `</optgroup></select></div>`
        html.innerHTML = html_draft

        html = document.getElementById("courses_select_right")
        html_draft = `<div id="peopleinfo"><center><div id="d_loading"></div></center></div>`
        html.innerHTML = html_draft
        html = document.getElementById("peopleinfo")

        html_draft = ""

        if (ustTimeToString(target_time, true) === '----') { html.innerHTML = `the url is not in a valid format`; return }
        if (parseInt(target_time) > maxSem) { html.innerHTML = `i hope i can know what courses will exist in the future too 👀`; return }
        if (!disableSigninRequirement) { if (signinlevel === 0 && parseInt(target_time) < peopleMinSem && parseInt(target_time) > 1200) { html.innerHTML = `<a href="https://me.` + rootdomain + `/">sign in</a> now to get access to this page`; return } }
        if ((!skippeopleRestriction && parseInt(target_time) < peopleMinSem) || parseInt(target_time) < 1200) { html.innerHTML = `we don't have data for semesters that are too old :(`; return }

        fetch("/!people/" + target_people + "/" + target_time + "/").then(r => r.json()).then(r => {
            if (r.status === 404) { html.innerHTML = `there are no lessons in this semester` + ((target_time < 2200) ? ("<br>...or maybe not, we are not sure since we only started collecting data extensively from 2022-23 :(") : ("")); return }
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

    document.getElementById("courses_select_left_top").innerHTML = `<h2>Rooms</h2>`

    let html_draft = ""
    let path_hv_room_match = false
    let target_room = "LTA"
    html = document.getElementById("courses_select_left_optionBox")

    if (experiments.room_show_textbox.enabled) {
        let hdraft = ""
        rooms.forEach(room => {
            hdraft += `<button onclick="roomx='` + room + `';boot('/room/` + room + `/' + document.getElementById('timeid').value + '/', false, 2)" style="display:none;`
            if (decodeURI(path.split("/")[0]) != "" && room === decodeURI(path.split("/")[0])) {
                target_room = decodeURI(path.split("/")[0])
                document.title = "" + target_room + " - uni"
                hdraft += ` background:rgba(255,255,0,.4)`
                path_hv_room_match = true
            }
            hdraft += `">` + room + `</button>`
        })
        hdraft += `</div>`
        if (!path_hv_room_match) {
            document.title = "LTA - uni"
        }
        html_draft = `<div id="myDropdown" class="flx" style="flex-grow:1"><input type="text" placeholder="Search.." id="myInput" style="position:sticky;top:0.5em;margin-bottom:0" onclick="this.select()" onkeyup="filterFunction(true)" value="` + target_room + `">` + hdraft + `</select>`

    } else {
        html_draft = `<select name="roomid" id="roomid" title="Select Room" onchange="boot('/room/' + document.getElementById('roomid').value + '/' + document.getElementById('timeid').value + '/', false, 2)">`
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
    }

    fetch("/!room/" + target_room + "/").then(r => r.json()).then(r => {
        if (r.status != 200) { html.innerHTML = "failed to contact server"; return }
        let roomAvilSems = r.resp

        let skipRoomRestriction = true
        let maxSem = Math.max(parseInt(allSems[0]), parseInt(roomAvilSems[0]))
        let roomMinSem = ((signinlevel === 0) ? (parseInt(allSems[0]) - 99) : 2200)
        let target_time = ((roomAvilSems.includes(allSems[0])) ? allSems[0] : roomAvilSems[0])
        if (roomAvilSems.filter(n => parseInt(n) > roomMinSem).length === 0) skipRoomRestriction = true
        if (skipRoomRestriction) {
            allSems = allSems.filter(n => parseInt(n) > 2200)
        } else {
            allSems = roomAvilSems.filter(n => parseInt(n) > roomMinSem)
        }
        if (experiments.room_show_textbox.enabled) {
            html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="boot('/room/' + roomx + '/' + document.getElementById('timeid').value + '/', false, 2)">`
        } else {
            html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="boot('/room/' + document.getElementById('roomid').value + '/' + document.getElementById('timeid').value + '/', false, 2)">`
        }
        if (path.split("/")[1] && ((!skipRoomRestriction && parseInt(decodeURI(path.split("/")[1])) < roomMinSem) || ustTimeToString(decodeURI(path.split("/")[1]), true) === '----')) {
            html_draft += `<option value="1009" selected disabled hidden>` + ustTimeToString(decodeURI(path.split("/")[1]), true) + `</option>`
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
            let thisSem = ustTimeToString(time, true)
            if (thisSem.split(" ")[0] != prevSem) {
                if (prevSem != '----') html_draft += `</optgroup>`
                html_draft += `<optgroup label="` + thisSem.split(" ")[0] + `">`
                prevSem = thisSem.split(" ")[0]
            }
            if (!disableSigninRequirement) { if (noSigninAdDisplayed && (signinlevel === 0) && time < roomMinSem) { html_draft += `<option disabled>↓ Signin Required ↓</option>`; noSigninAdDisplayed = false } }
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
        html_draft += `</optgroup></select>`
        html.innerHTML = html_draft

        html = document.getElementById("courses_select_right")
        html_draft = `<div id="roominfo"><center><div id="d_loading"></div></center></div>`
        html.innerHTML = html_draft
        html = document.getElementById("roominfo")

        html_draft = ""

        if (ustTimeToString(target_time, true) === '----') { html.innerHTML = `the url is not in a valid format`; return }
        if (parseInt(target_time) > maxSem) { html.innerHTML = `i hope i can know what courses will exist in the future too 👀`; return }
        if (!disableSigninRequirement) { if (signinlevel === 0 && parseInt(target_time) < roomMinSem && parseInt(target_time) > 1200) { html.innerHTML = `<a href="https://me.` + rootdomain + `/">sign in</a> now to get access to this page`; return } }
        if ((!skipRoomRestriction && parseInt(target_time) < roomMinSem) || parseInt(target_time) < 1200) { html.innerHTML = `we don't have data for semesters that are too old :(`; return }

        fetch("/!room/" + target_room + "/" + target_time + "/").then(r => r.json()).then(r => {
            if (r.status === 404) { html.innerHTML = `there are no lessons in this semester` + ((target_time < 2200) ? ("<br>...or maybe not, we are not sure since we only started collecting data extensively from 2022-23 :(") : ("")); return }
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
        tension: 0.05,
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

    do {
        options.plugins.annotation.annotations["box" + i] = { type: 'box', xMin: i * 24 * 3 - startMissing + 24 * 3, xMax: i * 24 * 3 - startMissing + 24 * 3 * 2 - 1, backgroundColor: 'rgba(128,128,128,0.05)', borderWidth: 0, drawTime: 'beforeDatasetsDraw' }
        i += 2; timeNow += 2 * 24 * 60 * 60 * 1000
    } while (timeNow < lastTime)

    return options
}

const renderCourseAttr = (attrs, course, orgattrs = {}) => {
    let html_draft = ``
    Object.keys(attrs).forEach(attr => {
        if (attr != "DESCRIPTION" && !attr.startsWith("_")) {
            if (attr === "INTENDED LEARNING OUTCOMES") { html_draft += `</div><div>` }
            html_draft += `<div id="` + attr.replaceAll(" ", "_").replaceAll('"', "'") + `" style="border-radius:1em;background-color:#88888808;box-shadow:inset 0 0 0 1px #8882">
            <div style="padding:0.5em 1em 0.4em 1em;border-bottom:0.1em dotted #888"><p4>`
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

                case "PRE-REQUISITE-BY":
                    html_draft += "🚨 Required For"
                    break

                case "CO-REQUISITE-BY":
                    html_draft += "🛎️ Co-Required For"
                    break

                case "EXCLUSION-BY":
                    html_draft += "⛔ Excluded By"
                    break

                case "respattr":
                    break

                default:
                    html_draft += "[" + attr + "]"
                    break
            }
            html_draft += '</p4></div><div><p2><div style="padding:1em">'

            if (typeof attrs[attr] === "object" && !Array.isArray(attrs[attr]) && typeof attrs[attr].action != "undefined") {
                html_draft += orgattrs[attr] + `</div>` + generate_html_from_action(JSON.parse(JSON.stringify(attrs[attr])))
            } else if (attr == "ATTRIBUTES" && window.location.pathname.toLowerCase().startsWith("/course/") && !isNaN(window.location.pathname.split("/")[2]) && !isNaN(parseFloat(window.location.pathname.split("/")[2]))) {
                let sem = parseInt(window.location.pathname.split("/")[2]).toString(), x = []
                attrs[attr].split("<br>").forEach(attr => {
                    x.push(`<a class="ax" onclick="boot('/group/` + sem + `/` + attr + `/', false, 2)">` + attr + `</a>`)
                })
                html_draft += x.join(",<br>") + `</div>`
            } else {
                html_draft += attrs[attr] + `</div>`
            }

            if (attr === "VECTOR") {
                let v = attrs[attr].replace("[", "").replace("]", "")
                if ((new RegExp(/\d[-]\d[-]\d[:]\d/gm)).test(v)) {
                    html_draft += `<br><br><b>` + v.split(":")[0].split("-")[0] + `</b> Lecture hours per week<br>
                                    <b>` + v.split(":")[0].split("-")[1] + `</b> Tutorial, seminar or recitation hours per week<br>
                                    <b>` + v.split(":")[0].split("-")[2] + `</b> Laboratory or field study hours per week<br>          
                                    <b>` + v.split(":")[1] + `</b> Course credits`
                }
            } else if (false && (attr === "PREVIOUS CODE" || attr === "ALTERNATE CODE(S)") && course.toUpperCase().startsWith("CORE")) {
                html_draft += `<br><br><a target="_blank" href="https://ust.space/review/` + attrs[attr].replace(" ", "") + `">try check ustspace</a>`

            }
            html_draft += "</p2></div></div>"
        }
    })
    return ((html_draft) ? (`<br><div class="flx" style="justify-content:flex-start;gap:1em;align-items:baseline">` + html_draft + `</div>`) : "")
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

const ustTimeToString = (time, noYear = false) => {
    if (!(time.length === 4 && time[3] === "0" && parseInt(time) > 1009 && parseInt(time) < 9900 && parseInt(time) % 100 < 41)) return "----"
    let string = `20` + time.substring(0, 2) + "-" + (parseInt(time.substring(0, 2)) + 1) + " "
    if (!noYear && signinlevel > 0 && typeof config != "undefined" && typeof config.profile != "undefined" && typeof config.profile.currentStudies != "undefined" && typeof config.profile.currentStudies.yearOfIntake != "undefined") {
        if (parseInt(time.substring(0, 2)) >= parseInt(config.profile.currentStudies.yearOfIntake.substring(0, 2))) {
            let yearnum = parseInt(time.substring(0, 2)) - parseInt(config.profile.currentStudies.yearOfIntake.substring(0, 2)) + 1
            string = "Year " + yearnum + " "
        }
    }
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
    let html_draft = ``
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

    if (days.Other.length > 0) {
        html_draft += `<div>`
        if (type === "courseDetail") {
            html_draft += `<div>`
        } else {
            html_draft += `<div class="uniroomweek"><h3 style="font-size:1.25em">Others</h3></div><div class="flx">`
        }
        days.Other.forEach(lesson => {
            if (type === "room") {
                html_draft += `<div class="selbox" style="cursor:pointer;flex-grow:1"
                onclick="boot('/course/` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/', false, 2)">
                <div style="margin:0.25em 0.5em 0.25em 0.25em;padding:0 0.5em 0 0.75em;border-left:0.25em solid #ff888888"> 
                <h4>` + lesson.date.substring(0, 25) + `</h4><h5>` + lesson.date.slice(25) + `</h5>
                <p2>` + lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i></p2>
                </div></div>`
            } else if (type === "people") {
                html_draft += `<div class="selbox" style="cursor:pointer;flex-grow:1" onclick="boot('/course/` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/', false, 2)">
                <div style="margin:0.25em 0.5em 0.25em 0.25em;padding:0 0.5em 0 0.75em;border-left:0.25em solid #ff888888"><h4>` + lesson.course.split(" - ")[0] + ` (` + lesson.section.split(' (')[0] + `)</h4><p2><i>` + lesson.course.split(" - ")[1] + ` (` + lesson.section.split(' (')[1] + `</i><small><br>` + ((typeof lesson.date != "undefined") ? '' + lesson.date.substring(0, 25) + `<br>` + lesson.date.slice(25) + '<br>' : '') + lesson.room + `
                </small></p2></div></div>`
            } else if (type === "courseDetail") {
                html_draft += `<div style="margin:0.75em 0.5em 0.75em 0.25em;padding:0.25em 0.5em 0.25em 0.75em;border-left:0.25em solid #ff888888">
                <h4>` + lesson.date.substring(0, 25) + `</h4><h5>` + lesson.date.slice(25) + `</h5>
                <p2>Room: ` + lesson.Room

                if (typeof lesson.Instructor != "undefined" && lesson.Instructor) {
                    html_draft += `<br>Instructor: `
                    if (Array.isArray(lesson.Instructor)) {
                        let tmparr = []
                        lesson.Instructor.forEach((inst) => {
                            tmparr.push(`<button onclick="boot('/people/` + inst + `/` + target_time + `/', false, 2)">` + inst + "</button>")
                        })
                        html_draft += tmparr.join(" ")
                    } else {
                        html_draft += JSON.stringify(lesson.Instructor)
                    }
                }

                if (typeof lesson["TA/IA/GTA"] != "undefined" && lesson["TA/IA/GTA"]) {
                    html_draft += `<br>TA/IA/GTA: `
                    if (Array.isArray(lesson["TA/IA/GTA"])) {
                        let tmparr = []
                        lesson[["TA/IA/GTA"]].forEach((inst) => {
                            tmparr.push(`<button onclick="boot('/people/` + inst + `/` + target_time + `/', false, 2)">` + inst + "</button>")
                        })
                        html_draft += tmparr.join(" ")
                    } else {
                        html_draft += JSON.stringify(lesson["TA/IA/GTA"])
                    }
                }

                html_draft += `</p2></div>`
            }
        })
        html_draft += `</div></div>`
        if (type != "courseDetail") html_draft += `<br>`
    }

    html_draft += `<div class="uniroomgrid">`

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
                    ` + ((type == "room" || type == "people") ? `onclick="boot('/course/` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/', false, 2)"` : '') + `>
                    <div style="position:sticky;top:2.75em;padding-left:0em;border-left:0em solid #88ff88cc">
                    <h4>` + startTime[1] + ` <span style="opacity:0.4">→</span> ` + endTime[1] + `</h4><p2>`
                if (type === "room") {
                    html_draft += lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i>`
                } else if (type === "people") {
                    html_draft += lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i><small><br>` + lesson.room + `</small>`
                } else if (type === "courseDetail") {
                    html_draft += `Room: ` + lesson.Room
                    if (typeof lesson.Instructor != "undefined" && lesson.Instructor) {
                        html_draft += `<br>Instructor: `
                        if (Array.isArray(lesson.Instructor)) {
                            let tmparr = []
                            lesson.Instructor.forEach((inst) => {
                                tmparr.push(`<button onclick="boot('/people/` + inst + `/` + target_time + `/', false, 2)">` + inst + "</button>")
                            })
                            html_draft += tmparr.join(" ")
                        } else {
                            html_draft += JSON.stringify(lesson.Instructor)
                        }
                    }
                    if (typeof lesson["TA/IA/GTA"] != "undefined" && lesson["TA/IA/GTA"]) {
                        html_draft += `<br>TA/IA/GTA: `
                        if (Array.isArray(lesson["TA/IA/GTA"])) {
                            let tmparr = []
                            lesson[["TA/IA/GTA"]].forEach((inst) => {
                                tmparr.push(`<button onclick="boot('/people/` + inst + `/` + target_time + `/', false, 2)">` + inst + "</button>")
                            })
                            html_draft += tmparr.join(" ")
                        } else {
                            html_draft += JSON.stringify(lesson["TA/IA/GTA"])
                        }
                    }
                }
                html_draft += `</p2></div></div>`
            })
            html_draft += ``
        } else if (!haveWeekRendered) {
            minWeekStartTime = index
        }
    })
    html_draft += `</div>`

    return html_draft
}

const waitCSS = () => { try { installCSS('uni.css') } catch { setTimeout(() => { waitCSS() }, 20) } }
waitCSS()