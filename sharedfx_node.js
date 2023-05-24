const fs = require('fs')
const path = require('path')

const about = () => { return "sharedfx" }

const envar = {
    deployed: false,
    root_domain: "gafea.net",
    indexHTML: fs.readFileSync('.\\nodejs.html', 'utf8').replace("%favicon%", "/favicon.ico").replaceAll("%rootdomain%", "gafea.net").replaceAll(`%resourceNETpath%`, "/!cdn/"),
    favicon: fs.readFileSync('.\\favicon.ico'),
    cToken_vaild_time_ms: 90*24*60*60*1000,
    userdb: '[redacted]',
    cdn_path: ".\\cdn\\",
    cdnNETpath: "/!cdn/",
    course_path: ".\\course\\",
    course_temp_path: ".\\course_temp\\",
    course_backup_path: false,
    gscript: ``,
    death_dump_path: "C:\\webserver\\death\\"
}; Object.freeze(envar)

const deathDump = (domain, msg, e) => {
    let t = (new Date)
    let tx = t.toJSON()
    t = t.getTime()
    let p = "" + envar.death_dump_path + domain + "\\"
    try {
        if (!fs.existsSync(p)) fs.mkdirSync(p)
        p += t + ".log"
        fs.writeFileSync(p, `Domain: ` + domain + `\nTime: ` + tx + `\nMessage: ` + msg + `\n\nDetailed error:\n` + e.message + `\n\n` + JSON.stringify(e))
    } catch (error) {console.log(error)}
    console.log(`nodejs crashed :(\n\nDomain: ` + domain + `\nTime: ` + tx + `\nMessage: ` + msg + `\n\nThe log will be saved at ` + p + `\n\nDetailed error:<br>` + e.message)
    throwMail(envar.mail_adr, "[" + domain + " crashed] " + msg, `Domain: ` + domain + `<br>Time: ` + tx + `<br>Message: ` + msg + `<br><br>The log will be saved at ` + p + `<br><br>Detailed error:<br>` + e.message)
}

const returnErr = (res, statusCode = 404, message = "", useJSON = false, AccessControlAllowOrigin = false, rightHTML = "", postMessagefx = "") => {
    var headerStr = { 'Server': 'joutou' }
    headerStr['Content-Type'] = (useJSON) ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8'
    headerStr['Access-Control-Allow-Origin'] = (AccessControlAllowOrigin) ? '*' : ''

    res.writeHead(statusCode, headerStr)

    if (useJSON) {
        if (message) {
            res.end(JSON.stringify({ status: statusCode, msg: message }))
        } else {
            res.end(JSON.stringify({ status: statusCode }))
        }
    } else {
        res.end(errPageHTML(statusCode, message, rightHTML + ((postMessagefx) ? `<script>window.parent.postMessage(JSON.stringify({fx:"` + postMessagefx + `", status: ` + statusCode + `, msg: "` + message + `"}) , '*')</script>` : '')))
    }
}

const getAllFromDir = (source, FileNameOnly = false) => fs.readdirSync(source).map(name => (FileNameOnly) ? name.split('.')[0] : path.join(source, name)) //get list of files in folder

const zeroPad = (num, places) => String(num).padStart(places, '0')

const pushObjArray = (obj, key, content) => {
    if (typeof obj[key] == 'undefined') { //item = 0
        obj[key] = content // from nothing to string
    } else if (!Array.isArray(obj[key])) { //item = 1
        obj[key] = [obj[key], content] // from string to array with 2 string
    } else { //item > 1
        obj[key] = [...obj[key], content] // from array of string to new array of string with new string added at the end
    }
}

const rndStr = (myLength) => {
    const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890"
    const randomArray = Array.from({ length: myLength }, () => chars[Math.floor(Math.random() * chars.length)])
    return randomArray.join("")
}

const parseCookies = (req) => {
    var cookies = {}
    if (!req.headers.cookie) return {}

    req.headers.cookie.split(';').forEach(c => {
        try {
            c = c.trim()
            cookies[c.split('=')[0]] = c.substring(1 + c.split('=')[0].length, c.length)
        } catch (err) {}
    })

    return cookies
}

