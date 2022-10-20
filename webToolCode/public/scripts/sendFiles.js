
document.getElementById("formFile").onsubmit = async (e) =>{
    e.preventDefault();
    document.getElementById("formFile").style.display = "none";
    document.getElementById("formFileMultiple").style.display = "none";
    const formData = new FormData();
    formData.append("file", document.getElementById("file").files[0]);
    fetch("http://localhost:3000/upload", {
        method: 'POST',
        body: formData,
    })
    .then(res => res.json())
    .then(file => { //popolo l'html con il testo del contratto e abilito il menu
        //corpo contratto
        var elem = document.getElementById("corpo_contratto"); 
        for(var i in file){
            var insert = document.createElement("p");
            insert.innerHTML = file[i].toString();
            var att = document.createAttribute("id");
            att.value = i;
            insert.setAttributeNode(att);
            elem.insertAdjacentElement("beforeend", insert);
        }
        // abilito menu
        document.getElementById("menu").style.display = "inline";

    })
    .catch(err => console.log(err));
}

/*<div class="form-group">
    <label for="exampleFormControlTextarea1">Esempio di area di testo</label>
    <textarea id="exampleFormControlTextarea1" rows="3"></textarea>
  </div>
  +button finale;
*/
function createABIform(files){
    let elem = document.getElementById('corpo_contratto');
    for(var i = 0; i <files.length; i++){
        var div = document.createElement('div');
        var clas = document.createAttribute('class');
        var idis = document.createAttribute('id');
        idis.value = "formABI"+i;
        clas.value = "form-floating";
        div.setAttributeNode(clas);
        div.setAttributeNode(idis);
        var label = document.createElement('label');
        var forr = document.createAttribute('for');
        forr.value = "FormFile"+i;
        var nodes = document.createTextNode("Inserisci l'ABI del file "+files[i].name);
        label.setAttributeNode(forr);
        label.appendChild(nodes);
        var textarea = document.createElement('textarea');
        var id = document.createAttribute('id');
        id.value = "FormFile"+i;
        var cla = document.createAttribute('class');
        cla.value = "form-control";
        var placeholder = document.createAttribute('placeholder');
        placeholder.value = "Leave an ABI here";
        var style = document.createAttribute('style');
        style.value = "height: 200px";
        textarea.setAttributeNode(placeholder);
        textarea.setAttributeNode(style);
        textarea.setAttributeNode(id);
        textarea.setAttributeNode(cla);
        div.appendChild(label);
        div.appendChild(textarea);
        elem.appendChild(div);
    }
    let button = document.createElement('button');   //<button type="button" class="btn btn-primary btn-lg btn-block">Primary Block</button>
    let type = document.createAttribute('type');
    type.value = 'button';
    let classs = document.createAttribute('class');
    classs.value = 'btn btn-primary btn-lg btn-block';
    let node = document.createTextNode('Submit');
    let ids = document.createAttribute('id');
    ids.value = "buttonABI";
    let onclick = document.createAttribute('onclick');
    onclick.value = "createGraphics()";
    button.setAttributeNode(onclick);
    button.setAttributeNode(ids);
    button.setAttributeNode(type);
    button.setAttributeNode(classs);
    button.appendChild(node);
    elem.appendChild(button);
    document.getElementById("formFile").style.display = "none";
    document.getElementById("formFileMultiple").style.display = "none"; 
}

function totalGasOfContract(gas){
    let gasContract = 0;
    for(var i in gas){
        gasContract += gas[i].gas;
    }
    return gasContract;
}

function insertGasInData(data, gas){
    for(var i = 0; i < data.length; i++){
        for(var j = 0; j < gas.length; j++){
            if(data[i].name == gas[j].file){
                data[i].gasPrice = totalGasOfContract(gas[j].result);
                break;
            }
        }
    }
    return data;
}

async function checkGasOnDb(){
   let result = [];
   let functionOfFile = [];
   for(var i = 0; i < document.getElementById('filemultiple').files.length; i++){
        if(document.getElementById("FormFile"+i).value != ""){
            for(var j = 0; j < JSON.parse(document.getElementById("FormFile"+i).value).length; j++){
                if(JSON.parse(document.getElementById("FormFile"+i).value)[j].type == "function"){
                    functionOfFile.push(JSON.parse(document.getElementById("FormFile"+i).value)[j].name);
                }
                
            }
            var request = {file: document.getElementById('filemultiple').files[i].name, functions: functionOfFile};
            const response = await fetch("http://localhost:3000/checkGas", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        }) 
        const gas = await response.json();
        functionOfFile = [];
        result.push(gas);
        }
    }
    return result;
} //{result: res, toCalculate: toCalculate, file: gas.file}
// res = {name: el.functionName, gas: el.gasCost}

async function writeGasOnDb(request){
    console.log(request);
    let arrInput = [];
    for(var i = 0; i < request.length; i++){
        for(var j = 0; j < request[i].toCalculate.length; j++){
            for(var k = 0; k < JSON.parse(document.getElementById("FormFile"+i).value).length; k++){ // per ogni elemento nell'ABI 
                if(JSON.parse(document.getElementById("FormFile"+i).value)[k].type == "function" && JSON.parse(document.getElementById("FormFile"+i).value)[k].name == request[i].toCalculate[j]){
                    for(var n = 0; n < JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs.length; n++){
                        if(JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type.includes("uint") || JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type.includes("int")){
                            arrInput.push(100);
                          } else if(JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type == "address" || JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type == "address[]"){
                            arrInput.push("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4");
                          } else if(JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type.includes("bytes") || JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type == "string"){
                            if((JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type.includes("bytes4"))){
                                arrInput.push("0x12345678");
                            } else {
                                arrInput.push("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4");
                            }
                          } else if(JSON.parse(document.getElementById("FormFile"+i).value)[k].inputs[n].type == "bool"){
                            arrInput.push(true);
                        }
                    }

            var req = {fileName: document.getElementById('filemultiple').files[i].name, functionName: request[i].toCalculate[j], ABI: document.getElementById("FormFile"+i).value, input: arrInput}
            console.log(req);
            const response = await fetch("http://localhost:3000/writeGas", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        }) 
        const gas = await response.json();
        console.log(gas);
        request[i].result.push({name: request[i].toCalculate[j], gas: gas.gas});
        arrInput = [];
        }
        }
        }
    }
    console.log(request);
    return request;
}

