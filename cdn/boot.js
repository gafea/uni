function renderTopBar(title = ' ', subtitle = '', buttonHTML = '', showSearch = false, additionalHTML = '', showBack = true, searchSubmitJS = `boot('/_dig/'.concat(document.getElementById('search_box').value))`, embedMode = false) {
    return `<div class="` + ((!(buttonHTML || showSearch)) ? 'topbar_mobilefix ' : '') + `topbar flx">` + ((showBack) ? `<button onclick="window.history.back();" class="acss aobh no_print" id="btn_back" tabindex="0" title="back"><b>く<span class="no_mobile"> back</span></b></button>` : "") + `
    <div id="topbar_loading">
        <div id="topbar_loading_show"></div>
        <div id="topbar_loading_more"></div>
    </div>
    <div class="dwhdt flx dwhdto"><div class="dwhdt">
        <b id="topbar_title_wrap">
            <b id="topbar_title_inwrap_main">
                <h4 id="topbar_title">` + title + '</h4><p4 id="topbar_subtitle">' + subtitle + `</p4>
            </b>
            <b id="topbar_title_inwrap_secondary">
                <div id="topbar_title_inwarp_sec_buf"></div>
                <div id="topbar_title_inwarp_sec_buf_sec"></div>
                <h4 id="topbar_inwrap_title"></h4>
                <p4 id="topbar_inwrap_subtitle"></p4>
            </b>
        </b>
    </div></div>
    ` + ((buttonHTML) ? (`<div class="flx dwhda">` + buttonHTML + `</div>` + ((showSearch) ? `<style>@media (max-width: 520px) {#btn_back{width:45.6px}}</style>` : "")) : '') + ((showSearch) ? `
    <div class="pgsbtn flx no_print">
    <label for="search_box" id="topbtn_search" class="dwhdab" title="Search box">
        <img alt="Search" src="` + resourceNETpath + `image/search.png" draggable="false">
        <style>#topbtn_search{background-color:rgba(160,160,255,.1)} #topbtn_search:hover{background-color:rgba(160,160,255,.25)} #topbtn_search:hover:active > img{transform:rotate(6deg)}</style>
    </label>
    <form onsubmit="` + searchSubmitJS + `;this.blur();return false"><input id="search_box" name="dw" type="search" placeholder="Search for something..." title="Search for something..."></form>
    </div>` : ``) + additionalHTML + ((showBack && !(buttonHTML || showSearch)) ? `<style>
    @media (max-width: 520px) {#btn_back {order:unset} .dwhdto {width:calc(100% - 3.5em)} .topbar_mobilefix > .dwhdto {min-height:2.75em}}
    @container (max-width:520px) {#btn_back {order:unset} .dwhdto {width:calc(100% - 3.5em)} .topbar_mobilefix > .dwhdto {min-height:2.75em}}
    </style>` : '') + (embedMode ? `<style>
    .topbar{padding-top:0.5em;top:0}
    @media (max-width: 520px) {
        .dwhdto{min-height:0;padding-bottom:0}
        .dwhdto > .dwhdt {padding:0}
        #topbar_title_inwarp_sec_buf{height:0!important}
    }
    </style>` : "") + `</div>`
}

