// Most Listeners are stored here
// 0 keys , 1 CTRL , 2 SHIFT
// i had to covert functions to string then using eval to retrieve 
// there could be an other appeoach here , 
// we could create an other object with shortcut name , shortcut function 

var custumeShortCuts = [
    [[187,171,107],1,0,"handleZoomIn"],
    [[189,173,109],1,0,"handleZoomOut"],
    [[16],0,0,"handleSelectMulti"],
    [[17],0,0,"handleCtrlDown"],
    [[8,46],0,0,"delete_selected"],
    [[90],1,0,"undo"],
    [[83],1,0,"save"],
    [[83],1,1,"saveOffline"],
    [[65,97],1,0,"handleSelectAll"],
    [[113,81],0,0,"handleChangeBitWidth"],
    [[84],0,0,"handleChangeClockTime"],
    [[69],0,0,"handleSelectMulti"],
    [[67],0,0,"handleCopy"],
    [[88],0,0,"handleCut"],
    [[86],0,0,"handlePast"],
    [[37,65],0,0,"handleDirectionLeft"],
    [[39,68],0,0,"handleDirectionRight"],
    [[38,87],0,0,"handleDirectionUp"],
    [[40,83],0,0,"handleDirectionDowm"],
]
var  keymap 
// console.log("AAAAAAAAAAA" ,JSON.parse(stcus))
//  for the first time the storedShortCuts would be null so we will store the shortcuts  
let storedShortCuts = window.localStorage.getItem("custumeShortCuts")
if(storedShortCuts){
    keymap = JSON.parse(storedShortCuts)
    console.log("keymap",keymap)
}else{
    keymap = custumeShortCuts
    window.localStorage.setItem("custumeShortCuts" , JSON.stringify(custumeShortCuts))
}

function startListeners() {

// startListeners function -----------------------------------> START
    document.addEventListener('cut'  , handleCut);
    document.addEventListener('copy' , handleCopy);
    document.addEventListener('paste', handlePast);

    window.addEventListener('keyup'    , handleKeyUp);
    window.addEventListener('keydown'  , handleKeyDowm)
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup'  , onMouseUp);

    document.getElementById("simulationArea").addEventListener('mousedown'     , handleMouseDown );
    document.getElementById("simulationArea").addEventListener('mouseup'       , handleMouseUP );
    document.getElementById("simulationArea").addEventListener('dblclick'      , handleDoubleClick);
    document.getElementById("simulationArea").addEventListener('mousewheel'    , handleMouseScroll);
    document.getElementById("simulationArea").addEventListener('DOMMouseScroll', handleMouseScroll);
// startListeners function -----------------------------------> END

    hoverRestrictedElements()
}



// EventListenerHANDLERS -----------------------------------> start

//***MOUSE-START***
// onMouse UP at window
function onMouseUp() {

    if (!lightMode) {
        lastMiniMapShown = new Date().getTime();
        setTimeout(removeMiniMap, 2000);
    }

    errorDetected    = false;
    updateSimulation = true;
    updatePosition   = true;
    updateCanvas     = true;
    gridUpdate       = true;
    wireToBeChecked  = true;

    scheduleUpdate(1);
    simulationArea.mouseDown = false;

    for (var i = 0; i < 2; i++) {
        updatePosition  = true;
        wireToBeChecked = true;
        update();
    }
    errorDetected    = false;
    updateSimulation = true;
    updatePosition   = true;
    updateCanvas     = true;
    gridUpdate       = true;
    wireToBeChecked  = true;

    scheduleUpdate(1);
    var rect = simulationArea.canvas.getBoundingClientRect();

    if (!(simulationArea.mouseRawX < 0 || simulationArea.mouseRawY < 0 || simulationArea.mouseRawX > width || simulationArea.mouseRawY > height)) {
        smartDropXX = simulationArea.mouseX + 100; //Math.round(((simulationArea.mouseRawX - globalScope.ox+100) / globalScope.scale) / unit) * unit;
        smartDropYY = simulationArea.mouseY - 50; //Math.round(((simulationArea.mouseRawY - globalScope.oy+100) / globalScope.scale) / unit) * unit;
    }
}

