
const h = {
    nameInp: document.getElementById('nom'),
    newtxt: document.getElementById('msginp'),
    lines: document.querySelectorAll('.msgline'),

    name: 'anon',
    recent: [],
}

const wsstart = async function () {

    h.socket = await new WebSocket('wss://ww.wry.workers.dev')
    h.send = m => h.socket.send( JSON.stringify(m) )
    
    h.socket.addEventListener('message', ( {data} ) => {

        const currentData = JSON.parse(data)
    
        if(currentData.msg) console.log(currentData.msg)

        else if(currentData.err) h.newtxt.value = currentData.err
            
        else {
            h.recent = currentData.letts
            fillup()
        }
    })
    h.socket.addEventListener("error", (event) => { console.log("WebSocket error: ", event)  })
    h.socket.addEventListener("open", () => { console.log("Socket now open.")  })
}
const onsend = function ()  {
    h.name = h.nameInp.value || h.name

    h.send( { sndr: h.name, txt: h.newtxt.value} )
    h.recent.push( { sndr: h.name, txt: h.newtxt.value, fresh: true} )
    h.newtxt.value = ''
    h.recent = h.recent.slice(-9)
    fillup()
}
const fillup = () => {

    h.recent.forEach( (l,i) => {
      h.lines[i].style.color = l.fresh ? "var(--msgColor)" :    l.sndr === h.name ? "var(--ownColor)" : "var(--msgColor)"
      h.lines[i].style.opacity = l.fresh ? 0.4 : 1
      h.lines[i].innerHTML = `${l.sndr}: ${l.txt}` 
    } )
}
const close = () => h.socket.close()

const nightday = () => document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark'

window.addEventListener('load', wsstart )

