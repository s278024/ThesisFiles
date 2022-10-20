const express = require('express');
const surya = require('surya');
const multer = require('multer');
const solc = require('solc');
const upload = multer({ dest: 'uploads/' })
var fs = require('fs');
const path = require('path');
const app = express();
const contractDao = require('./contract_dao');
const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/3a9731b941c540f6b78e96669860719c');

var contract = '';

app.use(express.json());
app.use(express.static('public'));
/*app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); */

app.post('/upload', /*upload.single('file') */ upload.any(), (req, res, next) =>{ //per allineare il testo devo togliere \r, da fare ancora
  let totVett = [];
  let nuovovett = [];  
  let skip = 0;
  let skippv = 0;
  let skippva = 0;
  let skipc = 0;
  for(var p = 0; p < req.files.length; p++){

  
  contract = req.files[p].path;
    content = fs.readFileSync(req.files[p].path).toString('utf-8');
    if(content.includes("\r\r")){
      var vettore = content.split("\r\r\n");
    } else if(content.includes("\r")){
      var vettore = content.split("\r\n");
    } else {
      var vettore = content.split("\n");
    }
    for(var i = 0; i < vettore.length; i++){
      if(vettore[i].includes("}") && vettore[i].includes("{") && vettore[i].indexOf("{") > vettore[i].indexOf("}") && !vettore[i].split("}")[1].includes("else")){
        //devo portare a capo quello che non è stato portato a capo come si dovrebbe dopo ogni chiusa graffa
        nuovovett.push("}");
        nuovovett.push(vettore[i].split("}")[1]);
        skip = 1;
      } else if(vettore[i].includes("}") && vettore[i].split("}")[1].trim().length > 0 && !vettore[i].includes("{")){
        //devo portare a capo quello che non è stato portato a capo come si dovrebbe dopo ogni chiusa graffa
        nuovovett.push("}");
        nuovovett.push(vettore[i].split("}")[1]);
        skip = 1;
      }
      else if(vettore[i].includes("/**")){ // evitiamo di fare considerazioni sui commenti balzando quindi oltre
        for(var j = i; !vettore[j].includes("*/"); j++){
          if(vettore[j].trim() != ""){
            nuovovett.push(vettore[j]);
          } 
        }
        if(vettore[j].trim() != ""){
          nuovovett.push(vettore[j]);
        }
        skipc = 1;
      }else if(!vettore[i].includes("}") && !vettore[i].includes("{") && !vettore[i].includes(";") && vettore[i].trim().length > 0 && !vettore[i].includes("//")){
        // devo riportare sulla riga ciò che è stato spezzato... o comunque scritto non in maniera corretta per una buona programmazione
        var pool = '';
        if(vettore[i-1].includes("assembly")){ // se ho un inline assembly
          var open = 0;
          skippva = 1;
          for(var j = i; j < vettore.length; j++){
            if(vettore[j].includes("{")){
              open++;
            }
            if(vettore[j].includes("}") && open == 0){ // sto uscendo dall'inline assembly
              nuovovett.push(vettore[j]);
              break;
            } else if(vettore[j].includes("}") && open > 0){
              open--;
            }
            if(vettore[j].trim() != ""){
              nuovovett.push(vettore[j]);
            }
          }
        } else {
        pool += vettore[i];
        var j = i+1;
        while(!vettore[j].includes(";") && !vettore[j].includes("{")){
          pool += vettore[j].trim()+" ";
          j++;
        }
        pool += vettore[j];
        nuovovett.push(pool);
        skippv = 1;
        }
      }
      if(skip == 0 && skippv == 0 && skippva == 0 && skipc == 0){
        if(vettore[i].trim() != ""){
          nuovovett.push(vettore[i]);
        }
      } else if(skip == 1){
        skip = 0;
      } else if(skippv == 1 || skippva == 1 || skipc == 1){
        skippv = 0; skippva = 0; skipc = 0;
        i = j;
      }
    }
    totVett.push({surya: surya.description(fs.readFileSync(req.files[p].path).toString('utf-8')), contract: nuovovett, fileName: req.files[p].originalname.split(".")[0]});
    if(req.files.length == 1){
      break;
    } else {
      nuovovett = [];
    }
  }
  if(req.files.length == 1){
    res.json(nuovovett);
  } else {
    res.json(totVett);
  }
    
})

app.get('/visualization', (req, res) =>{
    content = fs.readFileSync(contract).toString('utf-8');
    var wrapper = surya.description(content);
    res.json(wrapper);
})

app.get('/', (req, res) =>{
    //res.sendFile('index.html', {root: __dirname + "/public"}); 
    res.sendFile("index.html");
})

