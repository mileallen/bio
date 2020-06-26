// const men = document.getElementById('menubox')
// var links = document.getElementById('menubox').querySelectorAll('.nav')
//var sections = document.querySelectorAll('div.sect')

var pageState = {
    trigSlides: null,
    hideSlide: null,
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


// from https://stackoverflow.com/questions/1759987/listening-for-variable-changes-in-javascript



var stateProx = new Proxy( pageState, {

    set: function (target, key, value) {
        
    if ( key === 'currTab' ){
       let links = document.getElementById('menubox').querySelectorAll('.nav')
        for (var i = 0; i < links.length; i++) {
            if ( i === value) { links[i].classList.add('picked') }
            else { links[i].classList.remove('picked') }
          }       
    }
    if ( key === 'currCourse' ) {
        let courses = document.getElementById('courses').querySelectorAll('span')
        let slideBox = document.getElementById('slide').querySelector('img')
        for (var i = 0; i < courses.length; i++) {
            if ( i === value) { courses[i].classList.add('taught') }
            else { courses[i].classList.remove('taught') }
          }
          slideBox.src = `img/slide-${value}.png`
          slideBox.style.opacity = 1
    }

    if ( key === 'pauseSlides') {
        let butText = document.getElementById('slide').querySelector('div.pause')

        if(value) { 
            clearInterval(pageState.trigSlides) 
            clearTimeout(pageState.hideSlide)
            butText.innerText = "Resume"
        }
        else { 
            pageState.trigSlides = setInterval(showSlides, 1700)
            butText.innerText = "Pause" 
            butText.style.color = 'initial' 

        }
    }
    target[key] = value
    return true;
}

  })


function menuState() { 
   let sections = document.querySelectorAll('div.sect')
   let l = sections.length - 1
   sections.forEach( el => {
    pTop = el.getBoundingClientRect().top
    if (pTop > -5 && pTop < 50) {
          stateProx.currTab = parseFloat( el.getAttribute('indx') )
     }
    })
    if ( sections[l].getBoundingClientRect().bottom < (screen.height + 20) && sections[l].getBoundingClientRect().bottom > (screen.height-10) ) {
        stateProx.currTab = l
   }
}


pageState.trigSlides = setInterval(showSlides, 1700)


function showSlides() {
    let slideBox = document.getElementById('slide').querySelector('img')
    if ( stateProx.currTab === 2 ) {
        pageState.hideSlide = setTimeout( () => { slideBox.style.opacity = 0 }, 1400 )

        if ( stateProx.currCourse === undefined || stateProx.currCourse === 3 ) stateProx.currCourse = 0
        else stateProx.currCourse++
    }
}

function fetchImgs() {
    let lateImgs = document.querySelectorAll('img')
    lateImgs.forEach( el => {
        if (el.getAttribute('late-src')) el.setAttribute('src', el.getAttribute('late-src'))
    })
}


window.addEventListener('load', function ( event ) {
    if ( parseFloat(screen.width)  > 350 ) document.body.setAttribute('onscroll', 'menuState()')
    fetchImgs()
    }, false)

window.addEventListener('resize', function ( event ) {
    let men = document.getElementById('menubox')
    if (screen.width > 350) {
        men.style.height = '15rem'
    }
}, false )