const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
const isEmailValid = (email) => { return (email && email.length <= 80 && emailRegex.test(email)) }

const errPageHTML = (statusCode, message = "", rightHTML = "") => {
    if (statusCode === 200 && !message) { message = "root_domain: " + envar.root_domain }

    const statusCodeTitle = {
        200: 'OK',
        400: 'Bad Request',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error'
    }

    const statusCodeColor = {
        200: '#008000',
        400: '#800080',
        403: '#800080',
        404: '#800080',
        500: '#d040b0',
    }

    const statusCodeIcon = {
        200: 'data:image/png;base64,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',
        400: 'data:image/png;base64,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',
        403: 'data:image/png;base64,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',
        404: 'data:image/png;base64,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',
        500: 'data:image/png;base64,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',
    }

    return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><link type="image/ico" rel="shortcut icon" href="https://` + envar.root_domain + `/favicon.ico"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
    <title>` + statusCode + ` ` + statusCodeTitle[statusCode] + `</title></head><body><div class="b flx">` + rightHTML + `<div class="x flx"><div class="p"><div class="flx"><div class="s"><p1><b>` + statusCode + `</b></p1></div><h1><b>` + statusCodeTitle[statusCode] + `</b></h1></div><p1 style="opacity:0.8"><b>` + message + `</b></p1></div>
    <img alt="` + statusCode + ` ` + statusCodeTitle[statusCode] + `" class="i" src="` + statusCodeIcon[statusCode] + `"></div></div><style>
    body{margin:0;background-color:black;font-family:AppleSDGothicNeo-Regular, PingFangHK-Regular, Calibri, Microsoft JhengHei, verdana}
    h1{font-size:1.375em;margin:0} p1{font-size:0.975em}
    .b{color:white;justify-content:space-between;position:fixed;bottom:0;left:0;right:0;border-top:0.15em solid #3f3c39;padding:0.75em;padding:0.75em calc(0.75em + env(safe-area-inset-right)) calc(0.75em + env(safe-area-inset-bottom)) calc(0.75em + env(safe-area-inset-left))}
    .i{object-fit:contain;height:3.25em} .p, .i, .aobh{margin:0.25em} .x, .i{order:1} .y, .p{order:2}
    .s{display:inline;border-radius:0.25em;background-color:` + statusCodeColor[statusCode] + `;padding:0.1em 0.25em;margin:0.25em 0.375em 0.25em 0}
    .flx{flex-flow:wrap;display:flex;align-items:center} .flx div{vertical-align:middle}
    a{text-decoration:none;color:#3993ff} a:hover{color:#5bb5ff}
    .aobh{transition-duration:0.1s;border-radius:0.5em;padding:0.5em;user-select:none;cursor:pointer}
    .aobh:hover{background:rgba(255,255,255,.05)}
    .aobh:active{background:rgba(255,255,255,.1)}
    .aobh:hover:active{transform:scale(0.95)}
    @media print{.no_print{display:none!important} body, .s{background-color:white} .s{border:1px solid black} .b{color:black} .i{filter:brightness(0.2)}}
    </style></body></html>    
`}

async function sha512(message) {
    function bufferToHex(buffer) {
        return [...new Uint8Array(buffer)]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await require('crypto').subtle.digest('SHA-512', data);
    return bufferToHex(hash).toUpperCase();
}

async function throwMail(address, title, body) {
    let transporter = require('nodemailer').createTransport({
        service: "iCloud",
        auth: {
            user: envar.mail_adr, // generated ethereal user
            pass: envar.mail_psw, // generated ethereal password
        },
    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"' + envar.root_domain + '" <' + envar.mail_adr + '>', // sender address
        to: address, // list of receivers
        subject: title, // Subject line
        html: body, // html body
    })

    console.log("sentmail: " + address + " - " + title)

    return info
}

module.exports = { about, envar, deathDump, returnErr, getAllFromDir, pushObjArray, sha512, rndStr, isEmailValid, throwMail, parseCookies, zeroPad }