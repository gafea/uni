function renderTopBar(title = ' ', subtitle = '', buttonHTML = '', showSearch = false, additionalHTML = '', showBack = true) {
    return `<div class="` + ((!(buttonHTML || showSearch)) ? 'topbar_mobilefix ' : '') + `topbar flx">` + ((showBack) ? `<button onclick="window.history.back();" class="acss aobh no_print" style="padding:0.5em;font-size:16px;white-space:pre;transition-duration:0s" id="btn_back" tabindex="0" title="back"><b>く<span class="no_mobile"> back</span></b></button>` : "") + `
    <div id="topbar_loading"></div>
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
    ` + ((!!buttonHTML) ? `<div class="flx dwhda">` + buttonHTML + `</div>` : '') + ((showSearch) ? `
    <div class="pgsbtn flx no_print">
    <label for="search_box" id="topbtn_search" class="dwhdab" onclick="if (event.shiftKey) { window.open('/_dig/', '_blank') }" title="Search box\nHold shift to open in new tab">
        <img alt="Search" src="` + resourceNETpath + `image/search.png" draggable="false">
        <style>#topbtn_search{background-color:rgba(160,160,255,.1)} #topbtn_search:hover{background-color:rgba(160,160,255,.25)} #topbtn_search:hover:active > img{transform:rotate(6deg)}</style>
    </label>
    <form onsubmit="boot('/_dig/'.concat(document.getElementById('search_box').value));this.blur();return false"><input id="search_box" name="dw" type="search" placeholder="Search for something..." title="Search for something..."></form>
    </div>` : ``) + additionalHTML + ((showBack && !(buttonHTML || showSearch)) ? `<style>@media (max-width: 520px) {#btn_back {order:unset} .dwhdto {width:calc(100% - 3.5em)} .topbar_mobilefix > .dwhdto {min-height:2.75em}}
    @container (max-width:520px) {#btn_back {order:unset} .dwhdto {width:calc(100% - 3.5em)} .topbar_mobilefix > .dwhdto {min-height:2.75em}}</style>` : '') + `</div>`
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
            document.getElementById("OverlayContent").innerHTML = `<center style="padding:2.25em">❌ failed<br><small>(` + r.msg + `)</small><br><br><a target="_parent" class="aobh" href="https://me.gafea.net/_signOut">sign out</a> | <a class="aobh" onclick="setOverlayStatus('hide',true)">cancel</a></center>`
            alert("you are no longer signed in, did you remove this device?\n\n(error message: ".concat(r.msg).concat(")"))
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

function renderBottomBar(loc, hideUser = false) {
    if (!hideUser) setTimeout(() => renderBottomBarUserInfo(), 200)
    document.getElementById("bottomBar").innerHTML = `<div class="bottom_wrp flx"><a href="/" style="height:52px"><img class="ckimg" src="` + resourceNETpath + `image/ck.svg" draggable="false" alt="Home"></a>` + renderBottomBarButtons(bottombarbuttons, loc) + `<div class="ckimg"><div class="flx ckusrico"><button type="button" tabindex="1001" class="ckusrbtn">
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
        if (bottomBarUserInfo.status != 200) {
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
                results += `<button onclick="boot('` + btnx[1] + `');blur()" type="button" tabindex="1000" class="tabview-sel tabview-sel-s">
                <img src="` + btnx[3] + `" draggable="false" alt=""><p3>` + btnx[0] + `</p3><div class="tabview-sel-tri"></div>
                </button>`
                hit = true
            } else {
                results += `<button onclick="boot('` + btnx[1] + `')" class="tabview-sel tabview-sel-h">
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

var popArray = []

var LoadingStatusQueue = 0;
var errorLoadingCSS = ['<style>#topbar_loading::before{border-color:#FF4238!important;background-color:#FF4238;animation:none}</style>', '<style>#topbar_loading::before{border-color:#FF4238!important;background-color:#FF4238;color:white;animation:none;content:"✘"}</style>']

function setLoadingStatus(type, presistant = false, title = '', subtitle = '') {
    if ((type != 'hide' && LoadingStatusQueue > 0) && typeof alwaysExecSetLoadingStatusImmediately === "undefined") {
        //console.log('[LoadingStatus] ' + type + ' queued')
        setTimeout(() => { setLoadingStatus(type, presistant, title, subtitle) }, 100, type, presistant, title, subtitle);
        return false;
    }

    var l = document.getElementById("topbar_loading");
    var presistTime = 2850;
    switch (type) {
        case 'success':
            setLoadingStatus('show')
            presistTime = 2850; LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, presistTime + 750)
            l.innerHTML = '<style>#topbar_loading::before{border-color:#33ff99!important;background-color:#33ff99;color:green;animation:none;content:"✓"}</style>'
            break
        case 'warning':
            setLoadingStatus('show')
            presistTime = 6350; LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, presistTime + 750)
            l.innerHTML = '<style>#topbar_loading::before{border-color:#ffaa33!important;animation:none}</style>'
            setTimeout(() => { l.style.opacity = 0.3 }, 600)
            setTimeout(() => { l.style.opacity = 1 }, 1300)
            setTimeout(() => { l.style.opacity = 0.3 }, 2000)
            setTimeout(() => { l.style.opacity = 1 }, 2700)
            break
        case 'error':
            setLoadingStatus('show')
            presistTime = 6850; LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, presistTime + 750)
            l.innerHTML = errorLoadingCSS[1]
            setTimeout(() => { l.innerHTML = errorLoadingCSS[0] }, 850)
            setTimeout(() => { l.innerHTML = errorLoadingCSS[1] }, 1350)
            setTimeout(() => { l.innerHTML = errorLoadingCSS[0] }, 1850)
            setTimeout(() => { l.innerHTML = errorLoadingCSS[1] }, 2350)
            setTimeout(() => { l.innerHTML = errorLoadingCSS[0] }, 2850)
            setTimeout(() => { l.innerHTML = errorLoadingCSS[1] }, 3350)
            break
        case 'show':
            LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, 50)
            l.innerHTML = "";
            l.style.display = 'unset';
            setTimeout(() => {
                l.style.opacity = 1;
                l.style.transform = 'translateX(0)';
                l.style.width = '2.25em';
            }, 25)
            presistant = true;
            break
        case 'hide':
            LoadingStatusQueue += 1; setTimeout(() => { LoadingStatusQueue -= 1 }, 700)
            l.style.opacity = 0;
            l.style.transform = 'translateX(-1.5em)';
            setTimeout(() => {
                l.style.width = '0';
            }, 0) //50
            setTimeout(() => {
                l.style.display = 'none';
                l.innerHTML = "";
            }, 650) //700
            presistant = true;
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
    if (!presistant) {
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
    setTimeout(() => {
        boot(decodeURIComponent((event.state) ? event.state.plate : window.location.pathname), true)
    }, 50)
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
var prev_boot_call = 'none';
var isBootRunning = false;

function boot(path, noHistory) {

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

    if (prev_boot_call != path) { //if already init page then don't init it again

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

function reboot() {
    prev_boot_call = 'none'
    prev_call = 'none'
    bottomBarUserInfo = ""
    document.getElementById("bottomBar").innerHTML = ""
    boot(window.location.pathname, true)
}

boot(window.location.pathname + ((document.URL.split('#')[1]) ? "#" + document.URL.split('#')[1] : ''), true)

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
        } else if (signinlevel != 0 && r.status === 200 && !r.summary.valid && !r.summary.check.cToken) {
            signinlevel = 0
            setTimeout(() => {reboot()}, 25)
            setTimeout(() => {alert("You have signed out from this browser.")}, 2000)
        }
    })
}

if (typeof disable_SLV_check === 'undefined' || !disable_SLV_check) {
    updateSLV()
    setInterval(() => {updateSLV()}, 60000)
}