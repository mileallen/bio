
const img1 = new Image();
img1.src = "graph/mumbai-dock-home.jpg";

const img2 = new Image();
img2.src = "graph/black-dog-home.jpg";

const img3 = new Image();
img3.src = "graph/bridge-rain-home.jpg";


const page = {

  elD1: document.getElementById('insD1'),
  elIm: document.getElementById('insImage'),
  elHe: document.getElementById('insHead'),
  elDe: document.getElementById('insDesc'),
  elTw: document.getElementById("twit-window"),

  insights: [ 
    {
      imag: 'graph/mumbai-dock-home.jpg',
      head: 'State capitalism',
      desc: 'is actually not a preserve of mid-income countries. How cognitive classification impedes our grasp of the global business and policy environment, same as nature.)'
    },
    {
      imag: 'graph/black-dog-home.jpg',
      head: 'Animal brains',
      desc: 'are capable of much that was until recently thought uniquely human. Where and how can that inform the design of machine learning algorithms?)'
    },
    {
      imag: 'graph/bridge-rain-home.jpg',
      head: 'Impressionism',
      desc: `had its origin in global trade, when the east opened up to the west! Is there something 'natural' about the mingling of disparate and distant influences?)`
    } 
  ],

  _i: -1,
  idx: 0,
  insReset: null,
  insLoop: null,

  set i(v) {
    ( {imag: this.elIm.src, head: this.elHe.innerHTML, desc: this.elDe.innerHTML} = {...this.insights[v] } )
    this.elD1.style.opacity = 1
    this._i = v
  },
  get i() { return this._i }
}



function addIncite(t) {
  page.insReset = setTimeout(() => { page.elD1.style.opacity = 0 }, t)
  page.i === page.insights.length - 1 ? page.i = 0 : page.i++
}



const twtrList = ["678926231136395264", "745661166635069441", "729681299003342848", "884749850616619008", "690205679525597185", "934765535249571840"];

function addTweet(id) {
  page.elTw.innerHTML = ""
  try {
    twttr.widgets.createTweet(id, page.elTw,
      {
        conversation: 'none',    // or all
        cards: 'visible',  // or visible 
        linkColor: '#cc0000', // default is blue
        theme: 'light',    // or dark
        dnt: true
      })
      .then(function (el) {
        el.contentDocument.querySelector(".footer").style.display = "none";
      }, function(err) {
        page.elTw.innerHTML = `Sorry, there was an error : ${err}`
      })
  } catch(e) {
      page.elTw.innerHTML = `Sorry, there was an error : ${e.message}`
    }
}

function nxtTweet() {
  page.idx < 5 ? page.idx++ : page.idx = 0
  addTweet(twtrList[page.idx])
}

function prevTweet() {
  page.idx > 0 ? page.idx-- : page.idx = 5
  addTweet(twtrList[page.idx]);
}



function sayThank() {
  let eml_inp = document.getElementById("contact-em")
  let eml = eml_inp.value, tm = new Date
  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

  if (eml.match(mailformat)) {
    eml_inp.value = "Hold on, just a sec...";
    let emailObj = { email: eml, time: tm.toUTCString() }

    firebase.database().ref('contact').push().set(emailObj)
      .then(function (snapshot) {
      document.getElementById("email-submit").style.display = "none"
      eml_inp.value = "Thanks! We will be in touch."
    }, function (error) {
      eml_inp.value = "Sorry, there was an error recording your email."
    });
  }
  else  eml_inp.value = "Please enter a valid email address"
}


document.addEventListener('readystatechange', () => {
  if(document.readyState === 'complete') {
    addTweet(twtrList[0])
    setTimeout( addIncite, 700, 1000)
    page.insLoop = setInterval(addIncite, 3000, 2500)
  }
})