/*async function calculateGas(){
    let wrapper = [];
    let arrInput = [];
    let result = [];
    for(var i = 0; i < document.getElementById('filemultiple').files.length; i++){
        if(document.getElementById("FormFile"+i).value != ""){
        for(var j = 0; j < JSON.parse(document.getElementById("FormFile"+i).value).length; j++){
            if(JSON.parse(document.getElementById("FormFile"+i).value)[j].type == "function"){
            for(var k = 0; k < JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs.length; k++){
                if(JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs[k].type.includes("uint") || JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs[k].type.includes("int")){
                    arrInput.push(100);
                  } else if(JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs[k].type == "address"){
                    arrInput.push("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4");
                  } else if(JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs[k].type.includes("bytes") || JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs[k].type == "string"){
                    arrInput.push("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4");
                  } else if(JSON.parse(document.getElementById("FormFile"+i).value)[j].inputs[k].type == "bool"){
                    arrInput.push(true);
                  }
            }
        var request = {ABI: document.getElementById("FormFile"+i).value, input: arrInput, name: JSON.parse(document.getElementById("FormFile"+i).value)[j].name}
        const response = await fetch("http://localhost:3000/gas", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        }) 
        const gas = await response.json();
        result.push(gas);
        arrInput = [];
    }
    } // finito di leggere l'ABI di un file e passo al prossimo
    wrapper.push({gas: result, contractName: document.getElementById('filemultiple').files[i].name});
    result = [];
}
    }
    return wrapper;
} */

function createRadioFiles(files){
    let elem = document.getElementById('grafici');
    var div = document.createElement('div');
        var idis = document.createAttribute('id');
        idis.value = "radioGroup";
        div.setAttributeNode(idis);
        var button = document.createElement('input');
        var type = document.createAttribute('type');
        var id = document.createAttribute('id');
        var name = document.createAttribute('name');
        var value = document.createAttribute('value');
        type.value = "radio";
        id.value = "niente";
        name.value = "contract";
        value.value = "niente";
        button.setAttributeNode(type);
        button.setAttributeNode(id);
        button.setAttributeNode(name);
        button.setAttributeNode(value);
        div.appendChild(button);
    for(var i = 0; i <files.length; i++){
        var button = document.createElement('input');
        var type = document.createAttribute('type');
        var id = document.createAttribute('id');
        var name = document.createAttribute('name');
        var value = document.createAttribute('value');
        type.value = "radio";
        id.value = files[i].name;
        name.value = "contract";
        value.value = files[i].name;
        button.setAttributeNode(type);
        button.setAttributeNode(id);
        button.setAttributeNode(name);
        button.setAttributeNode(value);
        div.appendChild(button);
    }
    elem.appendChild(div);
}

function createGraphics(){ // viene lanciata quando schiaccio il button del form creato dinamicamente
    /*console.log(document.getElementById('filemultiple').files);
    console.log(document.getElementById("FormFile0").value);
    console.log(document.getElementById("FormFile1").value);*/
    const formData = new FormData();
    /*for(var i in document.getElementById('filemultiple').files){
        var elem = document.getElementById("FormFile"+i).value;
        var el = elem.split("\n").join("");
        console.log(el);
    }*/
    
    for(var i = 0; i < document.getElementById('filemultiple').files.length; i++){
        formData.append("file"+i, document.getElementById('filemultiple').files[i]);
        formData.append("ABI"+i, document.getElementById("FormFile"+i).value ? document.getElementById("FormFile"+i).value:'');
        
        document.getElementById("formABI"+i).style.display = "none";
        document.getElementById("buttonABI").style.display = "none";
    }
    
    //createRadioFiles(document.getElementById('filemultiple').files);
    
    fetch("http://localhost:3000/abi", {
        method: 'POST',
        body: formData,
    }) 
    .then(res => res.json())
    .then(success =>{
        checkGasOnDb().then((res) =>{
            //console.log(res);
            writeGasOnDb(res).then(gas =>{
                success = insertGasInData(success, gas);
                const data = dataScatterPlot(success); //funziona
                ScatterplotMatrix(data.matrix);
            
        //posso già fare il grafico dello scattermatrixplot qui
        // DEVO usare il mio DB per vedere se queste informazioni posso già prenderle da li, altrimenti vado a fare la richiesta al server di conceptnet
        const writeDB = async (data) =>{
            return await conceptNetPart2(data);
        }

        const query = async(success) =>{
            const data_structure = queryToDatabase(success);
            return data_structure;
        }
        
            /*concepts(success).then((res) =>{ //qua dentro ho data_structure corretta
            relation(res).then((field) =>{
                console.log(field);
                console.log(res);
                createDataStructure(field, res);
                zoomableCirclePacking(createDataStructure(field, res));
            })
            })*/
         query(success).then(res => {
             // al momento le API di conceptnet sono offline. Devo utilizzare un file locale che abbia le informazioni che mi servono. Tutto conceptnet
             //conceptNetCSV().then((res) => console.log(res)).catch((err) => console.log(err));
             return conceptNetPart1(res)})// qua dentro avrò data1
         .then(result => writeDB(result)) // in result.file.
         .then(finish => {
             for(var i in finish){
                var strCtx = finish[i].wordContext.resultQuery.join(",").split(",");
                finish[i].wordContext.resultQuery = swapOutDouble(strCtx); // per questioni del DB
                finish[i].wordContext.resultQuery = findPercentage(finish[i].wordContext.resultQuery); // percentauli di presenza degli hasContext
                finish[i].wordContext.resultQuery = order(finish[i].wordContext.resultQuery); // ordino in modo decrescente in base a percentage
                console.log(finish[i].wordContext.resultQuery)
            }
            const data = createDataStructure(finish);
            zoomableCirclePacking(data.result, data.file);
            /*d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv", function(data) {
                console.log(data);
            })*/
            fetch("http://localhost:3000/upload", {
                method: 'POST',
                body: formData,
            })
            .then(res => res.json())
            .then(data =>{
                console.log(data);
                BubblePlot(createData(data, gas));
            })
            //Devo mettere altra roba
         })
         

        //per ora mi concentro sul grafico che definisce l'argomento di un contratto
        //per trovare l'argomento esiste un modo! Credo che ciò che si avvicina di più sia la HasContext:
        // 437: {@id: '/a/[/r/HasContext/,/c/en/deposit/v/,/c/fr/finance/]', @type: 'Edge', dataset: '/d/wiktionary/fr', end: {…}, license: 'cc:by-sa/4.0', …}
        // il 437o elemento di deposit mi da questo ----> molto importante. Sempre dare priorità all'hasContext per trovare dove può essere usato
        })
        })
    })
    .catch(err => console.log(err));
}


