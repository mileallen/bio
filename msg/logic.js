
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
            const lines = h.qSelA('.msgline')
            //currentData.letts.sort( (x,y) => x.time - y.time )
        
            h.recent = currentData.letts.length > 10 ? currentData.letts.slice(0,10) : currentData.letts
    
            h.recent.forEach( (l,i) => {
              if(l.sndr === h.name) lines[i].style.color = "var(--ownColor)" 
              lines[i].style.visibility = "visible"
              lines[i].style.opacity = 1
              lines[i].innerHTML = `${l.sndr}: ${l.txt}` 
            } )    
        //console.log(currentData)
        }
    })
    h.socket.addEventListener("error", (event) => { console.log("WebSocket error: ", event)  })
    console.log('started')
}

const onsend = function ()  {

    const newtxt = h.getel('msginp')
    h.name = h.getel('nom').value || h.name

    h.send( { sndr: h.name, txt: newtxt.value, ip:'', time:''} )

    const l = h.recent.length
    h.recent.push({ sndr: h.name, txt: newtxt.value, ip:'', time:''})
    const lines = h.qSelA('.msgline')

    lines[l].style.visibility = "visible"
    lines[l].style.opacity = 0.4
    lines[l].innerHTML = `${h.name}: ${newtxt.value}`
    newtxt.value = ''
}

const close = () => h.socket.close()

const nightday = () => document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark'

window.addEventListener('load', wsstart )