function checkSafariToken() {
    fetch('/!acc/name', {}).then(r => r.json()).then(r => {
        if (r.status != 200) {
            setTimeout(() => { checkSafariToken() }, 500)
        } else {
            document.getElementById("OverlayContent").innerHTML = `<center style="padding:4.25em">✅ success!</center>`
            setTimeout(() => {
                prev_boot_call = 'none'
                prev_call = 'none'
                boot(window.location.pathname, true)
            }, 150)
            setOverlayStatus('hide', false)
        }
    }).catch(e => {
        setTimeout(() => { checkSafariToken() }, 5000)
    })
}
var pending_cToken_refresh = false
window.addEventListener('message', function (e) { //for getting account cToken update and refresh browser
    const r = JSON.parse(e.data)
    if (pending_cToken_refresh && r.fx === 'update_cToken') {
        if (r.status === 200 || r.status === 203) {
            document.getElementById("OverlayContent").innerHTML = `<center style="padding:4.25em">`.concat(((r.status === 200) ? `✅ success!` : `✅ pass`)).concat(`</center>`)
            setTimeout(() => {
                reboot()
            }, 150)
            setOverlayStatus('hide', false)
        } else if (r.status === 400 && r.msg === 'reply-check-failed') { //fuck safari
            document.getElementById("OverlayContent").innerHTML = `<center style="padding:4.25em;display:block;width:max-content"><a target="_parent" class="aobh" href="https://me.gafea.net/_update_cToken">click here to sign back in to your account</a></center>`
            checkSafariToken()
        } else {
            document.getElementById("OverlayContent").innerHTML = `<center style="padding:2.25em">❌ failed<br><small><span id="signin_error_msg"></span></small><br><br><a target="_parent" class="aobh" href="https://me.gafea.net/_signOut">sign out</a> | <a class="aobh" onclick="setOverlayStatus('hide',true)">cancel</a></center>`
            document.getElementById("signin_error_msg").innerText = r.msg
            alert("you are no longer signed in, did you remove this device?")
        }
    } else if (r.fx === 'signOut') {
        window.location.reload()
    }
})
const setOverlayStatus = (type, noDelay = true, elem = "overlay") => {
    if (elem == "overlay") {
        element = document.getElementById("OverlayWrp")
        if (type == 'show') {
            noDelay = true
            element.style.display = "flex"
            element.style.opacity = "1"
        } else if (type == 'hide') {
            let x = (noDelay) ? 0 : 1350
            setTimeout(() => {
                element.style.opacity = "0"
            }, x)
            setTimeout(() => {
                element.style.display = "none"
                try { setLoadingStatus('hide') } catch (error) { }
            }, x + 150)
        }
    } else if (elem == "cover") {
        element = document.getElementById("cover_screen")
        if (type == 'show') {
            document.getElementById("cover_spin").innerHTML = ""
            document.body.style.overflow = "hidden"
            element.style.display = "flex"
            document.getElementById("cover_spin").style.display = "block"
            let x = (noDelay) ? 0 : 1350
            setTimeout(() => {
                element.style.opacity = "1"
            }, 0)
            setTimeout(() => {
                document.getElementById("cover_spin").style.opacity = "1"
            }, x)
        } else if (type == 'hide') {
            let x = (noDelay) ? 0 : 1350
            setTimeout(() => {
                document.getElementById("cover_spin").style.opacity = "0"
            }, x * 0.25)
            setTimeout(() => {
                element.style.opacity = "0"
            }, x)
            setTimeout(() => {
                element.style.display = "none"
                document.body.style.overflow = "auto"
                document.getElementById("cover_spin").innerHTML = ""
            }, x + 150)
        } else if (type == 'success') {
            document.getElementById("cover_spin").innerHTML = '<style>#cover_spin{border-color:#33ff99!important;background-color:#33ff99;color:green;animation:none!important;transition-duration:0s!important} #cover_spin::before{content:"✓"}</style>'
            setTimeout(() => {
                document.getElementById("cover_spin").innerHTML = '<style>#cover_spin{border-color:#33ff99!important;background-color:#33ff99;color:green;animation:none!important;transition-duration:0.15s!important} #cover_spin::before{content:"✓"}</style>'
            }, 100);
        }
    }
}
const refresh_cToken = () => {
    pending_cToken_refresh = true
    bottomBarUserInfo = ""
    document.getElementById("OverlayWrp").style.display = "flex"
    document.getElementById("OverlayWrp").style.opacity = "1"
    document.getElementById("OverlayContent").innerHTML = `<iframe src="https://me.gafea.net/_update_cToken" style="border:none;width:20em;height:10em;margin:0" name="authFrame" scrolling="no" frameborder="0" margin="0"></iframe>`
}

function renderBottomBar(loc, hideUser = false, icon = "") {
    if (!navigator.cookieEnabled) hideUser = true
    if (!hideUser) setTimeout(() => renderBottomBarUserInfo(), 200)
    document.getElementById("bottomBar").innerHTML = `<div class="bottom_wrp flx"><a href="/" style="height:52px"><img class="ckimg" src="` + (icon ? ("" + icon + `" style="filter:unset`): ("" + resourceNETpath + "image/ck.svg")) + `" draggable="false" alt="Home"></a>` + renderBottomBarButtons(bottombarbuttons, loc) + `<div class="ckimg"><div class="flx ckusrico"><button type="button" tabindex="1001" class="ckusrbtn">
    <a href="" tabindex="0"><img alt="" src="https://me.gafea.net/getpp/" draggable="false"></a>
    <div class="ckusrwrp">
    
        <div id="ckusrinfo"` + ((hideUser) ? ' style="display:none!important"' : '') + `></div>

        <a tabindex="0" href="https://gafea.net/terms" target="_blank">Terms</a> • <a tabindex="0" href="https://gafea.net/privacy" target="_blank">Privacy</a>
         
    </div></button>
    <button type="button" tabindex="1000" class="tabview-close"><img alt="Close" src="` + resourceNETpath + `image/circle-cross.png" draggable="false"> <p4 style="opacity:0.8"><b>Close</b></p4></button>
    </div></div></div>`
    return `<div id="divheadbuffer"></div>`
}

