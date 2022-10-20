
window.resetStyle = () =>{
    document.getElementById("legendaType").style.display = "none";
    document.getElementById("legendaVisibility").style.display = "none";
    document.getElementById("legendaPayable").style.display = "none";
    var contratto = document.getElementById("corpo_contratto");
    var index = 0;
    var elem = document.getElementById(index.toString());
    while(elem != null){
        if(elem.hasAttribute("style")){
            elem.setAttribute("style", "");
        }
        index++;
        elem = document.getElementById(index.toString());
    }
}

window.visibilityStyle = ()=>{
    fetch('http://localhost:3000/visualization', {
    method: 'GET'
    })
    .then(response => response.json())
    .then(res =>{
        resetStyle();
        document.getElementById("legendaVisibility").setAttribute("style", "display:list-item;list-style-type: none;");
        var internal = document.getElementById("InternalColorInput").value;
        var external = document.getElementById("ExternalColorInput").value;
        var public = document.getElementById("PublicColorInput").value;
        var private = document.getElementById("PrivateColorInput").value;
        var elem_1 = '';
        var contr = 0;
        var contractV = [];
        var methodV = [];
        var lastElem = '';
        var entratoC = false;
        var entratoF = false;
        var index = 0;
        let open = 0;
        var elem = document.getElementById(index.toString());
        
        while(elem != null){
            if(elem.innerHTML.includes('using') || elem.innerHTML.includes("//") || elem.innerHTML.includes("/**")){ 
                if(elem.innerHTML.includes("/**")){
                    index++;
                    while(!document.getElementById((index).toString()).innerHTML.includes("*/")){
                        index++;
                    }
                }
                if(document.getElementById(index.toString()).innerHTML.length > 0){
                    elem_1 = document.getElementById(index.toString());  
                  }
                index++;
                elem = document.getElementById(index.toString());
            } else { 
                for(var smart in res.contracts){
                    if(!elem.innerHTML.includes("event") && !elem.innerHTML.includes("function") && elem.innerHTML.includes(res.contracts[smart].name) && smart >= contractV.length &&(elem.innerHTML.includes("interface") || elem.innerHTML.includes("library") || elem.innerHTML.includes("contract"))){
                        console.log(elem);
                        lastElem = 'contract';
                        entratoC = true;
                        contr = smart;
                        contractV.push(1);
                        break;
                    }
                }
                if(entratoC == false){ 
                    for(var ind in res.contracts[contr].functions){
                        if(elem.innerHTML.includes(res.contracts[contr].functions[ind].name) && ind >= methodV.length && (elem.innerHTML.includes('function') || elem.innerHTML.includes('constructor'))){             
                            if(res.contracts[contr].functions[ind].visibility == 'public'){elem.setAttribute("style", "background-color:"+public+";");}
                            if(res.contracts[contr].functions[ind].visibility == 'private'){elem.setAttribute("style", "background-color:"+private+";");}
                            if(res.contracts[contr].functions[ind].visibility == 'internal'){elem.setAttribute("style", "background-color:"+internal+";");}
                            if(res.contracts[contr].functions[ind].visibility == 'external'){elem.setAttribute("style", "background-color:"+external+";");}
                            console.log(elem);
                            lastElem = res.contracts[contr].functions[ind].visibility;
                            entratoF = true;
                            methodV.push(1);
                            break;
                        }
                    }
                }
                if(entratoF == false && entratoC == false){
                    if(elem.innerHTML.includes("{") && elem.innerHTML.includes("}")){
                        // open rimane uguale . ho un else
                        if(lastElem == 'public'){elem.setAttribute("style", "background-color:"+public+";");}
                        if(lastElem == 'private'){elem.setAttribute("style", "background-color:"+private+";");}
                        if(lastElem == 'internal'){elem.setAttribute("style", "background-color:"+internal+";");}
                        if(lastElem == 'external'){elem.setAttribute("style", "background-color:"+external+";");}
                    } else if(elem.innerHTML.includes("{")){ // apertura di graffa aumento open
                        open++;
                        if(lastElem == 'public'){elem.setAttribute("style", "background-color:"+public+";");}
                        if(lastElem == 'private'){elem.setAttribute("style", "background-color:"+private+";");}
                        if(lastElem == 'internal'){elem.setAttribute("style", "background-color:"+internal+";");}
                        if(lastElem == 'external'){elem.setAttribute("style", "background-color:"+external+";");}
                    } else if(elem.innerHTML.includes("}")){
                        if(open > 0){
                            open--;
                            if(lastElem == 'public'){elem.setAttribute("style", "background-color:"+public+";");}
                            if(lastElem == 'private'){elem.setAttribute("style", "background-color:"+private+";");}
                            if(lastElem == 'internal'){elem.setAttribute("style", "background-color:"+internal+";");}
                            if(lastElem == 'external'){elem.setAttribute("style", "background-color:"+external+";");}
                        } else{
                        if(res.contracts[contr].specs == 'interface' || res.contracts[contr].specs == 'abstract'){
                            methodV = [];
                        } else {
                            if(elem.innerHTML.includes('}') && elem_1.innerHTML.includes('}')){
                                methodV= [];
                            } else {
                                if(lastElem == 'public'){elem.setAttribute("style", "background-color:"+public+";");}
                                if(lastElem == 'private'){elem.setAttribute("style", "background-color:"+private+";");}
                                if(lastElem == 'internal'){elem.setAttribute("style", "background-color:"+internal+";");}
                                if(lastElem == 'external'){elem.setAttribute("style", "background-color:"+external+";");}
                                console.log(elem);
                            }
                        }
                        }
                    } else {                                        
                        if(lastElem == 'public'){elem.setAttribute("style", "background-color:"+public+";");}
                        if(lastElem == 'private'){elem.setAttribute("style", "background-color:"+private+";");}
                        if(lastElem == 'internal'){elem.setAttribute("style", "background-color:"+internal+";");}
                        if(lastElem == 'external'){elem.setAttribute("style", "background-color:"+external+";");}
                        console.log(elem);
                    }
                } 
                if(document.getElementById(index.toString()).innerHTML.length > 0){
                  elem_1 = document.getElementById(index.toString());  
                }
                index++;
                elem = document.getElementById(index.toString());
            }
            entratoC = false;
            entratoF = false;
        }
    });
}