// Mouse Down
function handleMouseDown (e) {
    $("input").blur();
console.log("111",keymap)
    var rect = simulationArea.canvas.getBoundingClientRect();
    errorDetected               = false;
    updateSimulation            = true;
    updatePosition              = true;
    updateCanvas                = true;
    simulationArea.lastSelected = undefined;
    simulationArea.selected     = false;
    simulationArea.hover        = undefined;
    simulationArea.mouseDown    = true;
    simulationArea.mouseDownRawX = (e.clientX - rect.left) * DPR;
    simulationArea.mouseDownRawY = (e.clientY - rect.top) * DPR;
    simulationArea.mouseDownX = Math.round(((simulationArea.mouseDownRawX - globalScope.ox) / globalScope.scale) / unit) * unit;
    simulationArea.mouseDownY = Math.round(((simulationArea.mouseDownRawY - globalScope.oy) / globalScope.scale) / unit) * unit;
    simulationArea.oldx = globalScope.ox;
    simulationArea.oldy = globalScope.oy;

    e.preventDefault();
    scheduleBackup();
    scheduleUpdate(1);
    $('.dropdown.open').removeClass('open');
}

// Mouse UP at SIMULATOR
function handleMouseUP() {
    if (simulationArea.lastSelected) simulationArea.lastSelected.newElement = false;
    /*
    handling restricted circuit elements
    */

    if(simulationArea.lastSelected && restrictedElements.includes(simulationArea.lastSelected.objectType)
        && !globalScope.restrictedCircuitElementsUsed.includes(simulationArea.lastSelected.objectType)) {
        globalScope.restrictedCircuitElementsUsed.push(simulationArea.lastSelected.objectType);
        updateRestrictedElementsList();
    }

// ####################################### fixes 1316 ###################################
    if (!simulationArea.shiftDown && simulationArea.multipleObjectSelections.length>0) 
           if(!simulationArea.multipleObjectSelections.includes(simulationArea.lastSelected))
            simulationArea.multipleObjectSelections = [];
// ######################################################################################
}

// Mouse Move
function onMouseMove(e) {
    var rect = simulationArea.canvas.getBoundingClientRect();
    simulationArea.mouseRawX = (e.clientX - rect.left) * DPR;
    simulationArea.mouseRawY = (e.clientY - rect.top) * DPR;
    simulationArea.mouseXf = (simulationArea.mouseRawX - globalScope.ox) / globalScope.scale;
    simulationArea.mouseYf = (simulationArea.mouseRawY - globalScope.oy) / globalScope.scale;
    simulationArea.mouseX = Math.round(simulationArea.mouseXf / unit) * unit;
    simulationArea.mouseY = Math.round(simulationArea.mouseYf / unit) * unit;

    updateCanvas = true;

    if (simulationArea.lastSelected && (simulationArea.mouseDown || simulationArea.lastSelected.newElement)) {
        updateCanvas = true;
        var fn;

        if (simulationArea.lastSelected == globalScope.root) {
            fn = function() {
                updateSelectionsAndPane();
            }
        } else {
            fn = function() {
                if (simulationArea.lastSelected)
                    simulationArea.lastSelected.update();
            };
        }
        scheduleUpdate(0, 20, fn);
    } else {
        scheduleUpdate(0, 200);
    }
}

// Double Click
function handleDoubleClick () {
    scheduleUpdate(2);
    if (simulationArea.lastSelected && simulationArea.lastSelected.dblclick !== undefined)
        simulationArea.lastSelected.dblclick();
}

// Scroll
function handleMouseScroll(event) {
    updateCanvas = true;
    event.preventDefault()
  
    var deltaY = event.wheelDelta ? event.wheelDelta : -event.detail;
    let direction =  deltaY > 0 ? 1 : -1
    handleZoom(direction)      

    updateCanvas = true;
    if(layoutMode)layoutUpdate();
    else update(); // Schedule update not working, this is INEFFICIENT
}

// ***MOUSE-END***