let bottomBarUserInfo = "" //this is a string, aka not inited
function renderBottomBarUserInfo() {
    if (typeof bottomBarUserInfo === "string") {
        fetch('/!acc/name', {}).then(r => r.json()).then(r => {bottomBarUserInfo = r; renderBottomBarUserInfo()}).catch(e => console.log(e))
    } else {
        if (bottomBarUserInfo.status >= 500) {
            document.getElementById("ckusrinfo").innerHTML = `<p2>:( server error</p2><br><br>`
        } else if (bottomBarUserInfo.status != 200) {
            if (bottomBarUserInfo.cTokenOnly) { refresh_cToken() }
            document.getElementById("ckusrinfo").innerHTML = `<a href="https://me.gafea.net" target="_blank" tabindex="0"><button>sign in</button></a><br><br><br>`
        } else {
            document.getElementById("ckusrinfo").innerHTML = `<div class="flx" style="justify-content:center">
            <div class="usericon"><a href="https://me.gafea.net" target="_blank" tabindex="0"><img alt="" src="https://me.gafea.net/getpp/" draggable="false"></a></div>
            <div class="usertext"><h4>` + bottomBarUserInfo.name.replace(/[\u00A0-\u9999<>\&]/g, (i) => { return '&#' + i.charCodeAt(0) + ';' }) + `</h4><p4>` + ((signinlevel === 2) ? 'Admin' : '') + `</p4></div>
            </div><br>`
        }
    }
}

function renderBottomBarButtons(Buttons, SelectedButton) {
    var results = `<form class="tabview flx" tabindex="1002"><div class="tabview-wrp" tabindex="1001">`;
    var btnx = [];
    var hit = false;
    Buttons.forEach(btn => {
        btnx = btn.split(',')
        try {
            if (SelectedButton === btnx[2]) {
                results += `<button onclick="boot('` + btnx[1] + `'` + ((typeof btnx[4] != undefined) ? (`, false, ` + btnx[4]) : ("")) + `);blur()" type="button" tabindex="1000" class="tabview-sel tabview-sel-s">
                <img src="` + btnx[3] + `" draggable="false" alt=""><p3>` + btnx[0] + `</p3><div class="tabview-sel-tri"></div>
                </button>`
                hit = true
            } else {
                results += `<button onclick="boot('` + btnx[1] + `'` + ((typeof btnx[4] != undefined) ? (`, false, ` + btnx[4]) : ("")) + `)" class="tabview-sel tabview-sel-h">
                <img src="` + btnx[3] + `" draggable="false" alt=""><p3>` + btnx[0] + `</p3>
                </button>`
            }
        } catch (error) { }
    })
    if (!hit) {
        results += `<button type="button" tabindex="1000" class="tabview-sel tabview-sel-s">
        <img src="` + resourceNETpath + `image/nullicon.png" draggable="false" alt=""><p3>` + SelectedButton + `</p3><div class="tabview-sel-tri"></div>
        </button>`
    }
    results += `</div><button type="button" tabindex="1000" class="tabview-close"><img alt="Close" draggable="false" src="` + resourceNETpath + `image/circle-cross.png"> <p4 style="opacity:0.8"><b>Close</b></p4></button></form><style>@media only screen and (max-width:520px) {.bottom_wrp > a > .ckimg{display:none!important}}</style>`
    return results
}

