var lastModifiedTime = new Date().getTime();

var targetNode = document;
function callClickEvent(element) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true);
    element.dispatchEvent(evt);
}

var config = { attributes: true, childList: true, subtree: true };

var callback = function (mutationsList, observer) {
    lastModifiedTime = new Date().getTime();
};

var observer = new MutationObserver(callback);

observer.observe(targetNode, config);
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function extractResponse(body, id) {
    pattern = 'xxxx' + id;
    var l = pattern.length;
    var n = body.length;
    var b = -1;
    for (var i = 0; i + l <= n; i++) {

        if (body.substring(i, i + l) == pattern)
            b = i + l;
    }
    var e = -1;
    for (var i = b; i < n; i++) {
        if (body.substring(i, i + 4) == 'xxxx') {
            e = i;
            break;
        }
    }
    return body.substring(b, e);
}

async function readResp(id) {
    while (true) {
        await sleep(2000);
        if (new Date().getTime() - lastModifiedTime > 2000) {
            var htmlString = document.documentElement.textContent;
            const response = extractResponse(htmlString, id);
            if (response != "\" and end it with \"") {
                return response
            }
        }
    }
}

async function askPerp(prompt, id) {
    prompt += '\n\n ***start your message with "xxxx' + id + '" and end it with "xxxx"***';

    var texts = document.getElementsByTagName('textarea');
    var text = texts[0];
    var og = 'overflow-auto max-h-[45vh] outline-none w-full font-sans caret-superDuper resize-none selection:bg-superDuper selection:text-textMain dark:bg-offsetDark dark:text-textMainDark dark:placeholder-textOffDark bg-background text-textMain placeholder-textOff'
    for (var i = 0; i < texts.length; i++)
        if (texts[i].className == og)
            text = texts[i];
    await sleep(1500)
    text.focus()
    document.execCommand('insertText', false, '-');
    
    text.value = prompt
    var buttons = document.getElementsByTagName('button');
    var submit = buttons[0];

    for (var i = 1; i < buttons.length; i++)
        if (buttons[i].ariaLabel == 'Submit')
            submit = buttons[i];
    submit.focus();
    await sleep(300)
    submit.click();


    var next = await readResp(id);
    return next;
}

async function getResponse(id) {
    var response = await fetch(url + 'poll-question/' + GUID + '?count=' + id);
    response = await response.json();
    return response;
}

async function getMessage(id) {
    var resp = await getResponse(id);
    while (resp == -1) {
        await sleep(2000);
        resp = await getResponse(id);
    }
    resp = resp.content;
    return resp;
}

async function send(message) {
    if (message.length > 12000)
        return -1;
    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Content: message,
            ConversationId: GUID
        })
    };
    console.log('sending...');
    console.log(requestOptions.body)
    var response = await fetch(url + 'answer', requestOptions);
}

async function getCompany() {
    var response = await fetch(url + 'rand');
    response = await response.json();
    console.log(response);
    if (response.id == null)
        return -1;
    question += response.question.content
    return response;
}

question = ""
async function loop(id) {
    var msg = question;
    msg = msg.replace('XXYYZZ', company.name);
    
    var resp = await askPerp(msg, id);
    console.log(company);
    company.answer = resp;
    var cls = 'group flex w-full cursor-pointer items-stretch h-full'
    var refs = document.getElementsByClassName(cls)
    var sources = []
    for(var i = 0; i < refs.length; i++)
        sources.push(refs[i].href)
    console.log(sources)
        var requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    id : company.id,
                    name : company.name,
                    answer : company.answer,
                    sources : sources,
                    question : company.question
                }
            )
        };
        await fetch(url, requestOptions);
	location.href = prp;
        return;
}

async function transfer(){
	await sleep(60000);
	location.href = prp;
}


var v = '';

var prp = 'https://www.perplexity.ai/'
var l = prp.length;
GUID = ' ';

async function main(){
	if (company == -1){
	location.href = prp;
    }
    company.answer = ""
    await loop(0)
    console.log('opening...');
    location.href = prp
}

if (window.location.href.length == l + 36) {
    for (var i = 0; i < 36; i++)
        v += window.location.href[l + i];
    localStorage.setItem('guid', v)
    window.location.href = prp
}
else {
    url = 'https://api.capsnap.ai/api/mindeye/';
    GUID = localStorage.getItem('guid');
    console.log(GUID);
    company = -1;
    transfer();
    getCompany().then(d => company = d). then(d => main()); 
}
