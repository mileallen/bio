
const pageState = (function () {

    const o = {
        _page: document.querySelector('#page'),
        _scts: document.querySelectorAll('div.sect'),
        _ppt: document.querySelector('#slide').querySelector('img'),
        _men: document.querySelector('#menubox'),
        _slid: -1,
        set_pause: function (v) { return true // do nothing
        },
        set_slid: function (v){
                        this._ppt.classList.add("transit")                        
                        setTimeout(() => {
                            this._ppt.src = `img/slide-${v}.png`
                            this._ppt.classList.remove("transit")
                        }, 350)
        }
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
    let l = document.querySelector('.works'), h = window.innerHeight, s
    s = document.elementFromPoint( l.offsetLeft + 10, Math.floor(h/3) )
    pageState.tab = s.getAttribute('indx')
}

function menuTog() {
    let men_ht = parseFloat(pageState.men.style.height)
    pageState.men.style.height = !men_ht ? '15rem' : '0rem'
}

function fetchImgs() {
    let lateImgs = document.querySelectorAll('img'), late2 = []
    lateImgs.forEach(el => {
        if (el.getAttribute('late-src')) el.setAttribute('src', el.getAttribute('late-src'))
    })
        for(i=1; i<5; i++) { 
        late2[i] = new Image()
        late2[i].src = `img/slide-${i}.png`
    }
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