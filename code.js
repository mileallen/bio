
const pageState = (function pageVars() {
    const page = document.querySelector('#page')
    return function () {
        return new Proxy({}, {
            set: function (target, key, value) {
                switch (key) {
                    case 'pause':
                        let butText = document.getElementById('slide').querySelector('div.pause')
                        if (value) {
                            clearInterval(pageState.trigSlides)
                            clearTimeout(pageState.hideSlide)
                            butText.innerText = "Resume"
                        }
                        else {
                            pageState.trigSlides = setInterval(showSlides, 1700)
                            butText.innerText = "Pause"
                            butText.style.color = 'initial'
                        }
                        break
                    case 'tab': case 'slid': page.dataset[key] = value
                        break
                }
                target[key] = value
                return true
            },
            get: function (target, key) {
                if (key === 'tab' || key === 'slid') return page.dataset[key]
                else return target[key]
            }
        })
    }
})()()


function menuState() {
    let sections = document.querySelectorAll('div.sect')
    let l = sections.length - 1
    sections.forEach(el => {
        let pTop = el.getBoundingClientRect().top
        if (pTop > -5 && pTop < 50) {
            pageState.tab = el.getAttribute('indx')
        }
    })
    if (sections[l].getBoundingClientRect().bottom < (screen.height + 20) && sections[l].getBoundingClientRect().bottom > (screen.height - 10)) {
        pageState.tab = l.toString()
    }
}


pageState.trigSlides = setInterval(showSlides, 1700)


function showSlides() {
    let slideBox = document.getElementById('slide').querySelector('img')
    if (pageState.tab === "2") {
        pageState.hideSlide = setTimeout(() => { slideBox.style.opacity = 0 }, 1400)

        if (pageState.slid === "3") pageState.slid = "0"
        else pageState.slid++

        slideBox.src = `img/slide-${pageState.slid}.png`
        slideBox.style.opacity = 1
    }
}

function menuTog() {
    let men = document.getElementById('menubox')
    let men_ht = parseFloat(men.style.height)
    if (isNaN(men_ht) || men_ht === 0) {
        men.style.height = '15rem'
    }
    else {
        men.style.height = '0rem'
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
    let men = document.getElementById('menubox')
    if (screen.width > 350) {
        men.style.height = '15rem'
    }
}, false)