window.fallReceiveStyle = ()=>{
    fetch('http://localhost:3000/visualization', {
    method: 'GET'
    })
    .then(response => response.json())
    .then(res =>{
        resetStyle();
        document.getElementById("legendaType").setAttribute("style", "display:list-item;list-style-type: none;");
        var constructor = document.getElementById("ConstructorColorInput").value;
        var fallback = document.getElementById("FallbackColorInput").value;
        var ReceiveEther = document.getElementById("ReceiveEtherColorInput").value;
        var elem_1 = '';
        var contr = 0;
        var contractV = [];
        var methodV = [];
        var lastElem = '';
        var entratoC = false;
        var entratoF = false;
        var index = 0;
        let open = 0;
        var elem = document.getElementById(index.toString());
        
        while(elem != null){
            if(elem.innerHTML.includes('using') || elem.innerHTML.includes("//") || elem.innerHTML.includes("/**")){ 
                if(elem.innerHTML.includes("/**")){
                    index++;
                    while(!document.getElementById((index).toString()).innerHTML.includes("*/")){
                        index++;
                    }
                }
                if(document.getElementById(index.toString()).innerHTML.length > 0){
                    elem_1 = document.getElementById(index.toString());  
                  }
                index++;
                elem = document.getElementById(index.toString());
            } else { 
                for(var smart in res.contracts){
                    if(elem.innerHTML.includes(res.contracts[smart].name) && smart >= contractV.length &&(elem.innerHTML.includes("interface") || elem.innerHTML.includes("library") || elem.innerHTML.includes("contract"))&& !elem.innerHTML.includes("event") && !elem.innerHTML.includes("function")){
                        lastElem = 'contract';
                        entratoC = true;
                        contr = smart;
                        contractV.push(1);
                        break;
                    }
                }
                if(entratoC == false){ 
                    for(var ind in res.contracts[contr].functions){
                        if(elem.innerHTML.includes(res.contracts[contr].functions[ind].name) && ind >= methodV.length && (elem.innerHTML.includes('function') || elem.innerHTML.includes('constructor'))){             
                            if(res.contracts[contr].functions[ind].isFallback == true){elem.setAttribute("style", "background-color:"+fallback+";"); lastElem = 'Fallback';}
                            if(res.contracts[contr].functions[ind].isReceiveEther == true){elem.setAttribute("style", "background-color:"+ReceiveEther+";"); lastElem = 'ReceiveEther';}
                            if(res.contracts[contr].functions[ind].isConstructor == true){elem.setAttribute("style", "background-color:"+constructor+";"); lastElem = 'Constructor';}
                                if(elem.innerHTML.includes('}')){lastElem = '';}
                            entratoF = true;
                            methodV.push(1);
                            break;
                        }
                    }
                }
                if(entratoF == false && entratoC == false){
                    if(elem.innerHTML.includes("{") && elem.innerHTML.includes("}")){
                        // open rimane uguale . ho un else
                        if(lastElem == 'Fallback'){elem.setAttribute("style", "background-color:"+fallback+";");}
                        if(lastElem == 'ReceiveEther'){elem.setAttribute("style", "background-color:"+ReceiveEther+";");}
                        if(lastElem == 'Constructor'){elem.setAttribute("style", "background-color:"+constructor+";");}
                    } else if(elem.innerHTML.includes("{")){ // apertura di graffa aumento open
                        open++;
                        if(lastElem == 'Fallback'){elem.setAttribute("style", "background-color:"+fallback+";");}
                        if(lastElem == 'ReceiveEther'){elem.setAttribute("style", "background-color:"+ReceiveEther+";");}
                        if(lastElem == 'Constructor'){elem.setAttribute("style", "background-color:"+constructor+";");}
                    } else if(elem.innerHTML.includes("}")){
                        if(open > 0){
                            open--;
                            if(lastElem == 'Fallback'){elem.setAttribute("style", "background-color:"+fallback+";");}
                            if(lastElem == 'ReceiveEther'){elem.setAttribute("style", "background-color:"+ReceiveEther+";");}
                            if(lastElem == 'Constructor'){elem.setAttribute("style", "background-color:"+constructor+";");}
                        } else {
                        if(res.contracts[contr].specs == 'interface' || res.contracts[contr].specs == 'abstract'){
                            methodV = [];
                        } else {
                            if(elem.innerHTML.includes('}') && elem_1.innerHTML.includes('}')){
                                methodV= [];
                            } else {
                                if(lastElem == 'Fallback'){elem.setAttribute("style", "background-color:"+fallback+";");}
                                if(lastElem == 'ReceiveEther'){elem.setAttribute("style", "background-color:"+ReceiveEther+";");}
                                if(lastElem == 'Constructor'){elem.setAttribute("style", "background-color:"+constructor+";");}
                                lastElem = '';
                            }
                        }
                        }
                    } else {                                        
                        if(lastElem == 'Fallback'){elem.setAttribute("style", "background-color:"+fallback+";");}
                        if(lastElem == 'ReceiveEther'){elem.setAttribute("style", "background-color:"+ReceiveEther+";");}
                        if(lastElem == 'Constructor'){elem.setAttribute("style", "background-color:"+constructor+";");}
                    }
                } 

                if(document.getElementById(index.toString()).innerHTML.length > 0){
                    elem_1 = document.getElementById(index.toString());  
                  }
                index++;
                elem = document.getElementById(index.toString());
        
            }
            entratoC = false;
            entratoF = false;
        }
    });
}

    window.payableStyle = ()=>{
        fetch('http://localhost:3000/visualization', {
    method: 'GET'
    })
    .then(response => response.json())
    .then(res =>{
        resetStyle();
        document.getElementById("legendaPayable").setAttribute("style", "display:list-item;list-style-type: none;");
        var payable = document.getElementById("PayableColorInput").value;
        var mutating = document.getElementById("MutatingColorInput").value;
        var elem_1 = '';
        var contr = 0;
        var contractV = [];
        var methodV = [];
        var lastElem = '';
        var entratoC = false;
        var entratoF = false;
        var index = 0;
        let open = 0;
        var elem = document.getElementById(index.toString());
        
        while(elem != null){
            if(elem.innerHTML.includes('using') || elem.innerHTML.includes("//") || elem.innerHTML.includes("/**")){ 
                if(elem.innerHTML.includes("/**")){
                    index++;
                    while(!document.getElementById((index).toString()).innerHTML.includes("*/")){
                        index++;
                    }
                }
                if(document.getElementById(index.toString()).innerHTML.length > 0){
                    elem_1 = document.getElementById(index.toString());  
                  }
                index++;
                elem = document.getElementById(index.toString());
            } else { 
                for(var smart in res.contracts){
                    if(elem.innerHTML.includes(res.contracts[smart].name) && smart >= contractV.length &&(elem.innerHTML.includes("interface") || elem.innerHTML.includes("library") || elem.innerHTML.includes("contract"))&& !elem.innerHTML.includes("event") && !elem.innerHTML.includes("function")){
                        lastElem = 'contract';
                        entratoC = true;
                        contr = smart;
                        contractV.push(1);
                        break;
                    }
                }
                if(entratoC == false){ 
                    for(var ind in res.contracts[contr].functions){
                        if(elem.innerHTML.includes(res.contracts[contr].functions[ind].name) && ind >= methodV.length && (elem.innerHTML.includes('function') || elem.innerHTML.includes('constructor'))){             
                            if(res.contracts[contr].functions[ind].payable == true){elem.setAttribute("style", "background-color:"+payable+";"); lastElem = 'payable';}
                            if(res.contracts[contr].functions[ind].mutating == true){elem.setAttribute("style", "background-color:"+mutating+";"); lastElem = 'mutating';}
                                if(elem.innerHTML.includes('}')){lastElem = '';}
                            entratoF = true;
                            methodV.push(1);
                            break;
                        }
                    }
                }
                if(entratoF == false && entratoC == false){
                    if(elem.innerHTML.includes("{") && elem.innerHTML.includes("}")){
                        // open rimane uguale . ho un else
                        if(lastElem == 'payable'){elem.setAttribute("style", "background-color:"+payable+";");}
                        if(lastElem == 'mutating'){elem.setAttribute("style", "background-color:"+mutating+";");}
                    } else if(elem.innerHTML.includes("{")){ // apertura di graffa aumento open
                        open++;
                        if(lastElem == 'payable'){elem.setAttribute("style", "background-color:"+payable+";");}
                        if(lastElem == 'mutating'){elem.setAttribute("style", "background-color:"+mutating+";");}
                    } else if(elem.innerHTML.includes("}")){
                        if(open > 0){ // chiusa graffa di un if
                            open--;
                            if(lastElem == 'payable'){elem.setAttribute("style", "background-color:"+payable+";");}
                            if(lastElem == 'mutating'){elem.setAttribute("style", "background-color:"+mutating+";");}
                        } else {
                        if(res.contracts[contr].specs == 'interface' || res.contracts[contr].specs == 'abstract'){ // chiusura interface
                            methodV = [];
                        } else {
                            if(elem.innerHTML.includes('}') && elem_1.innerHTML.includes('}')){ // chiusura di un contract o library
                                methodV= [];
                            } else { // chiusura di una funzione
                                if(lastElem == 'payable'){elem.setAttribute("style", "background-color:"+payable+";");}
                                if(lastElem == 'mutating'){elem.setAttribute("style", "background-color:"+mutating+";");}
                                lastElem = '';
                            }
                        }
                        }
                    } else {  // corpo della funzione                                      
                        if(lastElem == 'payable'){elem.setAttribute("style", "background-color:"+payable+";");}
                        if(lastElem == 'mutating'){elem.setAttribute("style", "background-color:"+mutating+";");}
                    }
                } 

                if(document.getElementById(index.toString()).innerHTML.length > 0){
                    elem_1 = document.getElementById(index.toString());  
                  }
                index++;
                elem = document.getElementById(index.toString());
        
            }
            entratoC = false;
            entratoF = false;
        }
    });
}