document.getElementById("formFileMultiple").onsubmit = async (e) =>{
    e.preventDefault();
    //console.log(document.getElementById('filemultiple').files);
    createABIform(document.getElementById('filemultiple').files);
    /*document.getElementById('buttonABI').onclick = async (e) =>{
        console.log(document.getElementById('filemultiple').files);
        console.log(document.getElementById("FormFile0").textContent)
        console.log(document.getElementById("FormFile0").innerText);
        console.log(document.getElementById("FormFile1").innerText);
    }*/
} 

/*async function conceptNetCSV(){
    const response = await fetch('http://localhost:3000/conceptNetCSV');
    const data = await response.json();
    return data;
}*/

async function conceptNetPart1(success){ //success[]{file: wrapp[i], wordContext: {vettConcept:[], resultQuery:[]}}
    let hasContext = [];
    let temp = new Array(success.length);
    for(var n in success){ //success è un vettore che ha informazioni su più file!
        for(var j in success[n].wordContext.vettConcept){
            var vett = success[n].wordContext.vettConcept[j];
            const response = await fetch('https://api.conceptnet.io/c/en/'+vett+'?offset=0&limit=600')
            const data = await response.json();
            var vect = findHasContext(data);
            hasContext.push(vect);
            success[n].wordContext.resultQuery.push(vect);
        }
        
        temp[n] = {file: success[n].file, wordContext: success[n].wordContext, writeOnDB: hasContext}
        hasContext = [];
    }
    for(var i = 0; i < temp.length; i++){
        for(var j = i-1; j >= 0; j--){
            for(var k = 0; k < temp[i].wordContext.vettConcept.length; k++){
                for(var l = 0; l < temp[j].wordContext.vettConcept.length; l++){
                    if(temp[i].wordContext.vettConcept[k] == temp[j].wordContext.vettConcept[l]){
                        temp[i].wordContext.vettConcept.splice(k, 1);
                        temp[i].writeOnDB.splice(k, 1);
                        k--;
                        break;
                    }
                }
            }
        }
    }

    return temp;
}

async function conceptNetPart2(data){
    console.log(data);
    for(var i = 0; i < data.length; i++){
    var inp = {writeOnDB: data[i].writeOnDB, vettConcept: data[i].wordContext.vettConcept};
    const writingDB = await fetch('http://localhost:3000/writingDB', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inp),
                })
    const resp = await writingDB.json();
    }
    return data;    
}


async function queryToDatabase(wrapp){
    let vett = [];
    let data1 = [];
    for(var i in wrapp){ // ciclo sui file
        for(var j in wrapp[i].contracts){ // ciclo sui contracts del file
            for(var k in wrapp[i].contracts[j].methodsName){
                vett = vett.concat(naturalName(wrapp[i].contracts[j].methodsName[k]));
            }
        }
        for(var j in wrapp[i].library){
            for(var k in wrapp[i].library[j].methodsName){
                vett = vett.concat(naturalName(wrapp[i].library[j].methodsName[k]));
            }
        }
        var defArray = [...new Set(vett)];
        if(vett.length > 0){
            const response = await fetch('http://localhost:3000/queryRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(defArray),
            })
            const data = await response.json();
            data1.push({file: wrapp[i], wordContext: data});
           
        }
    }
    
    return data1;
}

function isUpperCase(str){
    if(str === str.toUpperCase()){
        return true;
    } else {
        return false;
    }
}

function naturalName(name){
    var vett = [];
    if(name == "constructor" || name == "receive ether"){
        return vett;
    }
    /*vett.push(name.toLowerCase());
    for(var i = 1; i < name.length; i++){
        vett.push(name.substring(i).toLowerCase());
    }
    return vett;*/
    let iniz = -1;
    let temp = '';
    if(name.split("_").length > 1){
        var copia = name.split("_");
        for(var i in copia){
            if(copia[i].length > 3){ // se è una parola abbastanza lunga controlliamo se ci sono altri valori con maiuscole e minuscole
                for(var j in copia[i]){
                    if(isUpperCase(copia[i][j]) || j === 0){
                        if(iniz == -1){
                            iniz = j;
                        } else {
                            vett.push(temp.toLowerCase());
                            iniz = -1;
                            temp = '';
                        }
                    }
                    temp += copia[i][j];
                }
                vett.push(temp.toLowerCase());
            }
        }
        return vett;
    }
    // se vado avanti vuol dire che non ho il trattino basso nella parola
    iniz = 0;
    for(var i = 0; i < name.length; i++){
        if(isUpperCase(name[i])){
            if(temp.length > 3){
                vett.push(temp.toLowerCase());
            }
            temp = '';
            iniz = i;
        }
        temp += name[i];
    }
    if(temp.length > 3){
      vett.push(temp.toLowerCase());  
    }
    return vett;
}

async function findWordContext(argomenti_file){
    var field = [];

    for(var n in argomenti_file){
        field.push(new Array());
    for(var i in argomenti_file[n].concept){
        for(var j in argomenti_file[n].concept[i].edges){
            if(argomenti_file[n].concept[i].edges[j].rel.label == "HasContext" && argomenti_file[n].concept[i].edges[j].start.language == "en" && argomenti_file[n].concept[i].edges[j].end.language == "en"){ // potrebbe tirare fuori dei contesti in altre lingue... potrebbe essere utile avere la possibilità di tradurre
                    if(argomenti_file[n].concept[i].edges[j].start.label != argomenti_file[n].concept[i]["@id"].split("/")[3]){ // start.label ho il risultato
                        // se già ce l'ho non voglio mettere un doppione ma aumentare il contatore di quella parola
                        var ind = field[n].find((val, ind) =>{if(val.name == argomenti_file[n].concept[i].edges[j].start.label){
                            val.counter++;
                            return true;
                        }})
                        if(!ind){
                            field[n].push({name: argomenti_file[n].concept[i].edges[j].start.label, weigth: argomenti_file[n].concept[i].edges[j].weight, counter: 1, percentage: 0});
                        }   
                   } else {
                        // se già ce l'ho non voglio mettere un doppione ma aumentare il contatore di quella parola
                        var ind = field[n].find((val, ind) =>{if(val.name == argomenti_file[n].concept[i].edges[j].end.label){
                            val.counter++;
                            return true;
                        }})
                        if(!ind){
                            field[n].push({name: argomenti_file[n].concept[i].edges[j].end.label, weigth: argomenti_file[n].concept[i].edges[j].weight, counter: 1, percentage: 0});
                        }
                    }
                }
            }
        }
    }
    findPercentage(field);
    return best4(field);
}

function findHasContext(concept){
    var field = [];
    for(var i in concept.edges){ 
        if(concept.edges[i].rel.label == "HasContext" && concept.edges[i].start.language == "en" && concept.edges[i].end.language == "en"){ // potrebbe tirare fuori dei contesti in altre lingue... potrebbe essere utile avere la possibilità di tradurre
            if(concept.edges[i].start.label != concept["@id"].split("/")[3]){ // start.label ho il risultato
                field.push(concept.edges[i].start.label);  
            } else {
                field.push(concept.edges[i].end.label);
            }
        }
    }
    return field;
}

function swapOutDouble(vett){
   let res = [];
    for(var i in vett){
       if(vett[i] != ''){
          res.push(vett[i]);
       }
   }
   res = res.map(function(elem, index, arr){
        let contatore = 1;
        for(var i in arr){
           if((parseInt(i) != parseInt(index)) && elem == arr[i]){
                contatore++;
           }
       }
        return {word: elem, num: contatore}
   })
   let vect = [];
   var entr = 0;
   for(var i in res){
       for(var j in vect){
           if(res[i].word == vect[j].word){
              var entr = 1;
              break;
           }
       } 
       if(entr == 0){
         vect.push({word: res[i].word, num: res[i].num});
       }
       entr = 0;
   }
   
   return vect;
}

function findPercentage(field){ // field[{word: , num: }, {...}, ...]
    var total = 0;
    for(var i in field){
        field[i] = {word: field[i].word, num: field[i].num, percentage: 0}
        total += field[i].num;
    }

    for(var i in field){
        field[i].percentage = ((field[i].num/total)*100).toFixed(1);
    }
    return field;
}

function order(data){
    return data.sort((a, b) =>{return b.percentage - a.percentage})
}

/*async function tradWord(name){
    const response = await fetch("https://api.conceptnet.io"+name)
    const trad = await response.json();
        for(var i in trad.edges){
            if(trad.edges[i].rel.label == "Synonym"){
                if(trad.edges[i].start.language == "en"){
                    return trad.edges[i].start.label;
                } else if(trad.edges[i].end.language == "en"){
                    return trad.edges[i].end.label;
                }
            }
        }
    return null;
} */

