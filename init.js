var script1 = document.createElement('script'); script1.src = '/!acc/uniplus.js'; document.head.appendChild(script1);

const bottombarbuttons = [
    'Me,/me/,me,' + resourceNETpath + 'image/nullicon.png,1',
    'Courses,/course/,course,' + resourceNETpath + 'image/nullicon.png,2',
    'About,/about/,about,' + resourceNETpath + 'image/info.png,0'
]

function bootID_mapper(path = "") {
    if (!path || path == "/") {
        return -1
    } else if (path.toLowerCase().startsWith("/about/")) {
        return 0
    } else if (path.toLowerCase().startsWith("/me/")) {
        return 1
    } else if (path.toLowerCase().startsWith("/course/") || path.toLowerCase().startsWith("/people/") || path.toLowerCase().startsWith("/room/") || path.toLowerCase().startsWith("/search/")) {
        return 2
    } else {
        return -1
    }
}

function getPageHTML_404() {
    return `<meta http-equiv="refresh" content="0;URL=/!404/">`
}

document.body.style.overflowY = "scroll" //make scrollbar always visible

var prev_call = 'none'
function init(path) {

    if (prev_call != path) { //if already initPage page then don't initPage it again

        prev_call = path

        if (path == '/' || path == '') { //home page, not decided what to do yet so redir to /course/ ;)
            return `<meta http-equiv="refresh" content="0;URL=/course/">`

        } else if (path.toLowerCase().startsWith("/me/")) { //me page
            return `
            <div class="edge2edge_page">
                <h3>Courses Enrolled</h3>
            </div>
            <div id="my_courses">
                
            </div>
            ` + renderBottomBar('me')

        } else if (path.toLowerCase().startsWith("/course/") || path.toLowerCase().startsWith("/people/") || path.toLowerCase().startsWith("/room/") || path.toLowerCase().startsWith("/search/")) { //course + people + room + search

            return `<div id="courses_select_wrp">
                <div class="edge2edge flxb" id="courses_select_main" style="transition-timing-function:cubic-bezier(.65,.05,.36,1);transition-duration:0.6s">
                    <div class="LR_Left" id="courses_select_left">
                        <div class="LR_Left_Content">
                            <div class="box flx" style="justify-content:center;gap:0.5em;margin:0.5em 0">
                                <button onclick="boot('/course/', false, 2)">course</button>
                                <button onclick="boot('/people/', false, 2)">people</button>
                                <button onclick="boot('/room/', false, 2)">room</button>
                                <button onclick="boot('/search/', false, 2)">search</button>
                            </div>
                            <div id="courses_select_left_top"></div>
                            <div class="box flx" style="justify-content:center;gap:0.5em;margin:0.5em 0" id="courses_select_left_optionBox"></div>
                        </div>
                    </div>
                    <div class="LR_Right" id="courses_select_right"></div>
                </div>
            </div>` + renderBottomBar('course')

        } else if (path.toLowerCase().startsWith("/about/")) { //about page
            wasInsideCoursePage = false
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
                <h4>anime.js</h4>
                <p3>
                    The MIT License (MIT)
                <br><br>
                    Copyright (c) 2019 Julian Garnier
                <br><br>
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                <br><br>
                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                <br><br>
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                </p3>
            </div>
            <div class="box">
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
            <div class="box">
                <h4>chartjs-plugin-annotation.js</h4>
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

    if (path === 'cleanup') { return }

    if (path.toLowerCase().startsWith("/course/")) {
        exe_courses(path.substring(8))
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
                html.innerHTML = "failed to contact server"
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
                html.innerHTML = "failed to contact server"
            })
        } else {
            exe_room(path.substring(6))
        }
    } else if (path.toLowerCase().startsWith("/me/")) {
        exe_me()
    } else if (path.toLowerCase().startsWith("/search/")) {
        document.getElementById('courses_select_main').classList.remove('edge2edge_wide')
        exe_search()
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
const exe_me = (path) => wait_allSems(render_me, path, "Me - uni")
const exe_search = (path) => wait_allSems(render_search, path, "Search - uni")

function courseStringToParts(course) {
    let dept = course.split(" ")[0]
    let code = course.split(" - ")[0]
    let units = course.substring(course.lastIndexOf(" (") + 2, course.length).split(")")[0]
    let name = course.replace(course.split(" - ")[0] + " - ", "").substring(course.replace(course.split(" - ")[0] + " - ", ""), course.replace(course.split(" - ")[0] + " - ", "").lastIndexOf(" ("))

    return { dept: dept, code: code, units: units, name: name }
}

function render_search(path) {
    path = window.location.search

    let params = new URLSearchParams(path)
    let query = params.get('q')

    document.getElementById("courses_select_left_top").innerHTML = `<div class="flx"><h2>Search</h2></div>`
    document.getElementById("courses_select_left_optionBox").innerHTML = `<style>#courses_select_left_optionBox{display:none}</style>`
    document.getElementById("courses_select_right").innerHTML = `<br><div id="fdigbtn" class="flx"><label for="search_dw_box"><img alt="Search" src="` + resourceNETpath + `image/search.png" draggable="false"></label><p3 id="digsrtxt">Search</p3>
    <form onsubmit="boot('/search/?q='.concat(encodeURIComponent(document.getElementById('search_dw_box').value)), true, 2);this.blur();return false"><input ` + ((!query) ? "autofocus " : "") + `id="search_dw_box" name="dw" type="search" placeholder="Search for anything" value="" title="Search"></form></div>
    <div id="search_result"></div>`
    document.getElementById("search_dw_box").focus()

    if (!query) {
        document.title = "Search - uni"
        document.getElementById("search_result").innerHTML = `<br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>Type in keywords to start searching!</b></p1></center>`
        return
    }

    document.title = "🔍 " + query + " - uni"
    document.getElementById("search_dw_box").value = query
    document.getElementById("search_result").innerHTML = `<br><div class="flx" style="justify-content:center;gap:0.5em;text-align:center"><div id="d_loading"></div><p2><b>Loading...</b></p2></div>`

    let tmark = (new Date()).getTime()
    fetch("/!search/" + encodeURIComponent(path)).then(r => r.json()).then(r => {
        switch (r.status) {
            case 200:
                document.getElementById("search_result").innerHTML = `<br><p3 style="margin-left:0.5em">Total ` + r.resp.length + ` result` + ((r.resp.length === 1) ? "" : "s") + ` (` + ((new Date()).getTime() - tmark) + ` ms).</p3><br><div class="flx" id="search_out"><div id="d_loading"></div></div>`

                setTimeout(() => {
                    let draft = ""
                    r.resp.forEach(ans => {
                        switch (ans.type) {
                            case "course":
                                if (r.resp.length === 1) {
                                    boot(`/course/` + ans.result.SEM + "/" + ans.result.CODE.substring(0, 4) + "/" + ans.result.CODE + `/`, true, 2)
                                    return
                                }
                                draft += `<div style="padding:0;page-break-inside:avoid;background-image:url(` + ((ans.result.CODE === "COMP3511") ? (`https://ia601705.us.archive.org/16/items/windows-xp-bliss-wallpaper/windows-xp-bliss-4k-lu-1920x1080.jpg`) : (resourceNETpath + `uni_ai/` + ans.result.CODE + `.png`)) + `)" id="` + ans.result.CODE + `" class="course_sel selbox picbox" onclick="boot('/course/` + ans.result.SEM + "/" + ans.result.CODE.substring(0, 4) + "/" + ans.result.CODE + `/', false, 2)" title="` + ans.result.DESCRIPTION.replaceAll('>', "").replaceAll('<', "").replaceAll('"', "'") + `"><div class="picbox_inner flx">
                                <div class="picbox_inner_up"><h5 style="opacity:0.85"> </h5></div>
                                <div><h4>` + ans.result.CODE + `</h4><h5>` + ans.result.NAME + `</h5></div></div></div>`
                                break;

                            case "people":
                                if (r.resp.length === 1) {
                                    boot(`/people/` + ans.result + `/`, true, 2)
                                    return
                                }
                                draft += `<div style="padding:0;page-break-inside:avoid" id="` + ans.result + `" class="course_sel selbox picbox" onclick="boot('/people/` + ans.result + `/', false, 2)" title="` + ans.result + `"><div class="picbox_inner flx">
                                <div class="picbox_inner_up"><h5 style="opacity:0.85"></h5></div>
                                <div><h4>` + ans.result + `</h4></div></div></div>`
                                break;

                            case "room":
                                if (r.resp.length === 1) {
                                    boot(`/room/` + ans.result + `/`, true, 2)
                                    return
                                }
                                draft += `<div style="padding:0;page-break-inside:avoid" id="` + ans.result + `" class="course_sel selbox picbox" onclick="boot('/room/` + ans.result + `/', false, 2)" title="` + ans.result + `"><div class="picbox_inner flx">
                                <div class="picbox_inner_up"><h5 style="opacity:0.85"></h5></div>
                                <div><h4>` + ans.result + `</h4></div></div></div>`
                                break;

                            default:
                                draft += `<div class="box">` + JSON.stringify(ans) + "</div>"
                                break;
                        }
                    })
                    document.getElementById("search_out").innerHTML = draft
                }, 10)
                break;
            case 404:
                document.getElementById("search_result").innerHTML = `<br><center><img class="searchimg" src="` + resourceNETpath + `image/bigsearch_empty.png" alt="Search"><br><br><p1 style="opacity:0.8"><b>Not much great matches were found. Try again with different keywords?</b></p1></center>`
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

function render_me() {
    document.title = "Me - uni"

    let my_courses = document.getElementById("my_courses")
    if (signinlevel <= 0) {
        my_courses.innerHTML = `<div class="edge2edge"><p2>Please sign in first!</p2></div>`
        return
    }
    let htmld = "", total_cred = 0, total_passed_cred = 0, total_gpacred = 0, total_grade_points = 0
    if (typeof accConfig.courses === "undefined" || Object.keys(accConfig.courses).length === 0) {
        htmld = `<div class="edge2edge"><p2>No courses found!</p2></div>`
    } else {
        let semsdb = {}

        Object.keys(accConfig.courses).forEach(course => {
            Object.keys(accConfig.courses[course]).forEach(sem => {
                if (typeof semsdb[sem] === "undefined") semsdb[sem] = {}
                semsdb[sem][course] = accConfig.courses[course][sem]
            })
        })

        Object.keys(semsdb).sort().reverse().forEach(sem => {
            let mhtmld = "", gpacred = 0, total_term_cred = 0, termcredload = 0, gpasum = 0, haveunfilled = false
            Object.keys(semsdb[sem]).forEach(course => {
                let cred = parseInt(semsdb[sem][course].units)
                let actualcred = cred
                if (typeof semsdb[sem][course].actual_cred != "undefined") actualcred = parseInt(semsdb[sem][course].actual_cred)
                mhtmld += `<div style="padding:0;page-break-inside:avoid;background-image:url(` + ((course == "COMP 3511") ? (`https://ia601705.us.archive.org/16/items/windows-xp-bliss-wallpaper/windows-xp-bliss-4k-lu-1920x1080.jpg`) : (resourceNETpath + `uni_ai/` + course.replace(" ", "") + `.png`)) + `)" id="` + course.replace(" ", "") + `" class="course_sel selbox picbox" onclick="boot('/course/` + sem + "/" + course.split(' ')[0] + "/" + course.split(" ")[0] + course.split(" ")[1] + `/', false, 2)" title=""><div class="picbox_inner flx">
                    <div class="picbox_inner_up flx" style="width:calc(100% - 1.6em)">
                        <h5 class="textbox">` + semsdb[sem][course].grade + `</h5>
                        <h5 style="opacity:0.85">` + ((actualcred != cred) ? ("" + actualcred + " of ") : "") + semsdb[sem][course].units + ` unit` + ((semsdb[sem][course].units === "1") ? '' : 's') + `</h5>
                    </div><div><h4>` + course + `</h4><h5>` + semsdb[sem][course].name + `</h5></div></div></div>`
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
            htmld += `<div class="edge2edge"><div class="flx"><h3>` + ustTimeToString(sem) + `</h3><h5>` + ((gpacred) ? (`TGA <span class="textbox"` + (haveunfilled ? ` title="There are courses missing grade information">⌛ ` : ">") + (gpasum / gpacred).toFixed(3) + `</span> `) : "") + ((termcredload != total_term_cred) ? (`Actual Credit Load <span class="textbox" title="The actual credit load after deducting transferred credits">` + termcredload + `</span> `) : "") + `Credits <span class="textbox">` + total_term_cred + `</span></h5></div><div class="flx">` + mhtmld + `</div></div>`
        })
    }
    my_courses.innerHTML = `<div class="edge2edge"><div class="flx"><h3> </h3><h5>GPA <span class="textbox">` + (total_grade_points / total_gpacred).toFixed(3) + `</span> Passed Credits <span class="textbox">` + total_passed_cred + `</span> Total Credits <span class="textbox">` + total_cred + `</span></h5></div><br><hr></div>` + htmld
}

var studprog = "ug"
var listMode = "card"

var accConfig = {}

function update_accConfig(newKey = "", newVal = "", cb = (err) => { }) {
    if (!newKey && !newVal) {
        fetch("/!acc/config/").then(r => r.json()).then(r => {
            if (r.status === 200) {
                accConfig = r.resp
                apply_config()
            }
            cb()
        }).catch(error => {
            console.log(error)
            cb(err)
        })
    } else {
        let newKeyVal = {}
        newKeyVal[newKey] = newVal
        post("/!acc/config/", newKeyVal).then(r => r.json()).then(r => {
            if (r.status === 200) {
                accConfig = r.resp
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
    if (typeof accConfig.studprog != "undefined") {
        studprog = accConfig.studprog
    }
    if (typeof accConfig.listMode != "undefined") {
        listMode = accConfig.listMode
    }
}

var allSems = []
var allSemsF = []
var deptx = "ACCT"

function wait_allSems(cb, path, title) {

    document.title = title

    if (allSemsF.length) { allSems = JSON.parse(JSON.stringify(allSemsF)); cb(path); return }

    fetch("/!course/").then(r => r.json()).then(r => {
        if (r.status != 200 || !r.resp.length) {
            document.getElementById("core").innerHTML = `
            <div class="edge2edge_page">
                <h2>Oops</h2><br>
                <p3>It seems that there are nothing we can show to you at the moment. Try coming back later.</p3><br><br>
                <div class="box">
                    <h4>Technical Information</h4>
                    <p3>wait_allSems failed, possibly due to no data in cache or other server error.<br>Run <b>/!course_fetch/</b> and <b>/!course_cache/</b> on the internal API, or check server status.</p3>
                </div>
            </div>
            `
            return
        }
        allSemsF = r.resp
        allSems = JSON.parse(JSON.stringify(allSemsF))

        fetch("/!acc/config/").then(r => r.json()).then(r => {
            if (r.status === 200) {
                accConfig = r.resp
            }
            cb(path)
        }).catch(error => {
            console.log(error)
            cb(path)
        })

    }).catch(error => {
        console.log(error)
        document.getElementById("core").innerHTML = `
        <div class="edge2edge_page">
            <h2>Oops</h2><br>
            <p3>Connect to the internet, and then refresh the page.</p3>
        </div>
        `
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

let alwaysExecSetLoadingStatusImmediately = false
let chartx = ''
let wasInsideCoursePage = false

function generate_grade_selection(selection = "----", possibleGrades = []) {
    selection = selection.toUpperCase()
    function loop(grades, selection) {
        let t = ""
        grades.forEach(grade => {
            t += `<option value="` + grade + `"` + (grade === selection ? " selected" : "") + `>` + grade + `</option>`
        })
        return t
    }
    return ((possibleGrades.length) ? ("" + loop(possibleGrades, selection)) : ("" + loop(["----"], selection) + `<optgroup label="Toward GPA">` + loop(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"], selection) + `</optgroup><optgroup label="Not for GPA">` + loop(["P", "PP", "T", "AU", "W", "CR", "DI", "DN", "I", "PA", "PS"].sort(), selection) + `</optgroup>`))
}

function submitCourseUpdate(remove = false) {

    document.getElementById('course_update_dialog').close()
    setLoadingStatus('show')
    const formData = formToJson(new FormData(document.getElementById("course_update_dialog_form")))
    let newConfig = JSON.parse(JSON.stringify(accConfig))
    let btn = document.getElementById("course_enroll_btn")

    if (remove) {
        delete newConfig.courses[formData.code][formData.sem]
        if (Object.keys(newConfig.courses[formData.code]).length === 0) delete newConfig.courses[formData.code]
        update_accConfig("courses", newConfig.courses, (err) => {
            if (err) { setLoadingStatus('error', false, "change failed, please try again", err.message); return }
            setLoadingStatus('success', false)
            update_enroll_course_gui(formData.currentsem, formData.code)
            return
        })
        return
    }

    //console.log(formData)
    if (typeof newConfig.courses === "undefined") newConfig.courses = {}
    if (typeof newConfig.courses[formData.code] === "undefined") newConfig.courses[formData.code] = {}
    if (typeof newConfig.courses[formData.code][formData.sem] === "undefined") newConfig.courses[formData.code][formData.sem] = {}
    newConfig.courses[formData.code][formData.sem] = { grade: formData.grade, units: formData.units, name: formData.name, actual_cred: formData.actual_cred }
    newConfig.courses[formData.code][formData.sem].is_SPO = (!!(typeof formData.is_SPO !== "undefined" && formData.is_SPO))

    update_accConfig("courses", newConfig.courses, (err) => {
        if (err) { setLoadingStatus('error', false, "change failed, please try again", err.message); return }
        setLoadingStatus('success', false)
        update_enroll_course_gui(formData.currentsem, formData.code)
    })

}

function update_enroll_course_gui(sem, code) {
    let btn = document.getElementById("course_enroll_btn")
    let newConfig = JSON.parse(JSON.stringify(accConfig))
    if (typeof newConfig.courses != "undefined" && typeof newConfig.courses[code] != "undefined" && Object.keys(newConfig.courses[code]).includes(sem)) {
        btn.innerText = "✅ Enrolled (grade: " + newConfig.courses[code][sem].grade + ")"
        document.getElementById("course_enroll_notice").innerHTML = ""
    } else {
        btn.innerText = "Enroll"
        document.getElementById("course_enroll_notice").innerHTML = ((typeof newConfig.courses != "undefined" && typeof newConfig.courses[code] != "undefined" && Object.keys(newConfig.courses[code]).length) ? (`<p4>Last enrolled at ` + ustTimeToString(Object.keys(newConfig.courses[code]).sort().reverse()[0]) + `</p4>`) : "")
    }
}

function enroll_course(sem, course, make_switch = false, is_SPO = false, possibleGrades = [], actual_cred = []) {
    let btn = document.getElementById("course_enroll_btn")
    let model = document.getElementById("course_enroll_model")
    if (btn) {
        if (make_switch && !(signinlevel > 0)) {
            alert("Please signin first!")
            return
        }
        let newConfig = JSON.parse(JSON.stringify(accConfig))
        let courseParts = courseStringToParts(course)
        //console.log(courseParts)
        if (typeof newConfig.courses === "undefined") newConfig.courses = {}
        if (typeof newConfig.courses[courseParts.code] === "undefined") newConfig.courses[courseParts.code] = {}
        if (make_switch) {

            let unit = ((typeof newConfig.courses != "undefined" && typeof newConfig.courses[courseParts.code] != "undefined" && typeof newConfig.courses[courseParts.code][sem] != "undefined" && typeof newConfig.courses[courseParts.code][sem].units != "undefined") ? newConfig.courses[courseParts.code][sem].units : courseParts.units.split(" ")[0])
            model.innerHTML = `<dialog id="course_update_dialog">
            <form id="course_update_dialog_form" action="javascript:void(0);">
                <div class="flx"><br><button value="cancel" formmethod="dialog" class="closebtn"><img src="` + resourceNETpath + `image/circle-cross.png" title="Close"></button></div><br>

                <div id="course_update_dialog_content"><p2>
                    <input readonly name="actual_cred" type="hidden" value="` + (actual_cred.length ? actual_cred[parseInt("" + sem[2]) - 1] : unit) + `"><input readonly name="currentsem" type="hidden" value="` + document.getElementById("timeidx").value + `"><input readonly name="name" type="hidden" value="` + courseParts.name + `"><input hidden type="checkbox" id="is_SPO" name="is_SPO" value="yes"` + (is_SPO ? " checked" : "") + `>
                    <input name="units" type="hidden" min="0" value="` + unit + `">
                    Course: <input readonly name="code" type="text" value="` + courseParts.code + `"><br>
                    Semester: <select id="course_update_sem" name="sem" onchange="enroll_course(document.getElementById('course_update_sem').value, '` + course.replace("'", '"') + `', ` + make_switch + `, ` + is_SPO + `, ` + JSON.stringify(possibleGrades).replaceAll('"', "'") + `, ` + JSON.stringify(actual_cred).replaceAll('"', "'") + `)">` + document.getElementById("timeidx").innerHTML + `</select><br>
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
}

let disableSigninRequirement = true;

function render_courses_specific(path, insideCoursePage = false) {
    fetch("/!course/" + path).then(r => r.json()).then(r => {
        if (r.status != 200) { setLoadingStatus("error", false, "failed to contact server"); return }

        let html_draft = ""
        let course = Object.keys(r.resp)[0]

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

            history.replaceState(null, window.title, "/course/" + path)
            document.title = "" + course.split(" - ")[0] + " - " + ustTimeToString(path.split("/")[0]) + " - uni"
        }

        let is_SPO = "false"
        if (typeof r.resp[course].attr.ATTRIBUTES != "undefined" && r.resp[course].attr.ATTRIBUTES.includes("[SPO] Self-paced online delivery")) is_SPO = "true"

        let possibleGrades = []
        if (r.resp[course].attr.DESCRIPTION.includes("Graded P or F")) {
            possibleGrades = ["----", "P", "F", "T"]
        } else if (r.resp[course].attr.DESCRIPTION.includes("Graded PP, P or F")) {
            possibleGrades = ["----", "P", "PP", "F", "T"]
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

        html_draft += `<div class="edge2edge_page"><div style="page-break-inside:avoid" id="` + course.split(" ")[0] + course.split(" ")[1] + `">
            <div class="box"><div class="flx"><h4>` + course + `</h4></div><p2>` + r.resp[course].attr.DESCRIPTION + `</p2>
            <br><br><a target="_blank" href="https://ust.space/review/` + course.split(" ")[0] + course.split(" ")[1] + `">try check ustspace</a><br><br>
            <div id="course_enroll_model"></div>
            <div class="flx" style="gap:0.5em">
                <div class="flx" style="justify-content:flex-start;gap:0.5em">
                    <p4>Also offered in: </p4>
                    <div id="alsoOfferedIn">` + draft + `</div>
                </div>
                <div class="enroll_btn_wrp flx">
                    <button id="course_enroll_btn" ` + ((true || signinlevel > 0) ? "" : `style="display:none" `) + `onclick="enroll_course(` + '`' + path.split("/")[0] + '`,`' + course + '`' + `, true, ` + is_SPO + `, ` + JSON.stringify(possibleGrades).replaceAll('"', "'") + `, ` + JSON.stringify(actual_cred).replaceAll('"', "'") + `)">Enroll</button>
                    <div id="course_enroll_notice"></div>
                </div>
            </div></div>`
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
                //

                htmlsd += JSON.stringify(attrs) + `<br>` // TODO: do not relay on this info as it is cached, use the one from /!diff/ instead

                let resp = {}
                Object.keys(r.resp[course].section[sectionName]).forEach(time => {
                    resp[time] = { Room: r.resp[course].section[sectionName][time].Room, Instructor: r.resp[course].section[sectionName][time].Instructor }
                })
                htmlsd += `` + renderTimetableGrid(resp, "courseDetail") + `</div>`

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

        html_draft += `<style>#courses_detail_content .uniroomtime{display:none} #courses_detail_content .uniroomweek{position:unset;margin-top:1em} #courses_detail_content .uniroomgrid{display:block}</style></div>`

        document.getElementById("courses_detail_content").innerHTML = html_draft

        setTimeout(enroll_course, 50, path.split("/")[0], course)

        let timenow = new Date().getTime()

        if (parseInt(path.split("/")[0]) >= 2230) {
            fetch("/!diff/" + path.split('/')[2].toUpperCase() + "/" + ((path.split("/")[0] != allSemsF[0]) ? ("" + path.split("/")[0] + "/") : "")).then(r => r.json()).then(rChart => {
                if (rChart.status != 200) { document.getElementById("charts").innerHTML = "failed to contact server or script crashed"; return }

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
            })
        }

        setLoadingStatus("hide")
        document.getElementById("topbar_title").innerText = course.replace(course.split(" - ")[0] + " - ", "").substring(course.replace(course.split(" - ")[0] + " - ", ""), course.replace(course.split(" - ")[0] + " - ", "").lastIndexOf(" ("))
        document.getElementById("topbar_subtitle").innerText = path.split("/")[2].substring(0, 4) + " " + path.split("/")[2].replace(path.split("/")[2].substring(0, 4), "") + " • " + ustTimeToString(path.split("/")[0])
        document.getElementById('courses_select_main').classList.add('edge2edge_wide')
        document.getElementById("course_detail_topbar_specialStyles").innerHTML = `<style>
        #courses_select_main{padding:0}
        #courses_select_left{padding:0; max-width:0; width:0; height:0; opacity:0; overflow:clip}
        #courses_select_right{width:100%}
        #courses_detail_content{width:100vw; width:100dvw}
        @media (max-width:1020px) {#courses_select_left{display:none}}
        </style>`
        setTimeout(() => { document.getElementById("course_detail_topbar_specialStyles").innerHTML += "<style>#btn_back{transition-duration:0.1s!important}</style>" }, 500)
    }).catch(error => {
        console.log(error)
        setLoadingStatus("error", false, "failed to contact server or script crashed")
    })
}

let courseSpecificReturnURL = ''

function render_courses_details(path, scrollIntoView = false) {
    courseSpecificReturnURL = "/course/" + path.slice(0, path.lastIndexOf("/") + 1)
    html = document.getElementById("courses_detail_content")
    let withinCourseListPage = (path.split('/').length == 2 || (path.split('/').length == 3 && path.split('/')[2] == ""))
    let withinCourseDetailPage = false
    if (!withinCourseListPage) withinCourseDetailPage = (path.split('/').length == 3 || (path.split('/').length == 4 && path.split('/')[3] == ""))
    if (withinCourseDetailPage) {
        if (path.endsWith("/")) path = path.slice(0, path.length - 1)
        render_courses_details(path.slice(0, path.lastIndexOf("/") + 1))
        return
    }

    fetch("/!course/" + path).then(r => r.json()).then(r => {
        if (r.status != 200) { setLoadingStatus("error", false, "failed to contact server"); return }

        let html_draft = `<style>.uniroomtime{display:none} .uniroomweek{position:unset;margin-top:1em} .uniroomgrid{display:block} .LR_Right{background:none}</style><br><div class="flx"><br><div class="flx" style="gap:0.5em"><p4>View Mode: </p4>`
        if (listMode === "card") {
            html_draft += `<p5><b><div class="ugpgbox flx">
                <button id="cardbtn" style="background:rgba(64,160,255,.4);cursor:default" title="Card View">📇</button>
                <button id="detailbtn" style="background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="listMode = 'detail'; accConfig['listMode'] = 'detail'; update_accConfig('listMode', 'detail'); scrollIntoView = true, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Detail View">🧾</button>
                </div></b></p5></div></div><div class="flx" style="margin-top:0.5em">`
        } else {
            html_draft += `<p5><b><div class="ugpgbox flx">
                <button id="cardbtn" style="background:var(--gbw);cursor:pointer;pointer-events:unset" onclick="listMode = 'card'; accConfig['listMode'] = 'card'; update_accConfig('listMode', 'card'); scrollIntoView = true, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Card View">📇</button>
                <button id="detailbtn" style="background:rgba(64,160,255,.4);cursor:default" title="Detail View">🧾</button>
                </div></b></p5></div></div>`
        }
        Object.keys(r.resp).forEach((course, ix) => {
            if ((studprog === "ug" && parseInt(course[5]) > 0 && parseInt(course[5]) < 5) || (studprog === "pg" && parseInt(course[5]) >= 5)) {
                if (listMode === "card") {
                    html_draft += `<div style="padding:0;page-break-inside:avoid;background-image:url(` + ((course.split(" ")[0] == "COMP" && course.split(" ")[1] == "3511") ? (`https://ia601705.us.archive.org/16/items/windows-xp-bliss-wallpaper/windows-xp-bliss-4k-lu-1920x1080.jpg`) : (resourceNETpath + `uni_ai/` + course.split(" ")[0] + course.split(" ")[1] + `.png`)) + `)" id="` + course.split(" ")[0] + course.split(" ")[1] + `" class="course_sel selbox picbox" onclick="boot('/course/` + path.split('/')[0] + "/" + path.split('/')[1] + "/" + course.split(" ")[0] + course.split(" ")[1] + `/', false, 2)" title="` + course.replaceAll('>', "").replaceAll('<', "").replaceAll('"', "'") + "\n\n" + r.resp[course].attr.DESCRIPTION.replaceAll('>', "").replaceAll('<', "").replaceAll('"', "'") + `"><div class="picbox_inner flx">
                    <div class="picbox_inner_up` + ((typeof accConfig.courses != "undefined" && typeof accConfig.courses[course.split(" - ")[0]] != "undefined" && typeof accConfig.courses[course.split(" - ")[0]][path.split("/")[0]] != "undefined") ? (` flx" style="width:calc(100% - 1.6em)"><style>#` + course.split(" ")[0] + course.split(" ")[1] + `{border:0.25em solid #fffc;margin:0.25em}</style><h5 class="textbox" style="background:#fffc;color:#333">` + accConfig.courses[course.split(" - ")[0]][path.split("/")[0]].grade + `</h5>`) : (`">`)) + `<h5 style="opacity:0.85">` + ((typeof r.resp[course].attr["VECTOR"] === "undefined") ? course.substring(course.lastIndexOf(" (") + 2, course.length).split(")")[0] : r.resp[course].attr["VECTOR"]) + `</h5></div>
                    <div><h4>` + course.split(" (")[0].split(" - ")[0] + `</h4><h5>` + course.replace(course.split(" - ")[0] + " - ", "").substring(course.replace(course.split(" - ")[0] + " - ", ""), course.replace(course.split(" - ")[0] + " - ", "").lastIndexOf(" (")) + `</h5></div></div></div>`
                } else {
                    html_draft += `<div style="margin:1em 0.5em"><div style="page-break-inside:avoid" id="` + course.split(" ")[0] + course.split(" ")[1] + `" class="selbox" onclick="boot('/course/` + path.split('/')[0] + "/" + path.split('/')[1] + "/" + course.split(" ")[0] + course.split(" ")[1] + `/', false, 2)"><div><div><h4>` + course + `</h4><p2 class="no_mobile">` + r.resp[course].attr.DESCRIPTION + `</p2></div>
                    <div class="no_mobile">` + renderCourseAttr(r.resp[course].attr, course) + `</div></div></div></div>`
                }
            }
        })

        if (listMode === "card") html_draft += `</div><div style="padding:0.5em 1em"><p3>The above pictures were generated using AI for illustration purposes only. It does not represent the actual course contents and/or learning outcomes.</p3></div>`
        html.innerHTML = html_draft

        if (scrollIntoView) { if ((Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) <= 520)) { document.getElementById("courses_select_right").scrollIntoView() } else { document.body.scrollIntoView() } }

        setLoadingStatus("hide")
        document.getElementById("topbar_title").innerText = path.split("/")[1]
        document.getElementById("topbar_subtitle").innerText = ustTimeToString(path.split("/")[0])
        document.getElementById('courses_select_main').classList.remove('edge2edge_wide')
        document.getElementById("course_detail_topbar_specialStyles").innerHTML = `
        <style>
        .topbar{z-index:9999!important}
        #btn_back{max-width: 0em; padding: 0em}

        @media (min-width: 520px) {.topbar{border-radius: 1em 1em 0 0}}

        @media (min-width: 1280px) {
            #courses_detail_content{width:calc( 90vw - 29em ); max-width:100%}
            .topbar{padding: max(calc(env(safe-area-inset-top) + 0.5em), 2em) max(calc(env(safe-area-inset-right) + 0.5em), calc(16px + 1em)) calc( 0.5em - 0.08em ) max(calc(env(safe-area-inset-left) + 0.5em), calc(16px + 1em))}
        }
        </style>`
    }).catch(error => {
        console.log(error)
        setLoadingStatus("error", false, "failed to contact server or script crashed")
    })
}

var scrollIntoView = false, doNotCheckUGPG = false
function render_courses(path) {

    if (!document.getElementById("course_detail_topbar_specialStyles")) document.getElementById("courses_select_right").innerHTML = renderTopBar(path.split("/")[1], ustTimeToString(path.split("/")[0]), "", true, "", true, `boot('/search/?q='.concat(encodeURIComponent(document.getElementById('search_box').value)), false, 2)`) + `
    <style>#btn_back, .topbar, #courses_select_main, #courses_select_left, #courses_select_right{transition-timing-function: cubic-bezier(.65,.05,.36,1);transition-duration: 0.5s !important}</style>
    <div id="course_detail_topbar_specialStyles">
        <style>
            .topbar{z-index:9999!important} @media (min-width: 1280px) {.topbar{padding: max(calc(env(safe-area-inset-top) + 0.5em), 2em) max(calc(env(safe-area-inset-right) + 0.5em), calc(16px + 1em)) calc( 0.5em - 0.08em ) max(calc(env(safe-area-inset-left) + 0.5em), calc(16px + 1em))}}
        </style>
    </div>
    <div id="courses_detail_content"></div>`
    setLoadingStatus("show")
    document.getElementById("courses_select_left_top").innerHTML = `
    <div class="flx">
    <h2>Courses</h2>
    <p5><b><div class="ugpgbox flx">
        <button id="ugbtn" onclick="studprog = 'ug'; accConfig['studprog'] = 'ug'; update_accConfig('studprog', 'ug'); scrollIntoView = false, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Undergraduate Courses">UG</button>
        <button id="pgbtn" onclick="studprog = 'pg'; accConfig['studprog'] = 'pg'; update_accConfig('studprog', 'pg'); scrollIntoView = false, doNotCheckUGPG = true; boot(window.location.pathname, true, 2)" title="Postgraduate Courses">PG</button>
    </div></b></p5>
    </div>`

    if (!(path.split('/').length <= 2 || (path.split('/').length == 3 && path.split('/')[2] == ""))) {
        render_courses_specific(path, true)
        return
    }

    apply_config()
    render_UGPG_switch()

    html = document.getElementById("courses_select_left_optionBox")
    let semx = ((ustTimeToString(decodeURI(path.split("/")[0])) != '----') ? decodeURI(path.split("/")[0]) : allSems[0])
    let html_draft = `<select style="width:100%" name="timeid" id="timeid" title="Select Semester" onchange="boot('/course/' + document.getElementById('timeid').value + '/' + deptx + '/', false, 2)">`
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
        alert('i hope i can know what courses will exist in the future too 👀')
        boot("/", true)
        return
    }

    fetch("/!course/" + semx + "/").then(r => r.json()).then(r => {
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

        html_draft += `<div id="myDropdown" class="flx"><input type="text" placeholder="Filter..." id="myInput" onkeyup="filterFunction()">`
        depts.forEach(dept => {
            html_draft += `<button onclick="scrollIntoView = true, doNotCheckUGPG = false; boot('/course/' + document.getElementById('timeid').value + '/` + dept + `/', false, 2)"`
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
    document.getElementById("courses_select_left_top").innerHTML = `<h2>Instructors</h2>`

    let html_draft = ""
    let path_hv_people_match = false
    let target_people = "LAM, Gibson"
    html = document.getElementById("courses_select_left_optionBox")

    let hdraft = ""
    peoples.forEach(people => {
        hdraft += `<button onclick="peoplex='` + people + `';boot('/people/` + people + `/' + document.getElementById('timeid').value + '/', false, 2)" style="display:none;`
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
        html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="boot('/people/' + peoplex + '/' + document.getElementById('timeid').value + '/', false, 2)">`
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

        if (ustTimeToString(target_time) === '----') { html.innerHTML = `the url is not in a valid format`; return }
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

var roomx = "LTA"
var room_show_textbox = false

function render_room(path) {

    document.getElementById("courses_select_left_top").innerHTML = `<h2>Rooms</h2>`

    let html_draft = ""
    let path_hv_room_match = false
    let target_room = "LTA"
    html = document.getElementById("courses_select_left_optionBox")

    if (room_show_textbox) {
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
        html_draft = `<div id="myDropdown" class="flx" style="flex-grow:1"><input type="text" placeholder="Search.." id="myInput" onclick="this.select()" onkeyup="filterFunction(true)" value="` + target_room + `">` + hdraft + `</select>`

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
        let roomMinSem = ((signinlevel === 0) ? (parseInt(allSems[0]) - 99) : 2000)
        let target_time = ((roomAvilSems.includes(allSems[0])) ? allSems[0] : roomAvilSems[0])
        if (roomAvilSems.filter(n => parseInt(n) > roomMinSem).length === 0) skipRoomRestriction = true
        if (skipRoomRestriction) {
            allSems = allSems.filter(n => parseInt(n) > 2000)
        } else {
            allSems = roomAvilSems.filter(n => parseInt(n) > roomMinSem)
        }
        if (room_show_textbox) {
            html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="boot('/room/' + roomx + '/' + document.getElementById('timeid').value + '/', false, 2)">`
        } else {
            html_draft += ` <select name="timeid" id="timeid" title="Select Semester" onchange="boot('/room/' + document.getElementById('roomid').value + '/' + document.getElementById('timeid').value + '/', false, 2)">`
        }
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
        html_draft += `</optgroup></select></div>`
        html.innerHTML = html_draft

        html = document.getElementById("courses_select_right")
        html_draft = `<div id="roominfo"><center><div id="d_loading"></div></center></div>`
        html.innerHTML = html_draft
        html = document.getElementById("roominfo")

        html_draft = ""

        if (ustTimeToString(target_time) === '----') { html.innerHTML = `the url is not in a valid format`; return }
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
                    ` + ((type == "room" || type == "people") ? `onclick="boot('/course/` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/', false, 2)"` : '') + `>
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
                onclick="boot('/course/` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/', false, 2)">
                <h4>` + lesson.date.substring(0, 25) + `</h4><h5>` + lesson.date.slice(25) + `</h5>
                <p2>` + lesson.course.split(" - ")[0] + ` - ` + lesson.section + `<br><i>` + lesson.course.replace(lesson.course.split(" - ")[0] + " - ", "").slice(0, -9) + `</i></p2>
                </div>`
            } else if (type === "people") {
                html_draft += `<div style="margin:0.75em 0.5em 0.75em 0.25em;padding:0.25em 0.5em 0.25em 0.75em;border-left:0.25em solid #ff888888;cursor:pointer" onclick="boot('/course/` + target_time + `/` + lesson.course.split(" - ")[0].split(" ")[0] + `/` + lesson.course.split(" - ")[0].replace(" ", "") + `/', false, 2)"><h4>` + lesson.course.split(" - ")[0] + ` (` + lesson.section.split(' (')[0] + `)</h4><p2><i>` + lesson.course.split(" - ")[1] + ` (` + lesson.section.split(' (')[1] + `</i><small><br>` + ((typeof lesson.date != "undefined") ? '' + lesson.date.substring(0, 25) + `<br>` + lesson.date.slice(25) + '<br>' : '') + lesson.room + `</small></p2></div>`
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