import * as Automerge from "@automerge/automerge"


let doc = Automerge.init() // gobal variable from automerge
let actorId = Automerge.getActorId(doc) // id of currenrt board
doc.id = actorId
let docId = "BoardTest"
let channel = new BroadcastChannel(docId)
let binary = await localforage.getItem(docId)
let binaryFlag = false;
if (binary) {
    doc = Automerge.load(binary)
        // console.log(doc)
        //console.log(binaryFlag)
    render(doc)
    binaryFlag = true
}
console.log(actorId)


// idea is to draw a data structue that can record following
// corrdinate from mouse start to moouse move
// and mouse end

let corrdinate = { x: 0, y: 0 };
let current_coordinate = { mouseMove: [], mouseMove_lenght: 0 }
let current_Buffer = []


channel.onmessage = (ev) => {
    console.log("On message evoked");
    let newDoc = Automerge.merge(doc, Automerge.load(ev.data))
        //console.log(doc)
    doc = newDoc
    render(newDoc)
}

function updateDoc(newDoc) {
    console.log("update evoked");
    doc = newDoc
    render(newDoc)
    let binary = Automerge.save(newDoc)
    localforage.setItem(docId, binary).catch(err => console.log(err))
    channel.postMessage(binary) // <-- this line is new
}

function addItem(x, y) {
    console.log("add item evoked");
    let newDoc = Automerge.change(doc, newContext => {
        if (newContext.id != actorId) newContext.id = actorId
        newContext.items = { x, y }
    })
    updateDoc(newDoc)
}

function render(doc) {
    console.log("render evoked");
    //console.log(doc)
    if (doc.id != actorId) {
        console.log(`docId = ${doc.id}`)
        console.log(`currId = ${actorId}`)
        temp_start_drawing(doc)
    }
}
var canvasPressed = false
var canvas = document.getElementById('can')
var ctx = canvas.getContext('2d');

function temp_start_drawing(doc) {
    console.log("temp_start_drawing evoked");
    console.log(doc)
    var currCanvas = document.getElementById('can')
    var currCtx = currCanvas.getContext('2d');
    //currCtx.beginPath();
    let i = 0
        //console.log(doc.items.mouseMove_lenght)
        //for (i = 0; i < doc.items.mouseMove_lenght; i++) {
    console.log("For loop")
    currCtx.lineTo(doc.items.x, doc.items.y);
    currCtx.moveTo(doc.items.x, doc.items.y);
    currCtx.stroke();
    //}

}




function begin(evt) {
    canvasPressed = true;
    ctx.beginPath();
    ctx.moveTo(evt.clientX, evt.clientY);
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.stroke();
}

function end(evt) {
    canvasPressed = false;
    current_coordinate.mouseMove_lenght = current_coordinate.mouseMove.length;
    //addItem(current_coordinate);
    //current_Buffer.push(current_coordinate);
    current_coordinate = { mouseStart: { x: 0, y: 0 }, mouseMove: [], mouseEnd: { x: 0, y: 0 }, mouseMove_lenght: 0 };
    //console.log(current_Buffer)


}

let counter = 0;

function start_drawing(evt) {
    if (canvasPressed) {
        ctx.lineTo(evt.clientX, evt.clientY);
        ctx.stroke();
        var x = evt.clientX;
        var y = evt.clientY;
        addItem(x, y);
        //current_coordinate.mouseMove.push({ x, y });

    }
}

function sync() {
    console.log("sync")
    setTimeout(function() {
        sync();
    }, 500)
}
sync();

canvas.addEventListener('mousedown', begin);

canvas.addEventListener('mouseup', end);

canvas.addEventListener('mousemove', start_drawing);
//WhiteBoard.init_lister();