function renderErrorPage(title, message) {
    return `<div class="b flx">
    <div class="x flx">
      <div class="p">
        <h1><b>` + title + `</b></h1><br>
        <p1 style="opacity:0.8"><b>` + message + `</b></p1>
      </div>
      <img alt="` + title + `" class="i" src="` + resourceNETpath + `image/nojs.png">
    </div>
  </div>
  
  <style>
    body{overflow-y:hidden;background-color:black;font-family:AppleSDGothicNeo-Regular, PingFangHK-Regular, Calibri, Microsoft JhengHei, verdana}
    h1{font-size:1.375em;margin:0;vertical-align:middle;display:inline} p1{font-size:0.975em}
    .b{color:white;justify-content:space-between;position:fixed;bottom:0;left:0;right:0;border-top:0.15em solid #3f3c39;padding:0.75em;padding:0.75em calc(0.75em + env(safe-area-inset-right)) calc(0.75em + env(safe-area-inset-bottom)) calc(0.75em + env(safe-area-inset-left))}
    .i{object-fit:contain;height:3.25em} .p, .i, .aobh{margin:0.25em} .x, .i{order:1} .y, .p{order:2}
    .s{display:inline;border-radius:0.25em;background-color:#008000;padding:0.1em 0.25em;margin:0.25em 0.375em 0.25em 0}
    .flx{flex-flow:wrap;display:flex;align-items:center} .flx div{vertical-align:middle}
    @media print{.no_print{display:none!important} body, .s{background-color:white} .s{border:1px solid black} .b{color:black} .i{filter:brightness(0.2)}}
  </style>`
}

