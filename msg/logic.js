
//import { createClient } from '@supabase/supabase-js'

const h = {
    nameInp: document.getElementById('nom'),
    newtxt: document.getElementById('msginp'),
    lines: document.querySelectorAll('.msgline'),
    name: 'anon',
    recent: [],
}

const supabaseUrl = 'https://pbxoimxzogrwtadntrfr.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieG9pbXh6b2dyd3RhZG50cmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyMDIyNDAsImV4cCI6MjAyNDc3ODI0MH0.kjEUHI7Q7QUCf5_3WMEz2slOKlmP9EBBOyII1CT0_Sg'

const sb = supabase.createClient(supabaseUrl, supabaseKey)
//const sb = createClient(supabaseUrl, supabaseKey)

const chann = sb.channel('room1')

chann.on('broadcast', { event: 'msg' }, res => fillup( res.packt ) ).subscribe()

const onsend = function ()  {
    h.name = h.nameInp.value || h.name
    const n = { sndr: h.name, txt: h.newtxt.value }
    chann.send({ type: 'broadcast', event: 'msg', packt: n })
    fillup(n)
    h.newtxt.value = ''
}
const fillup = d => {
    h.recent.push(d)
    h.recent = h.recent.slice(-9)
    h.recent.forEach( (l,i) => { 
        h.lines[i].style.color = l.sndr === h.name ? "var(--ownColor)" : "var(--msgColor)"
        h.lines[i].innerHTML = `${l.sndr}: ${l.txt}` 
    } )
}

const nightday = () => document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark'