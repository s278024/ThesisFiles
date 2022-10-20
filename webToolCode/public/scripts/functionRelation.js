window.functionRelation = ()=>{

        //qua dovro analizzare le informazioni ricevute dal server e creare gli oggetti da passare alla funzione
        //createGraphic (matrix, names,...). In res avrò l'oggetto wrapper.
    if(document.getElementById("chordDiagram") == null){
        const names = createNames();
        const matrix = createMatrix(names);
        chordDependencyDiagram(names, matrix);
        findData();
    } else if(document.getElementById("chordDiagram").style.display == "none" ){
        document.getElementById("chordDiagram").style.display = "inline";
        document.getElementById("sunBurst").style.display = "inline";
    } else {
        document.getElementById("chordDiagram").style.display = "none";
        document.getElementById("sunBurst").style.display = "none";
    }
    
}

function createMatrix(names){
    let names_min = changeNames(names); //ho solo i nomi delle funzioni senza nessun parametro
    let parent = "";
    let comment = 0;
    var matrix = new Array();
    for(var i in names){ //costruisco la matrix come matrice con tutti zeri ---> scritto male ma non ho trovato altri modi
        matrix[i] = new Array(names.length);
    }
    for(var i in names){
        for(var j in names){
            matrix[i][j] = 0;
        }
    }
    var index = 0;
    var elem = document.getElementById(index.toString());
    while(elem != null){
        if(elem.innerHTML.includes("interface")){
           parent = "interface";
        }
        if(elem.innerHTML.includes("abstract")){
            parent = "abstract";
        }
        if(elem.innerHTML.includes("/**")){
            comment = 1;
        }
        if((parent != "interface" && parent != "abstract" && comment == 0)&& elem.innerHTML.includes("function") && !elem.innerHTML.includes("//")){
            //in teoria dovrebbe essere presente questa funzione in names -----> meglio fare un controllo?
            // Per ora proseguo senza preoccuparmene
            var num_func = [];
            var finekeyword = elem.innerHTML.replace("function", "");
            var tonda = finekeyword.indexOf(")");
            var funzione = ''+finekeyword.substring(0, parseInt(tonda+1)).trim();
            var funzioneChiamante = names.findIndex(elem => elem == funzione); //indice funzione chiamante
            var index_matrix = -1;
            var iterfun = index+1;
            var funAnalization = document.getElementById((index+1).toString());
            var open = 0;
            while(!funAnalization.innerHTML.includes("}") || open != 0){
                if(funAnalization.innerHTML.includes("}") && funAnalization.innerHTML.includes("{")){
                    //ho un else quindi la open non si modifica
                } else if(funAnalization.innerHTML.includes("{")){
                    open++;
                } else if(funAnalization.innerHTML.includes("}")){
                    open--;
                } 
                var funVett = funAnalization.innerHTML.split("(");
                if(funVett.length > 1){ //ho più chiamate di funzioni
                    for(var el in funVett){
                        if(funVett.length != el+1){
                            var clean_string = pulisciStringa(funVett[el]);
                            for(var fun in names_min){ //cerco quale funzione è stata chiamata
                                //devo cercare di isolare solo la funzione che viene utilizzata e buttare il resto
                                //considero il fatto che si trovi prima della tonda. quindi al fondo della stringa
                                if(clean_string == names_min[fun]){
                                    index_matrix = fun;
                                    num_func.push(fun);
                                    
                                }
                            }
                            //posso avere num_func.length > 1 se ho due funzioni che si chiamano uguali
                            if(num_func.length > 1){
                                var clo_tond = funVett[parseInt(el)+1].toString().split(")"); // num di parametri usati per richiamare la funzione
                                if(clo_tond != null){
                                    var numero_param = clo_tond[0].split(",").length;
                                }
                                for(var i in num_func){
                                    if(names[num_func[i]].split(",").length == numero_param){
                                        index_matrix = parseInt(num_func[i]);
                                        break;
                                    }
                                }
                            }
                            num_func = [];
                                //qui avrò un vettore ricorrenze con gli indici riferiti a names_min che si trovano nella riga
                            if(index_matrix != -1){
                                matrix[parseInt(funzioneChiamante)][index_matrix]++;
                            }
                            index_matrix = -1;
                        }
                    }
                }
                iterfun++;
                index = iterfun;
                funAnalization = document.getElementById(iterfun.toString());
            }
        }
        if(elem.innerHTML.trim() == "}"){parent=''}
        if(elem.innerHTML.includes("*/")){comment = 0;}

        index++;
        elem = document.getElementById(index.toString());
    }
    return matrix;
}