app.post('/abi', upload.any(), (req, res) =>{ //QUESTA API MI SERVE PER GENERARE L'ABI DI OGNI CONTRATTO, TROVARE IL GAS, TUTTE LE ALTRE INFORMAZIONI NECESSARIE PER I GRAFICI E RIMANDARE TUTTO AL CLIENT
    //console.log(req.files); //qua dentro ho molti file da analizzare con solc ---> ABI ---> gas price (web3.js)
    var source = fs.readFileSync(req.files[0].path).toString('utf-8');
    var wrapp = [];
    var info = {
      name: '',
      length: 0,
      size: 0,
      contracts: [], // qui farò dei push di smart per ogni contratto che incontro
      library: [], // array di smart per ogni library
      interface: [], // array di smart per ogni interface
      gasPrice: 0, // ho bisogno di trovare prima abi
      abi: 'nulla', // non riesco a trovare l'abi ---> possibile soluzione: farla inserire direttamente all'utente
    }

    var smart = {
      name: '',
      methodsName: [],
      visibility: {private: 0, public: 0, internal: 0, external: 0},
      payable: 0,
      mutating: 0,
      fallback: 0,
      receiveEther: 0,
    }

    /*var input = {
        language: "Solidity",
        sources: { "test.sol" : { content: source } },
        settings: {
          outputSelection: {
            "*": {
              "*": ["*"]
            }
          }
        }
      };
    
    var output = JSON.parse(solc.compile(JSON.stringify(input)));
    console.log(output);
    for(var contractName in output.contracts["test.sol"]){
        console.log(output.contracts["test.sol"][contractName].abi);
    } */

    // Non funziona. Mi dice che la versione del compilatore che richiede il contratto non va bene
    // Non sarebbe un problema se esistesse un modo per modificare la versione del compilatore direttamente da js
    // in base a quella richiesta dal contratto, ma a quanto sembra questo non è possibile... o per lo meno non ho trovato informazioni al riguardo
    // c'era un sito che spiegava bene cosa si potesse mettere nell'input e pensavo che potessi modificare la versione da li e invece no.
    // da linea di comando è banale... il problema è farlo da js
    // Ho visto anche che esistono truffle e hardhat per quello che devo fare,
    // ho guardato in giro, ma non ho trovato la documentazione di cui avevo bisogno che mi spiegasse come usare sti cosi in js.
    
    //Cose da trovare e restituire al client:
    //- Lunghezza contratti;
    //- numero di lib, contract, interface;
    //- numero di funzioni (non so se dividerli per lib, contract, interface)
    //- numero di chiamate totali a funzioni
    //- tipo di pragma
    //- gas price per transazione su un certo contratto. Gas price per mettere il contratto su blockchain
    /*let ris = [];
    let arrInput = [];
    for(var i = 0; i < req.files.length; i++){ // per ogni file
      if(req.body["ABI"+i] != ''){
      var myContract = new web3.eth.Contract(JSON.parse(req.body["ABI"+i]));
      myContract.options.address = "0x6ee9957aef5f4073c6af71441ec7962527c37671";
      for(var j = 0; j < JSON.parse(req.body["ABI"+i]).length; j++){ // per ogni funzione "public" le internal non ci sono nell'abi
        if(JSON.parse(req.body["ABI"+i])[j].type == "function"){
          for(var k in JSON.parse(req.body["ABI"+i])[j].inputs){ // devo creare gli input da mettere nella estimate gas
              if(JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint8" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint16" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint32" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint64" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint128" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "uint256" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int8" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int16" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int32" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int64" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int128" || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "int256"){
                arrInput.push(10);
              } else if(JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "address"){
                arrInput.push("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4");
              } else if(JSON.parse(req.body["ABI"+i])[j].inputs[k].type.includes(bytes) || JSON.parse(req.body["ABI"+i])[j].inputs[k].type == "string"){
                arrInput.push("Questo è semplicemente testo casuale che verrà salvato");
              }
              // non sto gestendo gli array
          }
          console.log(arrInput);
          var value = calculateGas(arrInput, JSON.parse(req.body["ABI"+i])[j].name, ris, myContract).then((result) =>{
              console.log(result);
          });
          console.log(value);
          arrInput = [];
        }
      }
    }
    }
    console.log(ris); */
    
    for(var i in req.files){
      info.abi = req.body["ABI"+i];
      info.name = req.files[i].originalname;
      info.size = req.files[i].size;
      var source = fs.readFileSync(req.files[i].path).toString('utf-8').split("\n");
      info.length = source.length;
      var sur = surya.description(fs.readFileSync(req.files[i].path).toString('utf-8'));
      for(var j in sur.contracts){
        smart.name = sur.contracts[j].name;
        for(var k in sur.contracts[j].functions){
          smart.methodsName.push(sur.contracts[j].functions[k].name);
          if(sur.contracts[j].functions[k].visibility == "public"){smart.visibility.public++;}
          else if(sur.contracts[j].functions[k].visibility == "internal"){smart.visibility.internal++;}
          else if(sur.contracts[j].functions[k].visibility == "external"){smart.visibility.external++;}
          else if(sur.contracts[j].functions[k].visibility == "private"){smart.visibility.private++;}
          if(sur.contracts[j].functions[k].payable == true){smart.payable++;}
          if(sur.contracts[j].functions[k].mutating == true){smart.mutating++;}
          if(sur.contracts[j].functions[k].isReceiveEther == true){smart.receiveEther++;}
          if(sur.contracts[j].functions[k].isFallback == true){smart.fallback++;}
        }
        if(sur.contracts[j].specs == "interface"){
          info.interface.push({name: smart.name, methodsName: smart.methodsName, payable: smart.payable, mutating: smart.mutating, fallback: smart.fallback, receiveEther: smart.receiveEther, visibility: {internal: smart.visibility.internal, external: smart.visibility.external, public: smart.visibility.public, private: smart.visibility.private}});
        } else if(sur.contracts[j].specs == "library"){
          info.library.push({name: smart.name, methodsName: smart.methodsName, payable: smart.payable, mutating: smart.mutating, fallback: smart.fallback, receiveEther: smart.receiveEther, visibility: {internal: smart.visibility.internal, external: smart.visibility.external, public: smart.visibility.public, private: smart.visibility.private}});
        } else {
          info.contracts.push({name: smart.name, methodsName: smart.methodsName, payable: smart.payable, mutating: smart.mutating, fallback: smart.fallback, receiveEther: smart.receiveEther, visibility: {internal: smart.visibility.internal, external: smart.visibility.external, public: smart.visibility.public, private: smart.visibility.private}});
        }
        smart.name = '';
        smart.methodsName = [];
        smart.visibility.external = 0;
        smart.visibility.internal = 0;
        smart.visibility.private = 0;
        smart.visibility.public = 0;
        smart.payable = 0;
        smart.mutating = 0;
        smart.fallback = 0;
        smart.receiveEther = 0;
      }
      wrapp.push({name: info.name, length: info.length, size: info.size, contracts: info.contracts, library: info.library, interface: info.interface, gasPrice: info.gasPrice, abi: info.abi});
      info.name = '';
      info.length = 0;
      info.size = 0;
      info.contracts = [];
      info.library = [];
      info.interface = [];
    }
    return res.json(wrapp);
})