/*function createDataStructure(data){ 
    let result = [];
    for(var i in data){
        var length = data[i].wordContext.resultQuery.length < 4 ? data[i].wordContext.resultQuery.length:4;
        for(var j = 0; j < length; j++){
            result.push({id: "flare."+data[i].wordContext.resultQuery[j].word+"."+data[i].file.name.split(".")[0], value: data[i].wordContext.resultQuery[j].percentage})
        }
    }
    return result;  
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bubble-chart
function BubbleChart(data, {
    name = ([x]) => x, // alias for label
    label = name, // given d in data, returns text to display on the bubble
    value = ([, y]) => y, // given d in data, returns a quantitative size
    group, // given d in data, returns a categorical value for color
    title, // given d in data, returns text to show on hover
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links, if any
    width = 640, // outer width, in pixels
    height = width, // outer height, in pixels
    padding = 3, // padding between circles
    margin = 1, // default margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    groups, // array of group names (the domain of the color scale)
    colors = d3.schemeTableau10, // an array of colors (for groups)
    fill = "#ccc", // a static fill color, if no group channel is specified
    fillOpacity = 0.7, // the fill opacity of the bubbles
    stroke, // a static stroke around the bubbles
    strokeWidth, // the stroke width around the bubbles, if any
    strokeOpacity, // the stroke opacity around the bubbles, if any
  } = {}) {
    // Compute the values.
    const D = d3.map(data, d => d);
    const V = d3.map(data, value);
    const G = group == null ? null : d3.map(data, group);
    const I = d3.range(V.length).filter(i => V[i] > 0);
  
    // Unique the groups.
    if (G && groups === undefined) groups = I.map(i => G[i]);
    groups = G && new d3.InternSet(groups);
  
    // Construct scales.
    const color = G && d3.scaleOrdinal(groups, colors);
  
    // Compute labels and titles.
    const L = label == null ? null : d3.map(data, label);
    const T = title === undefined ? L : title == null ? null : d3.map(data, title);
  
    // Compute layout: create a 1-deep hierarchy, and pack it.
    const root = d3.pack()
        .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
        .padding(padding)
      (d3.hierarchy({children: I})
        .sum(i => V[i]));
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-marginLeft, -marginTop, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("fill", "currentColor")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");
  
    const leaf = svg.selectAll("a")
      .data(root.leaves())
      .join("a")
        .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.x},${d.y})`);
  
    leaf.append("circle")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
        .attr("fill-opacity", fillOpacity)
        .attr("r", d => d.r);
  
    if (T) leaf.append("title")
        .text(d => T[d.data]);
  
    if (L) {
      // A unique identifier for clip paths (to avoid conflicts).
      const uid = `O-${Math.random().toString(16).slice(2)}`;
  
      leaf.append("clipPath")
          .attr("id", d => `${uid}-clip-${d.data}`)
        .append("circle")
          .attr("r", d => d.r);
  
      leaf.append("text")
          .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
        .selectAll("tspan")
        .data(d => `${L[d.data]}`.split(/\n/g))
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
          .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
          .text(d => d);
    }
    let colori = [];
    let etich = [];
    let map = new Map();
    for(let i of groups.values()){
        etich.push(i);
    }
    colori = colors.filter((val, ind) =>{
        if(ind < etich.length){
            return val;
        }
    })
    for(var i = 0; i < etich.length; i++){map.set(etich[i], colori[i])}
    ColorLegend(map);
    d3.select("#grafici").append(()=>svg.node());
  } */

function ColorLegend(colorScaleMap){
    var ind = 0;
    console.log(colorScaleMap);
    var el = document.getElementById("grafici");
    let div = document.createElement('div'); // da mettere nel dom
    let style = document.createAttribute('style');
    style.value = "display: flex; align-items: center; min-height: 33px; margin-left: 0px; font: 20px sans-serif;";
    div.setAttributeNode(style);
    let style_el = document.createElement('style'); //da mettere nel dom
    let node = document.createTextNode(".legend{ display: inline-flex; align-items: center; margin-right: 1em;} .legend::before{content: \"\"; width: 15px; height: 15px; margin-right: 0.5em; background: var(--color)}");
    style_el.appendChild(node);
    el.appendChild(div);
    el.appendChild(style_el);
    for(var elem of colorScaleMap){
        var span = document.createElement('span');
        var clas = document.createAttribute('class');
        var styles = document.createAttribute('style');
        var nodes = document.createTextNode(elem[0]);
        styles.value = "--color: "+elem[1];
        clas.value = "legend";
        span.setAttributeNode(clas);
        span.setAttributeNode(styles);
        span.appendChild(nodes);
        el.appendChild(span);
        ind++;
      }
  }

  function createDataStructure(data){
    let result = {name: "flare", children: []};
    let nameF = [];
    let isThere = 0;
    for(var i in data){ // ciclo su file 
        nameF.push(data[i].file.name.split(".")[0]);
        for(var j in data[i].wordContext.resultQuery){
            for(var k in result.children){
               if((parseInt(j) < 4 && data[i].wordContext.resultQuery[j].word == result.children[k].name)){ // già c'è l'argomento del vettore. Aggiungo il contratto
                   result.children[k].children.push({name: data[i].file.name.split(".")[0], value: parseInt(data[i].wordContext.resultQuery[j].percentage)});
                   isThere = 1;
                   break;
               }
            }
            if(isThere == 0 && parseInt(j) < 4){ // devo aggiungere il context al vettore e metterci dentro il nome file
                result.children.push({name: data[i].wordContext.resultQuery[j].word, children: [{name: data[i].file.name.split(".")[0], value: parseInt(data[i].wordContext.resultQuery[j].percentage)}]});
            }
            isThere = 0;
        }
    }
    return {result: result, file: nameF};
  }

  function zoomableCirclePacking(data, nameF){
    let color = d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)
    
    const width = 932

    const height = 932;

    const pack = (data) => {
    return d3.pack()
    .size([width/2, height/2])
    .padding(3)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))
    }

    let format = d3.format(",d");

    const root = pack(data);
    let focus = root;
    let view;

    const svg = d3.create("svg")
        .attr("width", 850)
        .attr("height", 850)
        .attr("viewBox", `-${width/2 } -${height/2} ${width} ${height}`) // -${width/2 } , -${height/4}/2
        .attr("id", "zoomableCirclePacking")
        .style("display", "inline") //block
        .style("margin", "0 -14px")
        //.style("background", color(0))
        .style("cursor", "pointer")
        .on("click", (event) => zoom(event, root));
  
    console.log(root.descendants().slice(1));

    let colorsInt = d3.scaleOrdinal()
    .domain(nameF)
    .range(d3.schemeCategory10)

    console.log(d3.schemeCategory10);

    const node = svg.append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
        .attr("fill", d => d.children ? color(d.depth) : colorsInt(d.data.name))
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));
  
    const label = svg.append("g")
        .style("font", "20px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);
  
    zoomTo([root.x, root.y, root.r * 2]);
  
    function zoomTo(v) {
      const k = width / v[2];
  
      view = v;
      label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", d => d.r * k);
    }
  
    function zoom(event, d) {
      const focus0 = focus;
  
      focus = d;
  
      const transition = svg.transition()
          .duration(event.altKey ? 7500 : 750)
          .tween("zoom", d => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return t => zoomTo(i(t));
          });
  
      label
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .transition(transition)
          .style("fill-opacity", d => d.parent === focus ? 1 : 0)
          .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
          .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }
  
    
    let map = new Map();
    for(var i in nameF){
        map.set(nameF[i], d3.schemeCategory10[i]);
    }
    ColorLegend(map);
    d3.select("#grafici").append(()=>svg.node());
  }