// ***KEYBOAED-START***
// Key Up
function handleKeyUp(e) {
    scheduleUpdate(1);
    simulationArea.shiftDown = e.shiftKey;

    if (e.keyCode == 16) 
        simulationArea.shiftDown = false;
    
    if (e.key == "Meta" || e.keyCode == 17) 
        simulationArea.controlDown = false;

    // select multi buttom (m)
    if (e.keyCode == 69) 
        simulationArea.shiftDown = false;    
}

// Key DOWM
function handleKeyDowm (e) {
    // If mouse is focusing on input element, then override any action
    // if($(':focus').length){
    //     return;
    // }
    if (simulationArea.mouseRawX < 0 || simulationArea.mouseRawY < 0 || simulationArea.mouseRawX > width || simulationArea.mouseRawY > height) {
        return;
    } else {
        // HACK TO REMOVE FOCUS ON PROPERTIES
        if (document.activeElement.type == "number") {
            hideProperties();
            showProperties(simulationArea.lastSelected)
        }
    }
    errorDetected    = false;
    updateSimulation = true;
    updatePosition   = true;
    simulationArea.shiftDown = e.shiftKey;
   
    if (simulationArea.mouseRawX < 0 || simulationArea.mouseRawY < 0 || simulationArea.mouseRawX > width || simulationArea.mouseRawY > height) return;

    scheduleUpdate(1);
    updateCanvas = true;
    wireToBeChecked = 1;

    if(simulationArea.lastSelected){
        if (simulationArea.lastSelected.keyDown&&(e.key.toString().length == 1 || e.key.toString() == "Backspace")) {
            simulationArea.lastSelected.keyDown(e.key.toString());
            return;
        }

        if (simulationArea.lastSelected.keyDown2&&(e.key.toString().length == 1)) {
            simulationArea.lastSelected.keyDown2(e.key.toString());
            return;
        }

        if (simulationArea.lastSelected.keyDown3&&(e.key.toString() != "Backspace" && e.key.toString() != "Delete")) {
            simulationArea.lastSelected.keyDown3(e.key.toString());
            return;
        }
    }

let found =false
keymap.forEach(instruction=>{
    instruction[0].forEach(key=>{
        if(key===e.keyCode){
            if(instruction[1] && simulationArea.controlDown && instruction[2] && simulationArea.shiftDown){
                // CTRL + SHIFT pressed
                eval('(' + instruction[3] + ')')()
                found=true
                return
            }
            else if(instruction[1] && simulationArea.controlDown){
                // ctrl pressed
                eval('(' + instruction[3] + ')')()
                found=true
                return
            }
            else if(instruction[2]&&simulationArea.shiftDown){
                // shift pressed
                eval('(' + instruction[3] + ')')()
                found=true
                return
            }
            else if (!(instruction[1] || instruction[2])) {
                // No SHIFT or CTRL
                eval('(' + instruction[3] + ')')()
                found=true
                return
            }
        }
    })
    // this would prevent loop to continu after we got what we need
    if(found){
        e.preventDefault();
        return;
    }
        
})

}
// ***KEYBOAED-END***



// ***window-Start***
// CUT
function handleCut() {
    simulationArea.copyList = simulationArea.multipleObjectSelections.slice();
    if (simulationArea.lastSelected && simulationArea.lastSelected !== simulationArea.root && !simulationArea.copyList.contains(simulationArea.lastSelected)) {
        simulationArea.copyList.push(simulationArea.lastSelected);
    }

    var textToPutOnClipboard = copy(simulationArea.copyList, true);

    // Updated restricted elements
    updateRestrictedElementsInScope();

    if(textToPutOnClipboard!=undefined){
        localStorage.setItem('clipboardData', textToPutOnClipboard);
    }

}
// COPY
function handleCopy() {
    simulationArea.copyList = simulationArea.multipleObjectSelections.slice();
    if (simulationArea.lastSelected && simulationArea.lastSelected !== simulationArea.root && !simulationArea.copyList.contains(simulationArea.lastSelected)) {
        simulationArea.copyList.push(simulationArea.lastSelected);
    }

    var textToPutOnClipboard = copy(simulationArea.copyList);

    // Updated restricted elements
    updateRestrictedElementsInScope();

    if(textToPutOnClipboard!=undefined){
        localStorage.setItem('clipboardData', textToPutOnClipboard);
    }   
}
// PAST
function handlePast() {
    var data =  localStorage.getItem('clipboardData');
    paste(data);

    // Updated restricted elements
    updateRestrictedElementsInScope();
}
// ***window-END***

