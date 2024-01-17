const db = require("../models");
const Avis = db.avis;

exports.addAvis = (req, res) => {
    let avis = new Avis(req.body);
    avis.created = new Date();
    avis.updated = new Date();
    avis.save((err, avis) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        }

        avis.save(err => {
            if (err) {
                res.status(500).send({
                    message: err
                });
                return;
            }

            res.send({
                message: "Avis a été enregistré avec succès!"
            });
        });
    });


};
exports.fetchavis = (req, res) => {
    Avis.aggregate([
        {
            $lookup: {
               from: "logements",
               localField: "id_logement",
               foreignField: "_id",
               as: "logement",
            },
         },
        {
            $project: {
            "__v":0,
            }
        }

    ]).then(data => {
        res.send(data);
    })

};
exports.deleteAvis = (req, res) => {
    const id = req.params.id;
    Avis.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Could not delete Avis!`
                });
            } else {
                res.send({
                    message: "Avis a été supprimé avec succès!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Avis"
            });
        });
};