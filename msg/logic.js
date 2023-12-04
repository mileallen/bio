
const h = {
    getel: el => document.getElementById(el),
    qSelA: el => document.querySelectorAll(el),

    apiurl: 'https://msg.wry.workers.dev/',
    name: 'anon',
    freq: 1,
    recent: []
}

const onsend = async function ()  {

    const newtxt = h.getel('msginp')
    h.name = h.getel('nom').value || h.name

    const res = await fetch(`${h.apiurl}?s=s`, { method: 'PUT', body: JSON.stringify({ sndr: h.name, txt: newtxt.value, ip:'', time:''})   })

    const l = h.recent.length
    h.recent.push({ sndr: h.name, txt: newtxt.value, ip:'', time:''})
    
    const lines = h.qSelA('.msgline')

    lines[l].style.visibility = "visible"
    lines[l].style.opacity = 0.4
    lines[l].innerHTML = `${h.name}: ${newtxt.value}`
    newtxt.value = ""
}


const goget = async function ()  {

    const res = await fetch(`${h.apiurl}?s=g`)
    const resDat = await res.json()

    const lines = h.qSelA('.msgline')

    resDat.letts.sort( (x,y) => x.time - y.time )

    h.recent = resDat.letts.length > 10 ? resDat.letts.slice(0,10) : resDat.letts

    h.recent.forEach( (l,i) => {
      if(l.sndr === h.name) lines[i].style.color = "#74b7ff5c"
      lines[i].style.visibility = "visible"      
      lines[i].style.opacity = 1
      lines[i].innerHTML = `${l.sndr}: ${l.txt}` 
    } )
}

const freqID = setInterval(goget, h.freq*60000)

const freq = h.getel('freq')
const num = h.getel('num')

freq.addEventListener('change', e => h.freq = num.innerHTML = e.target.value )

window.addEventListener('load', goget )