// EventListenerHANDLERS -----------------------------------> end


// HELPERS----------------------------------->START

function handleCtrlDown(){
    simulationArea.controlDown = true;
}

function handleNewDirection (direction){
    if (simulationArea.lastSelected != undefined) 
        if (direction)
            simulationArea.lastSelected.newDirection(direction);
}

function handleDirectionUp (){
    handleNewDirection("UP")
}
function handleDirectionRight (){
    handleNewDirection("RIGHT")
}
function handleDirectionDowm (){
    handleNewDirection("DOWN")
}
function handleDirectionLeft (){
    handleNewDirection("LEFT")
}

function handleChangeClockTime(){
    simulationArea.changeClockTime(prompt("Enter Time:"));
}

//   Zoom handler , direction is either 1 or -1 
function handleZoom(direction){
    if ( globalScope.scale > 0.5 * DPR && globalScope.scale < 4 * DPR){
        changeScale(direction * .1 * DPR);
        // This Fix zoom issue
        gridUpdate = true;
    }
}

function handleZoomIn(){
    handleZoom(1)
}  

function handleZoomOut(){
    handleZoom(-1)
}

// Function selects all the elements from the scope
function handleSelectMulti (){
    simulationArea.shiftDown = true;
    if (simulationArea.lastSelected && !simulationArea.lastSelected.keyDown && simulationArea.lastSelected.objectType != "Wire" && simulationArea.lastSelected.objectType != "CircuitElement" && !simulationArea.multipleObjectSelections.contains(simulationArea.lastSelected)) {
        simulationArea.multipleObjectSelections.push(simulationArea.lastSelected);
    }
}

function handleChangeBitWidth(){
    if (simulationArea.lastSelected.bitWidth !== undefined)
        simulationArea.lastSelected.newBitWidth(parseInt(prompt("Enter new bitWidth"), 10));
    else return
}

function handleSelectAll(scope = globalScope) {
    circuitElementList.forEach((val, _, __) => {
        if (scope.hasOwnProperty(val)) {
            simulationArea.multipleObjectSelections.push(...scope[val]);
        }
    });

    if (scope.nodes) {
        simulationArea.multipleObjectSelections.push(...scope.nodes);
    }
}

function removeMiniMap() {
    if (lightMode) return;

    if (simulationArea.lastSelected == globalScope.root && simulationArea.mouseDown) return;
    if (lastMiniMapShown + 2000 >= new Date().getTime()) {
        setTimeout(removeMiniMap, lastMiniMapShown + 2000 - new Date().getTime());
        return;
    }
    $('#miniMap').fadeOut('fast');
}

function delete_selected(){
    $("input").blur();
    hideProperties();
    if (simulationArea.lastSelected && !(simulationArea.lastSelected.objectType == "Node" && simulationArea.lastSelected.type != 2)) simulationArea.lastSelected.delete();
    for (var i = 0; i < simulationArea.multipleObjectSelections.length; i++) {
        if (!(simulationArea.multipleObjectSelections[i].objectType == "Node" && simulationArea.multipleObjectSelections[i].type != 2)) simulationArea.multipleObjectSelections[i].cleanDelete();
    }
    simulationArea.multipleObjectSelections = [];

    // Updated restricted elements
    updateRestrictedElementsInScope();
}

function hoverRestrictedElements(){
    restrictedElements.forEach((element) => {
        $(`#${element}`).mouseover(() => {
            showRestricted();
        });
        
        $(`#${element}`).mouseout(() => {
            hideRestricted();
        })
    });
}

var isIe = (navigator.userAgent.toLowerCase().indexOf("msie") != -1 ||
    navigator.userAgent.toLowerCase().indexOf("trident") != -1);

// HELPERS----------------------------------->END