async function sha512(message) {
    function bufferToHex(buffer) {
        return [...new Uint8Array(buffer)]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-512', data);
    return bufferToHex(hash).toUpperCase();
}

const rndStr = () => (Math.random() + 1).toString(36).substring(2)

const emptyimg = `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`

var popArray = []

var LoadingStatusQueue = 0
const setLoadingStatusCSS = {
    success: `<style>#topbar_loading::before{border-color:#33ff99!important;background-color:#33ff99;color:green;animation:none;content:"✓"}</style>`,
    warn: {
        dim: '<style>#topbar_loading{opacity:0.3} #topbar_loading::before{border-color:#ffaa33!important;animation:none}</style>',
        grow: '<style>#topbar_loading{opacity:1} #topbar_loading::before{border-color:#ffaa33!important;animation:none}</style>'
    },
    error: {
        hide: '<style>#topbar_loading::before{border-color:#FF4238!important;background-color:#FF4238;animation:none}</style>',
        show: '<style>#topbar_loading::before{border-color:#FF4238!important;background-color:#FF4238;color:white;animation:none;content:"✘"}</style>'
    },
    show: {
        start: '<style>#topbar_loading{display:unset;opacity:0;transform:translateX(-1.5em);width:0}</style>',
        end: '<style>#topbar_loading{display:unset;opacity:1;transform:translateX(0);width:2.25em}</style>'
    },
    hide: {
        start: '<style>#topbar_loading{opacity:0;transform:translateX(-1.5em);width:0}</style>',
        end: '<style>#topbar_loading{display:none;opacity:0;transform:translateX(-1.5em);width:0}</style>'
    }
}

function setLoadingStatus(type, presistant = false, title = '', subtitle = '', jumpToShow = '') {
    if (!(jumpToShow || (typeof alwaysExecSetLoadingStatusImmediately != "undefined" && alwaysExecSetLoadingStatusImmediately) || type === 'show' || type === 'hide' || LoadingStatusQueue === 0 )) {
        //console.log('[LoadingStatus] ' + type + ' queued')
        setTimeout(() => { setLoadingStatus(type, presistant, title, subtitle) }, 100, type, presistant, title, subtitle);
        return false;
    }

    var presistTime = 2850
    const lx = document.getElementById("topbar_loading_show")
    const l = document.getElementById("topbar_loading_more")

    switch (type) {
        case 'success':
            setLoadingStatus('show', false, '', '', setLoadingStatusCSS.success)
            setTimeout(setLoadingStatus, 500, 'show', false, '', '', setLoadingStatusCSS.success)
            setTimeout(setLoadingStatus, 1000, 'show', false, '', '', setLoadingStatusCSS.success)
            setTimeout(setLoadingStatus, 1500, 'show', false, '', '', setLoadingStatusCSS.success)
            setTimeout(setLoadingStatus, 2000, 'show', false, '', '', setLoadingStatusCSS.success)
            setTimeout(setLoadingStatus, 2500, 'show', false, '', '', setLoadingStatusCSS.success)
            presistTime = 2850; LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, presistTime + 750)
            break
        case 'warning':
            setLoadingStatus('show', false, '', '', setLoadingStatusCSS.warn.grow)
            presistTime = 6350; LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, presistTime + 750)
            setTimeout(setLoadingStatus, 600, 'show', false, '', '', setLoadingStatusCSS.warn.dim)
            setTimeout(setLoadingStatus, 1300, 'show', false, '', '', setLoadingStatusCSS.warn.grow)
            setTimeout(setLoadingStatus, 2000, 'show', false, '', '', setLoadingStatusCSS.warn.dim)
            setTimeout(setLoadingStatus, 2700, 'show', false, '', '', setLoadingStatusCSS.warn.grow)
            setTimeout(setLoadingStatus, presistTime - 350, 'show', false, '', '', setLoadingStatusCSS.warn.dim)
            break
        case 'error':
            setLoadingStatus('show', false, '', '', setLoadingStatusCSS.error.show)
            presistTime = 6850; LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, presistTime + 750)
            setTimeout(setLoadingStatus, 850, 'show', false, '', '', setLoadingStatusCSS.error.hide)
            setTimeout(setLoadingStatus, 1350, 'show', false, '', '', setLoadingStatusCSS.error.show)
            setTimeout(setLoadingStatus, 1850, 'show', false, '', '', setLoadingStatusCSS.error.hide)
            setTimeout(setLoadingStatus, 2350, 'show', false, '', '', setLoadingStatusCSS.error.show)
            setTimeout(setLoadingStatus, 2850, 'show', false, '', '', setLoadingStatusCSS.error.hide)
            setTimeout(setLoadingStatus, 3350, 'show', false, '', '', setLoadingStatusCSS.error.show)
            break
        case 'show':
            presistant = true
            if (jumpToShow) l.innerHTML = jumpToShow
            lx.innerHTML = setLoadingStatusCSS.show.start
            setTimeout(() => {
                lx.innerHTML = setLoadingStatusCSS.show.end
            }, 1)
            break
        case 'hide':
            presistant = true;
            lx.innerHTML = setLoadingStatusCSS.hide.start
            setTimeout(() => {
                lx.innerHTML = setLoadingStatusCSS.hide.end
                l.innerHTML = ''
            }, 650)
            break
    }

    if (title) {
        document.getElementById("topbar_title_inwarp_sec_buf").style.maxHeight = '0'
        document.getElementById("topbar_title_inwrap_secondary").style.maxHeight = '0'
        document.getElementById("topbar_title_inwrap_main").style.opacity = 0
        document.getElementById("topbar_title_inwrap_secondary").style.opacity = 0
        document.getElementById("topbar_inwrap_title").innerText = title
        document.getElementById("topbar_inwrap_subtitle").innerText = subtitle
        setTimeout(() => {
            document.getElementById("topbar_title_inwrap_main").style.display = 'none'
            document.getElementById("topbar_title_inwrap_secondary").style.opacity = 1
            document.getElementById("topbar_title_inwrap_secondary").style.maxHeight = 'unset'
            document.getElementById("topbar_title_inwarp_sec_buf").style.maxHeight = '2.75em'
            document.getElementById("topbar_title_inwarp_sec_buf_sec").style.maxHeight = '0.75em'
        }, 200)
    }
    if (!jumpToShow && !presistant) {
        setTimeout(() => {
            setLoadingStatus('hide')
        }, presistTime - 300)
        setTimeout(() => {
            document.getElementById("topbar_title_inwrap_secondary").style.opacity = 0
            document.getElementById("topbar_title_inwarp_sec_buf").style.maxHeight = '0'
            document.getElementById("topbar_title_inwarp_sec_buf_sec").style.maxHeight = '0'
        }, presistTime - 200)
        setTimeout(() => {
            document.getElementById("topbar_title_inwrap_main").style.display = 'block'
            document.getElementById("topbar_inwrap_title").innerText = ''
            document.getElementById("topbar_inwrap_subtitle").innerText = ''
            setTimeout(() => { document.getElementById("topbar_title_inwrap_main").style.opacity = 1 }, 200)
        }, presistTime)
    }
}

