const db = require("../models");
const CryptoJS = require('crypto-js');
const Paiement = db.paiement;
require('dotenv').config();
const fs = require('fs');
const pino = require('pino');
const stream = fs.createWriteStream('./log.json');
const log = pino(stream);


exports.callbackResponse = (req, res) => {
    res.writeHead(200, {'Content-Type':'text/plain'});
    req.body["callbackResponseTime"] = new Date();
    log.info(req.body);
    Paiement.findOne({oid: Number(req.body["ReturnOid"])}).then(pay => {
        if (pay['amount'] == req.body["amount"]) {
                let formData = calcformData(pay,req.body);
                const sortedKeys = Object.keys(formData).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
                let hashval = "";
                for (const key of sortedKeys) {
                    if (key !== "hash" && key !== "encoding") {
                        escapedParamValue = formData[key].toString().replace("|", "\\|")
                        .replace("\\", "\\\\");
                        hashval = hashval + escapedParamValue + "|";
                    }
                }
                const storeKey = req.body.storeKey;
                hashval = hashval + storeKey;
                const calculatedHash = CryptoJS.SHA512(hashval).toString();
                const actualHash = Buffer.from(calculatedHash, 'hex').toString('base64');
                const retrievedHash = req.body["orgHash"];
                console.log("actualHash",actualHash);
                console.log("retrievedHash",retrievedHash);
                if(retrievedHash == actualHash)	{
                    if(req.body["ProcReturnCode"] == "00")	{
                        pay['paiementStatus'] = "Payée";
                        pay['updated'] = new Date();
                        Paiement.findByIdAndUpdate(pay._id, pay, {
                            useFindAndModify: false
                        })
                        .then(data => {
                            res.end('ACTION=POSTAUTH');
                        }).catch(err => {});
                        console.log("|||||||||||||||||||||Payée||||||||||||||||||||||||||||||||||||||||||||||");
                    } else {
                        console.log("|||||||||||||||||||||APPROVED||||||||||||||||||||||||||||||||||||||||||||||");
                        res.end('APPROVED');
                    }
                } else {
                        console.log("|||||||||||||||||||||Échec 2||||||||||||||||||||||||||||||||||||||||||||||");
                        echecStatut(pay,"Échec",res);
                }
        } else {
            console.log("|||||||||||||||||||Échec 1||||||||||||||||||||||||||||||||||||||||||||||");
            echecStatut(pay,"Refuser",res);
        }
    })
    .catch(err => {
        console.log("|||||||||||||||||||Échec 0||||||||||||||||||||||||||||||||||||||||||||||",err);
        res.end('FAILURE');
    });
};

exports.handleOk = (req, res) => {
    res.redirect(`${process.env.OKURLREDIRECT}/${req.body.oid}`)
};
    
exports.handleFail = (req, res) => {
    res.redirect(`${process.env.FAILURLREDIRECT}`)
};
  


function echecStatut(pay,statut,res){
    pay['paiementStatus'] = statut;
    pay['updated'] = new Date();
    Paiement.findByIdAndUpdate(pay._id, pay, {
        useFindAndModify: false
    }).then(data => {
        res.end('FAILURE');
    }).catch(err => {
        res.end('FAILURE');
    });
}

function calcformData(paiement,reqbody){
    const formData = {
        oid: paiement.oid,
        clientid: reqbody.clientid,
        storeKey: reqbody.storeKey,
        amount: reqbody.amount,
        shopUrl: reqbody.shopUrl,
        okUrl: reqbody.okUrl,
        failUrl: reqbody.failUrl,
        callbackUrl: reqbody.callbackUrl,
        TranType: reqbody.TranType,
        currency: reqbody.currency,
        encoding: reqbody.encoding,
        lang: reqbody.lang,
        AutoRedirect: reqbody.AutoRedirect,
        hashAlgorithm: "ver3",
        storetype: reqbody.storetype,
        BillToName: reqbody.BillToName,
        rnd: reqbody.orgRnd,
        email: reqbody.email,
        tel: reqbody.tel,
        desc1: reqbody.desc1,
        price1: reqbody.price1,
        qty1: reqbody.qty1,
        total1: reqbody.total1,
        id1: reqbody.id1,
        productCode1: reqbody.productCode1,
        itemNumber1: reqbody.itemNumber1,
    };

    //   _____Services ajoutés_____
    const services = paiement.services;
    let j_index = 2;
    for (let i = 0; i < services.length; i++) {
        formData[`desc${j_index}`] = services[i]["name"];
        formData[`id${j_index}`] = j_index;
        formData[`price${j_index}`] = services[i]["prix_unit"];
        formData[`qty${j_index}`] = services[i]["quantite"];
        formData[`total${j_index}`] = services[i]["sous_total"];
        formData[`productCode${j_index}`] = j_index;
        formData[`itemNumber${j_index}`] = j_index;
        j_index++;
    }
    
    // _____Services inclus_____
    const services_included = paiement.services_included;
    for (let i = 0; i < services_included.length; i++) {
        formData[`desc${j_index}`] = services_included[i]["name"];
        formData[`id${j_index}`] = j_index;
        formData[`price${j_index}`] = services_included[i]["price"];
        formData[`qty${j_index}`] = 1;
        formData[`total${j_index}`] = services_included[i]["price"];
        formData[`productCode${j_index}`] = j_index;
        formData[`itemNumber${j_index}`] = j_index;
        j_index++;
    }

    // _____Fees inclus_____
    const fees = paiement.fees;
    for (let i = 0; i < fees.length; i++) {
        formData[`desc${j_index}`] = fees[i]["desc"];
        formData[`id${j_index}`] = j_index;
        formData[`total${j_index}`] = fees[i]["value"] != null ? fees[i]["value"] : 0;
        formData[`productCode${j_index}`] = j_index;
        formData[`itemNumber${j_index}`] = j_index;
        j_index++;
    }

    console.log("formData End",formData);

    return formData;
}