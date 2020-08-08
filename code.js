
const pageState = (function pageVars() {

    const o = {
        page: document.querySelector('#page'),
        lbl: document.getElementById('slide').querySelector('div.pause'),
        scts: document.querySelectorAll('div.sect'),
        ppt: document.getElementById('slide').querySelector('img'),
        men: document.getElementById('menubox')
        }

    return function () {
        return new Proxy(o, {
            set: function (target, key, value) {
                switch (key) {
                    case 'pause':
                        if (value) {
                            clearInterval(target.trigSlides)
                            clearTimeout(target.hideSlide)
                            target.lbl.innerText = "Resume"
                        }
                        else {
                            target.trigSlides = setInterval(showSlides, 1700)
                            target.lbl.innerText = "Pause"
                            target.lbl.style.color = 'initial'
                        }
                        break
                    case 'tab': case 'slid': target.page.dataset[key] = value
                        break
                }
                target[key] = value
                return true
            },
            get: function (target, key) {
                if (key === 'tab' || key === 'slid') return target.page.dataset[key]
                else return target[key]
            }
        })
    }
})()()


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


pageState.trigSlides = setInterval(showSlides, 1700)


function showSlides() {
    if (pageState.tab === "2") {
        pageState.hideSlide = setTimeout(() => { pageState.ppt.style.opacity = 0 }, 1400)

        if (pageState.slid === "3") pageState.slid = "0"
        else pageState.slid++

        pageState.ppt.src = `img/slide-${pageState.slid}.png`
        pageState.ppt.style.opacity = 1
    }
}

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
    let lateImgs = document.querySelectorAll('img')
    lateImgs.forEach(el => {
        if (el.getAttribute('late-src')) el.setAttribute('src', el.getAttribute('late-src'))
    })
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