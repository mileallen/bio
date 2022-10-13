
const pageState = (function () {

    const o = {
        _page: document.querySelector('#page'),
        _lbl: document.querySelector('div.pause'),
        _scts: document.querySelectorAll('div.sect'),
        _ppt: document.querySelector('#slide').querySelector('img'),
        _men: document.querySelector('#menubox'),
        slid: -1,
    }

        return new Proxy(o, {
            set(t, k, v) {
                switch (k) {
                    case 'pause':
                        if (v) {
                            clearInterval(t._trigSlides)
                            clearTimeout(t._hideSlide)
                            t._lbl.innerText = "Resume"
                        }
                        else {
                            t._trigSlides = setInterval(showSlides, 1700)
                            t._lbl.innerText = "Pause"
                            t._lbl.style.color = 'initial'
                        }
                        break
                    case 'tab': t._page.dataset.tab = v
                        break                    
                    case 'slid':
                        t._ppt.src = `img/slide-${v}.png`
                        t._ppt.style.opacity = 1
                        t._page.dataset.slid = v
                        break
                }
                t[`_${k}`] = v
                return true
            },
            get(t, k) {
                if (k === 'tab' || k === 'slid') return t._page.dataset[k]
                else return t[`_${k}`]
            }
        })
})()


function menuState() {
    let l = pageState.scts.length - 1
    pageState.scts.forEach(el => {
        let pTop = el.getBoundingClientRect().top
        if (pTop > -5 && pTop < 50) {
            pageState.tab = el.getAttribute('indx')
        }
    })
    if (pageState.scts[l].getBoundingClientRect().bottom < (screen.height + 20) && pageState.scts[l].getBoundingClientRect().bottom > (screen.height - 10)) {
        pageState.tab = l.toString()
    }
}

/*

pageState.trigSlides = setInterval(showSlides, 1700)


function showSlides() {
        pageState.hideSlide = setTimeout(() => { pageState.ppt.style.opacity = 0 }, 1400)

        if (pageState.slid == "3") pageState.slid = "0"
        else pageState.slid++
}
*/


function menuTog() {
    let men_ht = parseFloat(pageState.men.style.height)
    if (isNaN(men_ht) || men_ht === 0) {
        pageState.men.style.height = '15rem'
    }
    else {
        pageState.men.style.height = '0rem'
    }
}

function fetchImgs() {
    let lateImgs = document.querySelectorAll('img'), late2 = []
    lateImgs.forEach(el => {
        if (el.getAttribute('late-src')) el.setAttribute('src', el.getAttribute('late-src'))
    })
}

function setslide(j){
    //pageState.pause = true
    pageState.slid = j
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