//easy post to server
window.post = function (url, data) {
    return fetch(url, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
}

//easy formdata to json
function formToJson(data) {
    var object = {}
    data.forEach((value, key) => {
        if (!Reflect.has(object, key)) { object[key] = value; return }
        if (!Array.isArray(object[key])) { object[key] = [object[key]] }
        object[key].push(value)
    })
    return object
}

//add css into html
function installCSS(targetCSS, path = resourceNETpath) {
    var stylesheet = document.createElement('link')
    stylesheet.href = path.concat(targetCSS)
    stylesheet.rel = 'stylesheet'
    document.getElementsByTagName('head')[0].appendChild(stylesheet)
}
installCSS('webel.css')

//make back button works
window.onpopstate = function (event) {
    popArray.pop()
    if (typeof noPopStateShowLoading === "undefined") try { setLoadingStatus("show") } catch (error) { }
    let prevPath = decodeURIComponent((event.state) ? event.state.plate : window.location.pathname + window.location.search)
    boot(prevPath, true, ((prev_bootID_call != -2) ? (bootID_mapper(prevPath)) : (-1)))
}

//<a href=""> -> <a onclick="boot()">
function hrefInterrupt(event) {
    if (!(event.target.getAttribute('href').startsWith('http://') || event.target.getAttribute('href').startsWith('https://'))) {
        event.preventDefault();
        boot(event.target.getAttribute('href'));
    }
}

//list of post-script cleanup
function postCleanup() {
    document.querySelectorAll('a').forEach(link => link.addEventListener('mousedown', hrefInterrupt));
    exe('cleanup')
}

//load new page
var prev_bootID_call = -2;
var prev_boot_call = 'none';
var isBootRunning = false;

function boot(path, noHistory, bootID = -1) {

    //if url start with '//' then throw it away
    if (path.startsWith('//')) {
        setTimeout(() => {boot('/', false)}, 200)
        return false; //stop running boot
    }

    //check if boot is already running, prevent accidental double-clicking and overwriting
    if (isBootRunning) {
        console.log('[boot] boot aready running! current process: '.concat(prev_boot_call).concat(', ').concat(path).concat(' will be skipped loading.'));
        return false; //stop running boot
    }

    isBootRunning = true;

    //check should add current URL into history, then change URL shown in browser
    (noHistory) ? history.replaceState(null, window.title, path) : history.pushState({ plate: path }, window.title, path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    //window.removeEventListener('scroll', dwLib_scrolling); //remove infinite scroll script from lib
    //document.querySelectorAll('.lib_div').forEach(e => e.remove()); //remove lib div from body

    if (!path) path = '/'

    if ((bootID != -1) ? (prev_bootID_call != bootID) : (prev_boot_call != path)) { //if already init page then don't init it again

        if (typeof bootID_mapper === "function") prev_bootID_call = bootID_mapper(path);
        prev_boot_call = path;
        let x = init(path);
        if (!!x) {
            document.getElementById('core').innerHTML = x
            setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, 20)
        }
        postCleanup();

    }

    exe(path); //execute scripts

    isBootRunning = false;

    return true;
}

function reboot(soft = false) {
    if (soft) {
        if (prev_bootID_call == -2) {
            boot(window.location.pathname, true)
        } else {
            boot(window.location.pathname, true, prev_bootID_call)
        }
        return
    }
    prev_bootID_call = -2
    prev_boot_call = 'none'
    prev_call = 'none'
    bottomBarUserInfo = ""
    document.getElementById("bottomBar").innerHTML = ""
    boot(window.location.pathname, true)
}

boot(window.location.pathname + window.location.search + ((document.URL.split('#')[1]) ? "#" + document.URL.split('#')[1] : ''), true)

var signinlevel = 0
const updateSLV = () => {
    fetch('https://' + window.location.hostname + '/!acc/').then(r => r.json()).then(r => {
        if (r.status === 200 && r.summary.valid) {
            //if (signinlevel != r.summary.signinlevel) {
            //    setTimeout(() => {reboot()}, 25)
            //}
            signinlevel = r.summary.signinlevel
        } else if (r.summary.check.cTokenOnly) {
            refresh_cToken()
        } else if (signinlevel >= 1 && r.status === 200 && !r.summary.valid && !r.summary.check.cToken) {
            signinlevel = 0
            if (typeof signout_reboot_customScript === 'function') setTimeout(() => {signout_reboot_customScript()}, 1)
            setTimeout(() => {reboot()}, 25)
            setTimeout(() => {alert("You have signed out from this browser.")}, 2000)
        }
    })
}

if (typeof disable_SLV_check === 'undefined' || !disable_SLV_check) {
    updateSLV()
    setInterval(() => {updateSLV()}, 60000)
}