app.post('/queryRequest', (req, res) =>{
    // qui metterò la richiesta al DB per vedere se li sopra ho le informazioni di cui ho bisogno
      contractDao.getWordInfo(req.body).then((resp) =>{
        res.json(resp);
      })
      .catch((err) => {res.status(500).json({errors: [{'param': 'Server', 'msg': err}]})}) 
})

app.post('/writingDB', (req, res) =>{
      for(var j in req.body.writeOnDB){ // devo verificare che la parola non sià già nel DB
            contractDao.writeInfoInDB(req.body.writeOnDB[j], req.body.vettConcept[j])
            .catch((err) =>{
              res.status(500).json({errors: [{'param': 'Server', 'msg': err}],})
            });
          }
    res.json(req.body);
})

app.post('/writeGas', (req, res) =>{ // in req mi arriva il JSON di una singola funzione e dell'intero contratto
  let myContract = new web3.eth.Contract(JSON.parse(req.body.ABI));
  myContract.options.address = "0x9907a0cf64ec9fbf6ed8fd4971090de88222a9ac";
        web3.eth.getGasPrice().then((gas) => {
          //console.log(arrInput);
          console.log(req.body.functionName);
          console.log(...req.body.input);
          myContract.methods[req.body.functionName](...req.body.input).estimateGas(({gas: 500000}, function(err, estimateGas){
            if(err){
              console.log(err);
            }
            //var gasInCoin = (gas * estimateGas)/(1000000000*1000000000);
            //console.log(gasInCoin);
            contractDao.writeGasOnDb(estimateGas, req.body.functionName, req.body.fileName).then((result) =>{
              var gasInCoin = (gas * estimateGas)/(1000000000*1000000000);
              res.json({functionName: req.body.functionName, fileName: req.body.fileName, gas: gasInCoin});
            })
            .catch((err) =>{
              res.status(500).json({errors: [{'param': 'Server', 'msg': err}],})
            });
          }));
        });
     
})

app.post('/checkGas', (req, res) =>{
    contractDao.getGasFunction(req.body).then((result) =>{
      web3.eth.getGasPrice().then((gas) =>{
        for(var i = 0; i < result.result.length; i++){
        result.result[i].gas = (result.result[i].gas * gas)/(1000000000*1000000000);
      }
      res.json(result);
      })
      console.log(result);
    })
    .catch((err) => {res.status(500).json({errors: [{'param': 'Server', 'msg': err}]})})
})

/*app.post('/conceptNetCSV', (req, res) =>{
  var content = fs.readFileSync("../db/assertions.csv");
  console.log(content);
    Papa.parse(fs.readFileSync("./db/assertions.csv"),{
      complete: function(result){
        console.log(result);
        res.json(result);
      }
    })
})*/
/*
*/

app.listen(3000);