function pulisciStringa(stringa){
    var pulita = '';
    var pulita_contrario = '';
    for(var i = stringa.length-1; i >= 0; i--){
        if(stringa.charAt(i) == ' ' || stringa.charAt(i) == '[' || stringa.charAt(i) == '.' || stringa.charAt(i) == ','){
            break;
        } else {
            pulita_contrario += stringa.charAt(i);
        }
    }
    for(var i = pulita_contrario.length-1; i >= 0; i--){
        pulita += pulita_contrario.charAt(i);
    }
    return pulita.trim();
}

function changeNames(names){
    var newnames = [];
    for(var i in names){
       var elem = names[i].split("(");
       newnames.push(elem[0]);
    }
    return newnames;
}

function createNames(){
    var names = [];
    var index = 0;
    var elem = document.getElementById(index.toString());
        while(elem != null){
            if(elem.innerHTML.includes("function") && !elem.innerHTML.includes("//") && elem.innerHTML.trim()[0] != "*"){ //sono in una riga dove ci sono funzioni
                var finekeyword = elem.innerHTML.replace("function", "");
                var tonda = finekeyword.indexOf(")");
                var funzione = ''+finekeyword.substring(0, parseInt(tonda+1)).trim();
                if(!names.find(i => i==funzione)){
                    names.push(funzione);
                }
            }
            index++;
            elem = document.getElementById(index.toString());
        }
    return names;
}
    
function chordDependencyDiagram(names, matrix){
        var color = d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length));
        var graphics = d3.select("#grafici");
        const svg = d3.create("svg")
            .attr("viewBox", [-width/1.4 , -height/1.48 , width*1.5, height*1.5])
            .attr("id", "chordDiagram");
      
        const chords = chord(matrix);
      
        const group = svg.append("g")
            .attr("font-size",12)
            .attr("font-family", "sans-serif")
          .selectAll("g")
          .data(chords.groups)
          .join("g");

          function fade(opacity) {
            return function(d, i) {
                svg.selectAll(".chord path")
                .filter(function(d) {
                    console.log(i)
                    console.log(d)
                  return d.source.index != i.index && d.target.index != i.index;
                })
                .transition()
                .style("opacity", opacity);
          }
        }
      
        group.append("path")
            .attr("fill", d => color(names[d.index]))
            .attr("d", arc)
            .on("mouseover", fade(.05))         
            .on("mouseout", fade(1))
      
        group.append("text")
            .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
            .attr("dy", "0.35em")
            .attr("transform", d => `
              rotate(${(d.angle * 180 / Math.PI - 90)})
              translate(${outerRadius + 5})
              ${d.angle > Math.PI ? "rotate(180)" : ""}`)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => names[d.index]);
      
        group.append("title")
            .text(d => `${names[d.index]}
      ${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
      ${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);
      
        svg.append("g")
            .attr("fill-opacity", 0.75)
            .attr("class", "chord")
          .selectAll("path")
          .data(chords)
          .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("fill", d => color(names[d.target.index]))
            .attr("d", ribbon)
            .append("title")
            .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`);

        d3.select("#grafici").append(()=>svg.node());
}