// QUI METTERO' IL BUBBLE PLOT

function createData(data, gas){ // tutte le info sulle funzioni di tutti i file
    let gasPrice = 0;
    let structure = [];
    let contatore = 0;
    let length = 0;
    for(var i = 0; i < data.length; i++){ // ciclo su ogni file
        for(var j = 0; j < data[i].surya.contracts.length; j++){
            for(var k = 0; k < data[i].surya.contracts[j].functions.length && data[i].surya.contracts[j].specs != "interface" && data[i].surya.contracts[j].specs != "abstract"; k++){ // qua ho il nome della funzione
                for(var l = 0; l < data[i].contract.length; l++){ // qua ho il testo dello smart contract come vettore
                    if(data[i].contract[l].includes("//")){continue;}
                    if(data[i].contract[l].includes("/**")){l = goAhead(data[i].contract, l); continue;}
                    var temp = isEqual(data[i].contract[l], data[i].surya.contracts[j].functions[k].name);
                    if(temp){
                        contatore += temp;
                    }
                    if(length == 0){
                    length = functionLength(data[i].contract, data[i].surya.contracts[j].functions[k].name, l);
                    }
                }
                //inserisco il gasPrice per le funzioni public ---> delle funzioni internal non posso calcolare il gasPrice
                for(var n = 0; n < gas.length; n++){
                    if(gas[n].file.trim().split(".")[0] == data[i].fileName){
                        for(var t = 0; t < gas[i].result.length; t++){
                            if(gas[n].result[t].name == data[i].surya.contracts[j].functions[k].name){
                                gasPrice = gas[n].result[t].gas; 
                                break;
                            }
                        }
                    }
                }
                if(contatore == 0){
                    structure.push({recall: 1, functionName: data[i].surya.contracts[j].functions[k].name, contractName: data[i].fileName, length: length, gasPrice: gasPrice}) 
                } else {
                    structure.push({recall: contatore, functionName: data[i].surya.contracts[j].functions[k].name, contractName: data[i].fileName, length: length, gasPrice: gasPrice}) 
                }
                contatore = 0;
                length = 0;
                gasPrice = 0;
            }
        }
    }
    return structure;
}

function functionLength(lineString, contractName, l){
    let graff = 0;
    let length = 0;
    if(lineString[l].trim().split(" ")[0].trim() == "function" && lineString[l].trim().split(" ")[1].split("(")[0].trim() == contractName && lineString[l].includes("{")){ // l'ultimo confronto lo faccio perchè ho bisogno di verificare di non essere in una dichiarazione di funzione di interfaccia o abstract
       for(var i = l; i < lineString.length; i++){ // uscirò tramite un break quando tute le graffe si chiudono
            if(lineString[i].includes("{")){graff++;}
            if(lineString[i].includes("}")){graff--;}
            length++;
            if(graff == 0){break;}
       }
    }
    return length;
}

function isEqual(lineString, contractName){
    if(lineString.trim().split(" ")[0].trim() == "function"){
        return false;
    }
    let elem = lineString.split(/[\.\s\,\(\)\[\]]/) //.map((elem) => elem.split(",").map((elem) => elem.split(".").map((elem) => elem.split("(").map((elem) => elem.split(")").map((elem) => elem.split("[").map((elem) => elem.split("]")))))))
    let res = elem.filter(el => el == contractName);
    if(res.length > 0){
        return res.length;
    } else {
        return false;
    }
}

function goAhead(contract, l){
    while(!contract[l].includes("*/")){
        l++;
    }
    return l;
}

