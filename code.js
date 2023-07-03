
const pageState = (function () {

    const o = {
        _page: document.querySelector('#page'),
        _works: document.querySelector('.works'),
        _men: document.querySelector('#menubox'),
        _slid: 0,
        set_pause: function (v) { return true // do nothing
        },
        set_slid: function (v){ [this._slid, v].forEach( (i,key) => document.getElementById(`sld${i}`).style.opacity = key ) }
    }
    return new Proxy(o, {
        set(t, k, v) {
            if ( `set_${k}` in t ) t[`set_${k}`](v)
            t._page.dataset[k] = v
            t[`_${k}`] = v
            return true
        },
        get(t, k) { return t[`_${k}`] }
    })
})()

function menuState() {
    let h = window.innerHeight, s
    s = document.elementFromPoint( pageState.works.offsetLeft + 10, Math.floor(h/3) )
    pageState.tab = s.getAttribute('indx')
}

function menuTog() {
    const men_ht = parseFloat(pageState.men.style.height)
    pageState.men.style.height = !men_ht ? '15rem' : '0rem'
}

function fetchImgs() {
    const lateImgs = document.querySelectorAll('img')
    lateImgs.forEach(el => { if (el.hasAttribute('data-lateimg')) el.setAttribute('src', el.getAttribute('data-lateimg')) } )
}

window.addEventListener('load', function (event) {
    if (parseFloat(screen.width) > 350) document.body.setAttribute('onscroll', 'menuState()')
    fetchImgs()
}, false)

window.addEventListener('resize', function (event) {
    if (screen.width > 350) {
        pageState.men.style.height = '15rem'
    }
}, false)