function sunBurstZoomable(data){
    const root = partition(data);
    var colorS = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
  root.each(d => d.current = d);

  const svg = d3.create("svg")
      .attr("viewBox", [-widthS/3.75, 0, widthS*1.5, widthS*1.5])
      .attr("id", "sunBurst")
      .style("font", "10px sans-serif");

  const g = svg.append("g")
      .attr("transform", `translate(${widthS / 2},${widthS / 2})`);

  const path = g.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return colorS(d.data.name); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

      .attr("d", d => arcS(d.current));

  path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

  path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

  const parent = g.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = g.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

        .attrTween("d", d => () => arcS(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }
  
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  d3.select("#grafici").append(()=>svg.node());
}

var nrighe = 0;
var callFromFun = 0;
var numgraffe = 0;

function findData(){
    fetch('http://localhost:3000/visualization', {
    method: 'GET'
    })
    .then(response => response.json())
    .then(res =>{
        var sunBurst = {
            name: "flare",
            children: []
        }
        let receive= [];
        for(var ind in res.contracts){
            if(res.contracts[ind].specs == ''){
               sunBurst.children.push({name: res.contracts[ind].name, children: [], type: 'contract'}); 
            } else {
               sunBurst.children.push({name: res.contracts[ind].name, children: [], type: res.contracts[ind].specs}); 
            }
            for(var index in res.contracts[ind].functions){
                if(res.contracts[ind].specs == 'interface' || res.contracts[ind].specs == 'abstract'){
                    sunBurst.children[ind].children.push({name: res.contracts[ind].functions[index].name, value: 1});
                } else {
                    if(res.contracts[ind].functions[index].name == "receive ether"){
                        sunBurst.children[ind].children.push({name: res.contracts[ind].functions[index].name, value: 1});
                        receive.push({indC: ind, indF: index});
                    } else {
                        sunBurst.children[ind].children.push({name: res.contracts[ind].functions[index].name});
                    }
                }
            }
            var delete_elem = [];
            for(var i = 0; i < sunBurst.children[ind].children.length; i++){
                for(var j = i+1; j < sunBurst.children[ind].children.length; j++){
                    if(sunBurst.children[ind].children[i].name == sunBurst.children[ind].children[j].name){
                        delete_elem.push(j);
                    }
                }
            }
            for(var i = delete_elem.length-1; i >= 0 ; i--){
                sunBurst.children[ind].children.splice(delete_elem[i], 1);
            }
            delete_elem = [];
        }
        console.log(sunBurst);
        //var name = '';
        let graffOpen = 0;
        let graffClose = 0;
        var indiceSun = -1;
        var indiceFun = -1;
        var parent = '';
        var index = 0;
        var elem = document.getElementById(index.toString());
        while(elem != null){
            if(elem.innerHTML.trim().split("//").length > 1){
                elem.innerHTML = elem.innerHTML.trim().split("//")[0];
            }
            if(elem.innerHTML.includes("//")){
                if(elem.innerHTML.split("//")[0].trim().length > 0){
                    elem = elem.innerHTML.split("//")[0];
                } else {
                    while(elem.innerHTML.includes("//")){
                        index++;
                        elem = document.getElementById(index.toString());
                    }
                    continue;
                }
            } else if(elem.innerHTML.includes("/**")){ // per semplicità considero che l'inizio del commento inizi a una riga senza nulla di rilevante. riga con solo commento
                while(!elem.innerHTML.includes("*/")){
                    index++;
                    elem = document.getElementById(index.toString());
                }
                index++;
                elem = document.getElementById(index.toString());
            }
            if(elem.innerHTML.includes('interface') || elem.innerHTML.includes('abstract')){
                parent = 'interface';
                var graffe = 0;
                index++;
                elem = document.getElementById(index.toString());
                while(elem.innerHTML.trim() != '}' || graffe != 0){
                    if(elem.innerHTML.includes('{') && !elem.innerHTML.includes('}')){
                        graffe++;
                    }
                    if(elem.innerHTML.trim() == '}'){
                        graffe--;
                    }
                    index++;
                    elem = document.getElementById(index.toString());
                }
                index++;
                elem = document.getElementById(index.toString());
                continue;
            } else if(elem.innerHTML.includes('library')){
                parent = 'library';
                graffOpen++;
                for(var ind in sunBurst.children){
                    if(sunBurst.children[ind].type == 'library' && elem.innerHTML.trim().split(" ")[1] == sunBurst.children[ind].name){
                        indiceSun = ind;
                        break;
                    }
                }
            } else if(elem.innerHTML.trim().split(" ")[0] == "contract"){
                parent = 'contract';
                graffOpen++;
                for(var ind in sunBurst.children){
                    console.log(elem.innerHTML.split(" ")[1]);
                    if(sunBurst.children[ind].type == 'contract' && elem.innerHTML.trim().split(" ")[1] == sunBurst.children[ind].name){
                        indiceSun = ind;
                        break;
                    }
                }
            }
            if(parent != 'interface' && parent != 'abstract' && (elem.innerHTML.includes("function") || elem.innerHTML.includes("constructor"))){
                console.log(elem.innerHTML + index);
                graffOpen++;
                if(elem.innerHTML.includes("function")){
                    for(var ind in sunBurst.children[indiceSun].children){
                        if(elem.innerHTML.trim().split(" ")[1].split('(')[0].trim() ==  sunBurst.children[indiceSun].children[ind].name /*elem.innerHTML.includes(sunBurst.children[indi].children[ind].name)*/){ //ho bisogno non di un include ma bensì di un confronto === senza possibili fraintendimenti
                            /*if(sunBurst.children[indi].children[ind].name.length > name.length){
                               indiceFun = ind;
                               name = sunBurst.children[indi].children[ind].name;
                            } */
                            indiceFun = ind;
                            break;
                        }
                    }
                
                } else if(elem.innerHTML.includes("constructor") && elem.innerHTML.split("(")[0].trim() == "constructor"){
                    for(var ind in sunBurst.children[indiceSun].children){
                        if(sunBurst.children[indiceSun].children[ind].name == 'constructor'){
                            indiceFun = ind;
                            break;
                        }
                    }
                }
            }
            //name = '';

            if(indiceFun != -1){ //significa che sono nel corpo di una funzione
                var tot_result = [];
                if(elem.innerHTML.includes('{') && elem.innerHTML.includes('}')){ // sono in una riga con else
                    index++; // semplicemente la skippo. in una riga di else non c'è mai, per forza, nulla di rilevante
                    elem = document.getElementById(index.toString());
                    continue;
                }
                if(elem.innerHTML.includes('{') && (!elem.innerHTML.includes("function") && !elem.innerHTML.includes("constructor"))){ // devo controllare che non ci siano aperture di graffa per degli if/else (cicli non dovrebbero essere usati in smart contract perche se no gas price in aumento), ma non devo considerare le graffe che vengono aperte alla dichiarazione della funzione
                    numgraffe++;
                }
                if(elem.innerHTML.includes('}') && (!elem.innerHTML.includes("function") && !elem.innerHTML.includes("constructor"))){
                    if(numgraffe > 0){ // se è zero vuol dire che sto leggendo l'ultima graffa della funzione
                       numgraffe--;
                       nrighe++;
                       index++;
                       elem = document.getElementById(index.toString());
                       continue; 
                    }
                }                
                var indici = {
                   name: '',
                   indC: -1,
                   indF: -1
                };
               var callFun = elem.innerHTML.split("(");
               if(callFun.length > 1 && (!elem.innerHTML.includes("function") && !elem.innerHTML.includes("constructor"))){ //c'è almeno una chiamata a funzione e non sono nella prima riga di dichiarazione della funzione/costruttore   
                    for(var inds in callFun){
                        var stringa_clean = pulisciStringa(callFun[inds]);
                        for(var indC in sunBurst.children){
                            for(var indF in sunBurst.children[indC].children){
                                if(sunBurst.children[indC].children[indF].name == stringa_clean && inds != callFun.length-1){
                                    indici.name = sunBurst.children[indC].children[indF].name;
                                    indici.indC = indC;
                                    indici.indF = indF;
                                }
                            }
                        }
                        //devo andare a ricercare nel testo quello che fa la funzione in indici
                        //IMPORTANTE: non è detto che si trovi una funzione. Le tonde possono essere aperte anche per altro
                        // es.: require()
                        if(indici.name != ''){
                            callFromFun = 1;
                            var result = recursiveFun(sunBurst, indici);
                            tot_result.push(result);
                        }     
                        indici.name = '';    
                    }
                    if(tot_result.length > 0){
                        //però potrei già avere dei valori in questo ramo di children e non voglio sovrascrivere roba
                        if(sunBurst.children[indiceSun].children[indiceFun].children != null){
                            for(var m of tot_result){
                                if(!isInside(sunBurst.children[indiceSun].children[indiceFun].children, m.name)){ // mi dice che una certa funzione è già stata richiamat e quindi non devo inserirla nuovamente
                                    sunBurst.children[indiceSun].children[indiceFun].children.push(m);
                                }
                            }
                        } else {
                            sunBurst.children[indiceSun].children[indiceFun] = {name: sunBurst.children[indiceSun].children[indiceFun].name, children: tot_result}
                        }
                    }
                    tot_result = [];
               } else { //nulla di rilevante ma aumento il value di questa funzione di uno (il value correisponde al suo numero di righe)
                nrighe++;
               }
            }
            if((elem.innerHTML.includes("struct") || elem.innerHTML.includes("assembly") || elem.innerHTML.includes("modifier")) && !elem.innerHTML.includes("constructor")){ // siamo in presenza di una struct ------> andiamo al fondo della graffa e ignoriamo completamente la cosa
                var grafff = 0;
                index++;
                elem = document.getElementById((index).toString());
                while(elem.innerHTML.trim() != "}" || grafff != 0){
                    if(elem.innerHTML.includes("{")){
                        grafff++;
                    }
                    if(elem.innerHTML.includes("}")){
                        grafff--;
                    }
                    index++;
                    elem = document.getElementById(index.toString());
                }
                index++;
                elem = document.getElementById(index.toString());
                continue;
            }
            if(elem.innerHTML.trim() == '}'){
                graffClose++;
            }
            // se entro qua dentro con indiceFun = -1 significa che per forza sto analizzando la fine di una receive ether. DA GESTIRE ASSOLUTAMENTE SE NON VA TUTTO IN MALORA
            if((elem.innerHTML.trim() == '}' || elem.innerHTML.includes("}")) && numgraffe == 0){ //Posso essere in fine funzione o fine contratto/libreria/interfaccia
                if(document.getElementById((index+1).toString()) != null){
                if(document.getElementById((index+1).toString()).innerHTML.trim() == '}'){ // Sono alla fine di una funzione (dell'ultima funzione di un contratto per l'esattezza)
                    if(callFromFun == 0 && indiceFun != -1 && (sunBurst.children[indiceSun].children[indiceFun].value == null && sunBurst.children[indiceSun].children[indiceFun].children == null)){
                        sunBurst.children[indiceSun].children[indiceFun] = {name: sunBurst.children[indiceSun].children[indiceFun].name, value: nrighe}; 
                    }
                    callFromFun = 0;
                    indiceFun = -1;
                    nrighe = 0;
                } else {
                    if(graffClose == graffOpen){ // Sono alla fine del contratto
                        graffClose = 0;
                        graffOpen = 0;
                        parent = '';
                        indiceSun = -1;
                    } else { // Sono alla fine di una funzione di mezzo nel contratto o un'interfaccia o un abstract
                        if(parent == 'interface' || parent == 'abstract'){
                            parent = '';
                        } else {
                            if(callFromFun == 0 && indiceFun != -1 && (sunBurst.children[indiceSun].children[indiceFun].value == null && sunBurst.children[indiceSun].children[indiceFun].children == null)){
                            sunBurst.children[indiceSun].children[indiceFun] = {name: sunBurst.children[indiceSun].children[indiceFun].name, value: nrighe};
                        }
                        indiceFun = -1;
                        callFromFun = 0;
                        nrighe = 0;
                        }  
                    }
                }
                } else { } //sono all'ultima riga e quindi alla chiusura di un contratto/libreria/interfaccia, non penso sia necessario fare nulla
            } else if(elem.innerHTML.trim() == '}' && numgraffe != 0){ //per ogni graffa aperta ce ne deve essere una che si chiude (aggiorno il conteggio)
                numgraffe--;
            }

            index++;
            elem = document.getElementById(index.toString());
        }
        //devo eliminare il campo type se no da problemi nella partition
        for(var i in sunBurst.children){
            delete sunBurst.children[i].type;
        }

        console.log(sunBurst);
        sunBurstZoomable(sunBurst);
    });
}

function isInside(sunBurst, name){
    for(var obj of sunBurst){
        if(name == obj.name){
            return true;
        }
    }
    return false;
}

function recursiveFun(sunBurst, indici){
    var obj_vett = [];
    var numrighe = 0;
    var entrato = 0;
    var indexnuovo = {
        name: '',
        indC: -1,
        indF: -1
    }
    var index = 0;
    var elem = document.getElementById(index.toString());
    while(elem != null){
        if(elem.innerHTML.includes("function") && elem.innerHTML.split("(")[0].replace("function", "").trim() == indici.name){
            while(!elem.innerHTML.includes("}")){
                index++;
                elem = document.getElementById(index.toString());
                numrighe++;
                var callFun = elem.innerHTML.split("(");
                if(callFun.length > 1){ //ho almeno una chiamata a funzione, ma in realtà non è detto perchè posso usare la tonda anche per altri motivi es.: require()
                    for(var inds in callFun){
                        var stringa_clean = pulisciStringa(callFun[inds]);
                        for(var indC in sunBurst.children){
                            for(var indF in sunBurst.children[indC].children){
                                if(sunBurst.children[indC].children[indF].name == stringa_clean && inds != callFun.length-1 && stringa_clean != indici.name){
                                    indexnuovo.name = sunBurst.children[indC].children[indF].name;
                                    indexnuovo.indC = indC;
                                    indexnuovo.indF = indF;
                                }
                            }
                        }
                        if(indexnuovo.name != ''){ //può succedere che la tonda venga aperta per require o altro e quindi non ci sia nessuna chiamata di funzione
                            var obj = recursiveFun(sunBurst, indexnuovo);
                            obj_vett.push(obj);
                            entrato = 1;  
                        }
                        indexnuovo.name = '';
                        if(inds == callFun.length -2){ // esco prima perchè l'ultimo elemento del vettore dello split non lo devo leggere
                            break;
                        }
                    }
                }
            }
            if(entrato == 0){
                return {name: indici.name, value: numrighe};
            } else {
                var child = {
                    name: indici.name,
                    children: []
                }
                for(var ind in obj_vett){
                    child.children.push(obj_vett[ind]);
                }
                return child;
            } 
        }
        index++;
        elem = document.getElementById(index.toString());
    }
}

function partition(data){
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    return d3.partition()
        .size([2 * Math.PI, root.height + 1])
      (root);
  }

var format = d3.format(",d")

var widthS = 932;

var radius = widthS/6;

var arcS = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));


var width = 954;

var height = width;

var innerRadius = Math.min(width, height) * 0.5 - 90;

var outerRadius = innerRadius + 10;

var chord = d3.chordDirected()
    .padAngle(10 / innerRadius)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)

var arc = d3.arc()
   .innerRadius(innerRadius)
   .outerRadius(outerRadius)

var ribbon = d3.ribbonArrow().radius(innerRadius - 1).padAngle(1 / innerRadius)

//devo trovare i names -----> sono la lista di tutte le funzioni del contrattio messe in un array.

//devo trovare la matrix -----> è un array in cui ogni cella corrisponde a una funzione e per ognuna 
//si ha un array con dei numeri che rappresentano i collegamenti con le altre funzioni