function BubblePlot(data){
// set the dimensions and margins of the graph
var margin = {top: 40, right: 150, bottom: 60, left: 30}
const width = 800;
const height = 500;

// append the svg object to the body of the page
var svg = d3.create("svg")
        .attr("viewBox", `-50 -50 1500 1500`)
        .style("display", "block")
        .attr("id", "bubblePlot");

//Read the data
  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

  function findMaxGas(data){
    let max = 0;
    for(var i of data){
        if(i.gasPrice > max && i.recall > 0){
            max = i.gasPrice;
        }
    }
    console.log(max);
    return max;
  }
  function findMinGas(data){
    let min = 0;
    for(var i of data){
        if(i.gasPrice > 0){
          min = i.gasPrice;
          break;  
        }
        
    }
    for(var i of data){
        if(i.gasPrice < min && i.recall > 0 && i.gasPrice > 0){
            min = i.gasPrice;
        }
    }
    return min;
  }
  function findMaxlength(data){
    let max = 0;
    for(var i of data){
        if(i.length > max && i.recall > 0 && i.gasPrice > 0){
            max = i.length;
        }
    }
    console.log(max);
    return max;
  }
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, findMaxlength(data)])
    .range([ 0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(3));

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+50 )
      .text("function length");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([findMinGas(data), findMaxGas(data)])
    .range([height , 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -20 )
      .text("Gas price (ETH)")
      .attr("text-anchor", "start")

  // Add a scale for bubble size
  var z = d3.scaleSqrt() //FORSE DA METTERE A POSTO VEDIAMO PIù AVANTI
    .domain([0, 20])
    .range([ 0, 40]);

  // Add a scale for bubble color
  var vettS = new Set();
  for(var i in data){
    vettS.add(data[i].contractName);
  }
  var vett = [];
  for(let value of vettS.values()){
    vett.push(value);
  }
  var myColor = d3.scaleOrdinal()
    .domain(vett) //modifico mettendo un array con tutti i nomi dei file presi una sola volta
    .range(d3.schemeSet1);


  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3.select("#grafici")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  const showTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .style("position", "relative")
      .html("Function name: " + d.functionName)
      .style("left", (event.x) + "px")
      .style("top", (event.y) + "px")
  }
  const moveTooltip = function(event, d) {
    tooltip
      .style("left", (event.x) + "px")
      .style("top", (event.y) + "px")
  }
  const hideTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }


  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  var highlight = function(event, d){
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    d3.selectAll("."+d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  var noHighlight = function(event, d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }


  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", function(d) {return "bubbles " + d.contractName})
      .attr("cx", function (d) { return x(d.length); } )
      .attr("cy", function (d) { return y(d.gasPrice); } )
      .attr("r", function (d) { return z(d.recall); } )
      .style("fill", function (d) { return myColor(d.contractName); } )
    // -3- Trigger the functions for hover
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )



    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
   // var valuesToShow = [10000000, 100000000, 1000000000]
    var xCircle = 500
    var xLabel = 550
   /* svg
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("circle")
        .attr("cx", xCircle )
        .attr("cy", function(d){ return height - 100 - z(d) } )
        .attr("r", function(d){ return z(d) })
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("line")
        .attr('x1', function(d){ return xCircle + z(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return height - 100 - z(d) } )
        .attr('y2', function(d){ return height - 100 - z(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    /*svg
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("text")
        .attr('x', xLabel)
        .attr('y', function(d){ return height - 100 - z(d) } )
        .text( function(d){ return d/1000000 } )
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')

    // Legend title
    svg.append("text")
      .attr('x', xCircle)
      .attr("y", height - 100 +30)
      .text("Population (M)")
      .attr("text-anchor", "middle")*/

    // Add one dot in the legend for each name.
    var size = 20
    var allgroups = vett; // ho bisogno di un vettore ma qui io fornisco un SET e non va bene
    svg.selectAll("myrect")
      .data(allgroups)
      .enter()
      .append("circle")
        .attr("cx", height + 500)
        .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return myColor(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(allgroups)
      .enter()
      .append("text")
        .attr("x", height + size*.8  + 500)
        .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return myColor(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

        d3.select("#grafici").append(()=>svg.node());
}

// SCATTER PLOT MATRIX lo scrivo da qua in poi

function dataScatterPlot(data){
    let res = [];
    let resM = [];
    let ind = 0;
    for(var i in data){
        res.push({name: data[i].name.split(".")[0], length: data[i].length, size: data[i].size, gasPrice: data[i].gasPrice, numContracts: data[i].contracts.length, numLibrary: data[i].library.length, numInterface: data[i].interface.length, mutatingC: 0, fallbackC: 0, payableC: 0, receiveEtherC: 0, internalC: 0, externalC: 0, publicC: 0, privateC: 0, mutatingL: 0, fallbackL: 0, payableL: 0, receiveEtherL: 0, internalL: 0, externalL: 0, publicL: 0, privateL: 0, mutatingI: 0, fallbackI: 0, payableI: 0, receiveEtherI: 0, internalI: 0, externalI: 0, publicI: 0, privateI: 0, mutating: 0, fallback: 0, payable: 0, receiveEther: 0, internal: 0, external: 0, public: 0, private: 0})
        resM.push({name: data[i].name.split(".")[0], length: data[i].length, size: data[i].size, gasPrice: data[i].gasPrice, numFunc: 0, numCIL: data[i].contracts.length+data[i].library.length+data[i].interface.length})
        for(var j in data[i].contracts){
            res[ind].privateC += data[i].contracts[j].visibility.private;
            res[ind].publicC += data[i].contracts[j].visibility.public;
            res[ind].internalC += data[i].contracts[j].visibility.internal;
            res[ind].externalC += data[i].contracts[j].visibility.external;
            res[ind].mutatingC += data[i].contracts[j].mutating;
            res[ind].fallbackC += data[i].contracts[j].fallback;
            res[ind].payableC += data[i].contracts[j].payable;
            res[ind].receiveEtherC += data[i].contracts[j].receiveEther;
            res[ind].private += data[i].contracts[j].visibility.private;
            res[ind].public += data[i].contracts[j].visibility.public;
            res[ind].internal += data[i].contracts[j].visibility.internal;
            res[ind].external += data[i].contracts[j].visibility.external;
            res[ind].mutating += data[i].contracts[j].mutating;
            res[ind].fallback += data[i].contracts[j].fallback;
            res[ind].payable += data[i].contracts[j].payable;
            res[ind].receiveEther += data[i].contracts[j].receiveEther;
        }
        for(var j in data[i].library){
            res[ind].privateL += data[i].library[j].visibility.private;
            res[ind].publicL += data[i].library[j].visibility.public;
            res[ind].internalL += data[i].library[j].visibility.internal;
            res[ind].externalL += data[i].library[j].visibility.external;
            res[ind].mutatingL += data[i].library[j].mutating;
            res[ind].fallbackL += data[i].library[j].fallback;
            res[ind].payableL += data[i].library[j].payable;
            res[ind].receiveEtherL += data[i].library[j].receiveEther;
            res[ind].private += data[i].library[j].visibility.private;
            res[ind].public += data[i].library[j].visibility.public;
            res[ind].internal += data[i].library[j].visibility.internal;
            res[ind].external += data[i].library[j].visibility.external;
            res[ind].mutating += data[i].library[j].mutating;
            res[ind].fallback += data[i].library[j].fallback;
            res[ind].payable += data[i].library[j].payable;
            res[ind].receiveEther += data[i].library[j].receiveEther;
        }
        for(var j in data[i].interface){ // sto considerando anche i metodi delle interfacce nel calcolo dei vari elementi totali
            res[ind].privateI += data[i].interface[j].visibility.private;
            res[ind].publicI += data[i].interface[j].visibility.public;
            res[ind].internalI += data[i].interface[j].visibility.internal;
            res[ind].externalI += data[i].interface[j].visibility.external;
            res[ind].mutatingI += data[i].interface[j].mutating;
            res[ind].fallbackI += data[i].interface[j].fallback;
            res[ind].payableI += data[i].interface[j].payable;
            res[ind].receiveEtherI += data[i].interface[j].receiveEther;
            res[ind].private += data[i].interface[j].visibility.private; // forse si può commentare questa parte per evitare che i metodi delle interfacce influiscano sul totale
            res[ind].public += data[i].interface[j].visibility.public;
            res[ind].internal += data[i].interface[j].visibility.internal;
            res[ind].external += data[i].interface[j].visibility.external;
            res[ind].mutating += data[i].interface[j].mutating;
            res[ind].fallback += data[i].interface[j].fallback;
            res[ind].payable += data[i].interface[j].payable;
            res[ind].receiveEther += data[i].interface[j].receiveEther;
        }
        resM[ind].numFunc = res[ind].external + res[ind].internal + res[ind].public + res[ind].private;
        ind++;
    }
    return {normal: res, matrix: resM};
}

function ScatterplotMatrix(data, {
    columns = ['length', 'gasPrice', 'size', 'numFunc', 'numCIL'], // array of column names, or accessor functions
    x = columns, // array of x-accessors
    y = columns, // array of y-accessors
    z = () => 1, // given d in data, returns the (categorical) z-value
    padding = 20, // separation between adjacent cells, in pixels
    marginTop = 10, // top margin, in pixels
    marginRight = 20, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 928, // outer width, in pixels
    height = width, // outer height, in pixels
    xType = d3.scaleLinear, // the x-scale type
    yType = d3.scaleLinear, // the y-scale type
    zDomain, // array of z-values
    fillOpacity = 0.7, // opacity of the dots
    colors = d3.schemeCategory10, // array of colors for z
  } = {}) {
    // Compute values (and promote column names to accessors).
    const X = d3.map(x, x => d3.map(data, typeof x === "function" ? x : d => d[x]));
    const Y = d3.map(y, y => d3.map(data, typeof y === "function" ? y : d => d[y]));
    const Z = d3.map(data, z);
  
    // Compute default z-domain, and unique the z-domain.
    if (zDomain === undefined) zDomain = Z; // in teoria non dovremmo avere bisogno di questo
    zDomain = new d3.InternSet(zDomain);
  
    // Omit any data not present in the z-domain.
    const I = d3.range(Z.length).filter(i => zDomain.has(Z[i]));
  
    // Compute the inner dimensions of the cells.
    const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
    const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length;
  
    // Construct scales and axes.
    const xScales = X.map(X => xType(d3.extent(X), [0, cellWidth]));
    const yScales = Y.map(Y => yType(d3.extent(Y), [cellHeight, 0]));
    const zScale = d3.scaleOrdinal(zDomain, colors); // a noi non serve avere colori diversi ma per ora lasciamo cosi
    const xAxis = d3.axisBottom().ticks(cellWidth / 50);
    const yAxis = d3.axisLeft().ticks(cellHeight / 35);
  
    const svg = d3.create("svg")
        .attr("width", 750)
        .attr("height", 700)
        .attr("viewBox", [-marginLeft, -marginTop, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("id", "scatterPlotMatrix");
  
    svg.append("g")
      .selectAll("g")
      .attr("font-size", 20)
      .data(yScales)
      .join("g")
        .attr("transform", (d, i) => `translate(0,${i * (cellHeight + padding)})`)
        .each(function(yScale) { return d3.select(this).call(yAxis.scale(yScale)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1));
  
    svg.append("g")
      .selectAll("g")
      .data(xScales)
      .join("g")
        .attr("transform", (d, i) => `translate(${i * (cellWidth + padding)},${height - marginBottom - marginTop})`)
        .each(function(xScale) { return d3.select(this).call(xAxis.scale(xScale)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height + marginTop + marginBottom)
            .attr("stroke-opacity", 0.1))

    const tooltip = d3.select("#grafici")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  const showTooltip = function(event,d) {
    console.log(d);
    console.log(document.getElementById('filemultiple').files[d]);
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html("Smart Contract: " /* d.contractName */+ document.getElementById('filemultiple').files[d].name)
      .style("left", (event.x) + "px")
      .style("top", (event.y) + "px")
  }
  const moveTooltip = function(event, d) {
    tooltip
      .style("left", (event.x) + "px")
      .style("top", (event.y) + "px")
  }
  const hideTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }
  
    const cell = svg.append("g")
      .selectAll("g")
      .data(d3.cross(d3.range(X.length), d3.range(Y.length)))
      .join("g")
        .attr("fill-opacity", fillOpacity)
        .attr("transform", ([i, j]) => `translate(${i * (cellWidth + padding)},${j * (cellHeight + padding)})`);
  
    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("width", cellWidth)
        .attr("height", cellHeight);
  
    cell.each(function([x, y]) {
      d3.select(this).selectAll("circle")
        .data(I.filter(i => !isNaN(X[x][i]) && !isNaN(Y[y][i])))
        .join("circle")
          .attr("r", 3.5)
          .attr("cx", i => xScales[x](X[x][i]))
          .attr("cy", i => yScales[y](Y[y][i]))
          .attr("fill", /*"green"*/i => zScale(Z[i]))
          //AGGIUNGERE ROBA QUA PER IL TOOLTIP MOUSEOVER
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip );
    });
  
    // TODO Support labeling for asymmetric sploms?
    if (x === y) svg.append("g")
        .attr("font-size", 10) //10
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
      .selectAll("text")
      .data(x)
      .join("text")
        .attr("transform", (d, i) => `translate(${i * (cellWidth + padding)},${i * (cellHeight + padding)})`)
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("dy", ".71em")//71
        .text(d => d);
  
    return d3.select("#grafici").append(()=>svg.node());
  }