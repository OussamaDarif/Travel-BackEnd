const db = require("../models");
const nodemailer = require("nodemailer");
const Reservation = db.reservation;
const Paiement = db.paiement;
const Logement = db.logement;

require('dotenv').config();

exports.addReservation = (req, res) => {
    let clientEmail = req.body.clientEmail;
    let clientName = req.body.clientName;
    let clientPhone = req.body.clientPhone;
    let nuits = req.body.nuits;
    let services_included = req.body.services_included;
    let reservation = new Reservation(req.body);
    reservation.created = new Date();
    reservation.updated = new Date();
    reservation.save((err, reserv) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        } else {
            Logement.findById({
                _id: reserv.id_logement,
              }).exec((err, logement) => {
                  if (err) {
                    res.status(500).send({ message: err });
                    return;
                  } else {
                    reserv["logement_name"] = logement.title;
                    reserv["logement_price"] = logement.price;
                    reserv["nuits"] = nuits;
                    reserv["services_included"] = services_included;
                    reserv["reduction"] = logement.reduction;
                    reserv["cleaning_fees"] = logement.cleaning_fees;
                    reserv["service_fees"] = logement.service_fees;
                    reserv["clientName"] = clientName;
                    reserv["clientEmail"] = clientEmail;
                    reserv["clientPhone"] = clientPhone;
                    saveTransaction(reserv,res);
                  }
            });
        }
    });
};

exports.sendMailConfirmation = (req, res) => {
    if(req.body){
        let user = req.body;
        // let GenerateCode = GenerateText(6)
        const sendMail = (user, callback) => {
            var transport = nodemailer.createTransport({
                host: "mail.travelbyrec.com",
                port: 465,
                secure: true,
                pool: true,
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
          });
          const mailOptions = {
            from: process.env.EMAIL,
            to: `${user.email}`,////////// ⛔ Required ⛔ ////////////
            subject: "Votre réservation a été confirmée <TravelByrec>",
            html: "<b>Bonjour </b>" + ` ${user.name}` + ",<br><br>" + "Merci de votre réservation à " + 
                   `<a href="${process.env.OKURLREDIRECT}/${user.oid}" target="_blank"><b>${user.logement}</b> </a> <br>` + "Nous vous attendons le " + `<b>${user.arriveeDate}</b>. <br>` + "Cordialement, <br><br> <b>L\'équipe TravelByrec</b>"
          };
          transport.sendMail(mailOptions, callback);
        }
        sendMail(user, (err, info) => {
            if (err) {
              res.status(400).send({
                error: 'Failed to send email',
              });
            } else {
              res.status(200).send({
                message: 'E-mail envoyé avec succès',
              });
            }
          });
        
      }
};

exports.deleteReservation = (req, res) => {
    const id = req.params.id;
    Reservation.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Reservation with. Maybe Reservation was not found!`
                });
            } else {
                res.send({
                    message: "Reservation was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Reservation"
            });
        });
};

exports.findAllReservations = (req, res) => {
    Reservation.aggregate([
        {
                    $lookup: {
                        from: "paiements",
                        let: { idReservation: "$_id" },
                        pipeline: [
                        {
                            $match: {
                            $expr: {
                                $eq: ["$idReservation", "$$idReservation"]
                            }
                            }
                        }
                        ],
                        as: "paiement"
                    }
                    
        },
        {
            $addFields: {
                paiement: { $arrayElemAt: [ "$paiement", 0 ] }
            }
        },
        {
            $lookup: {
                from: "logements",
                localField: "id_logement",
                foreignField: '_id',
                as: "logement"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "id_client",
                foreignField: '_id',
                as: "client"
            }
        },
        {
            $lookup: {
                from: "user_googles",
                localField: "id_client",
                foreignField: '_id',
                as: "client_GOOGLE"
            }
        },
        {
            $project: {
            "__v":0,
            "id_logement":0,
            "id_client":0,
            "logements.__v":0,
            "users.__v":0
            }
        }

    ])  .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving reservations."
        });
    });

};

exports.findSingleReservations = (req, res) => {
    const oid = req.params.oid; 

    Reservation.findOne({reservation_number: Number(oid)})
    .populate({
        path: 'id_logement',
        select: '-__v',
        populate: [
            {
                path: 'equipements',
                select: '-__v'
            },
            {
                path: 'services_included',
                select: '-__v'
            },
        ]
    })
    .then(logement => {
        if (!logement) {
            return res.status(404).send({
                message: "Reservation not found"
            });
        }
        res.send(logement);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error retrieving reservation"
        });
    });
};


function saveTransaction(reservation,res) {
    let fees = [
        {
          desc: "Réduction",  
          value: reservation.reduction,  
        },
        {
          desc: "Frais de ménage",  
          value: reservation.cleaning_fees,  
        },
        {
          desc: "Frais de service",  
          value: reservation.service_fees,  
        }
    ]

    let paiement = new Paiement({
        oid: reservation.reservation_number,
        idReservation: reservation["_id"],
        amount: reservation.prix_total.toString(),
        currency: "504",
        paiementStatus: "En attente", //Statut de paiement en attente/Payée
        services: reservation.services,
        services_included: reservation.services_included,
        fees: fees,
        created: new Date(),
        updated: new Date(),
    });

    paiement.save((err, pay) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        } else {
            const formData = {
                oid: reservation.reservation_number.toString(),
                clientid: process.env.CLIENTID,
                storeKey: process.env.STOREKEY,
                amount: reservation.prix_total.toString(),
                shopUrl: process.env.SHOPURL,
                okUrl: process.env.OKURLSERVER,
                failUrl: process.env.FAILURLSERVER,
                callbackUrl: process.env.CALLBACKURL,
                TranType: "PreAuth",
                currency: "504",
                encoding: "UTF-8",
                AutoRedirect: "false",
                lang: "fr",
                hashAlgorithm: "ver3",
                storetype: "3D_PAY_HOSTING",
                rnd: Math.floor(Date.now() / 1000) + '.' + Math.floor(Math.random() * 100),
                BillToName: reservation.clientName,
                email: reservation.clientEmail,
                tel: reservation.clientPhone,
                desc1: reservation.logement_name,
                price1: reservation.logement_price.toString(),
                qty1: reservation.nuits.toString(),
                total1: (reservation.nuits * reservation.logement_price).toString(),
                id1: "1",
                productCode1: "1",
                itemNumber1: "1",
                // hash: "",
            };

            //   _____Services ajoutés_____
            const services = reservation.services;
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
            const services_included = reservation.services_included;
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
            for (let i = 0; i < fees.length; i++) {
                formData[`desc${j_index}`] = fees[i]["desc"];
                formData[`id${j_index}`] = j_index;
                formData[`total${j_index}`] = fees[i]["value"] != null ? fees[i]["value"] : 0;
                formData[`productCode${j_index}`] = j_index;
                formData[`itemNumber${j_index}`] = j_index;
                j_index++;
            }
            paymentGateway(formData,res);
        }
    });
};


function paymentGateway(formData,res) {
    let form = `<form action="${process.env.PAYMENTGATEWAY}" method="post" name="formpaiement" id="formpaiement">`;
    for (let key in formData) {
        form += `<input type="hidden" name="${key}" value="${formData[key]}">`;
    }
    form += '</form>';
    res.send({body: form});
}


