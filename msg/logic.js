
const h = {
    getel: el => document.getElementById(el),
    qSelA: el => document.querySelectorAll(el),

    name: 'anon',
    recent: [],
}

const wsstart = async function () {

    h.socket = await new WebSocket('wss://ww.wry.workers.dev')
    h.send = m => h.socket.send( JSON.stringify(m) )
    
    h.socket.addEventListener('message', ( {data} ) => {

        const currentData = JSON.parse(data)
    
        if(currentData.msg) console.log(currentData.msg)   
            
        else {
            h.recent = currentData.letts   //.length > 10 ? currentData.letts.slice(0,10) : currentData.letts
            fillup()
        }
    })
    h.socket.addEventListener("error", (event) => { console.log("WebSocket error: ", event)  })
    h.socket.addEventListener("open", () => { console.log("Socket now open.")  })
}
const onsend = function ()  {
    h.name = h.getel('nom').value || h.name
    const newtxt = h.getel('msginp')

    h.send( { sndr: h.name, txt: newtxt.value} )
    h.recent.push( { sndr: h.name, txt: newtxt.value, fresh: true} )
    newtxt.value = ''
    h.recent = h.recent.slice(-9)
    fillup(true)
}
const fillup = (client=false) => {

    const lines = h.qSelA('.msgline')
    
    h.recent.forEach( (l,i) => {
      lines[i].style.color = !client && (l.sndr === h.name) ? "var(--ownColor)" : "var(--msgColor)"
      lines[i].style.opacity = l.fresh ? 0.4 : 1
      lines[i].innerHTML = `${l.sndr}: ${l.txt}` 
    } )
}
const close = () => h.socket.close()

const nightday = () => document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark'

window.addEventListener('load', wsstart )

