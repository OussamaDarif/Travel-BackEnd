const db = require("../models");
const fs = require('fs');
var slugify = require('slugify')
const Logement = db.logement;

exports.save_image = (req, res) => {
    if (req.body.img.includes("data:image") == true) {
        var matches = req.body.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let fileName = req.params.id;
        fs.writeFileSync("./images/logements/" + fileName, imageBuffer, 'utf8');
        res.send({
            message: "Photo was registered successfully!"
        });
    } else {
        res.status(500).send({
            message: "Error "
        });
        return;
    }
};


exports.createLogement = (req, res) => {
    let logement = new Logement(req.body);
    logement.slug = slugify(logement.title, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,       // convert to lower case, defaults to `false`
        strict: true,      // strip special characters except replacement, defaults to `false`
        locale: 'vi',      // language code of the locale to use
        trim: true         // trim leading and trailing replacement chars, defaults to `true`
      })
    logement.created = new Date();
    logement.updated = new Date();
    logement.save((err, logement) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        }

        logement.save(err => {
            if (err) {
                res.status(500).send({
                    message: err
                });
                return;
            }

            res.send({
                message: "logement was registered successfully!"
            });
        });
    });
};


exports.updateLogement = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Logement to update can not be empty!"
        });
    }
    req.body.updated = new Date();
    const id = req.params.id;
    Logement.findByIdAndUpdate(id, req.body, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Logement. Maybe Logement was not found!`
                });
            } else res.send({
                message: "Logement was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Logement"
            });
        });
};


exports.updateSingleDocument = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Logement to update can not be empty!"
        });
    }

    const id = req.params.id;
    Logement.updateOne(
            { _id : id },
            { $set: { "number_fans" : req.body.number_fans } }
       ).then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Logement. Maybe Logement was not found!`
                });
            } else res.send({
                message: "Logement was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Logement"
            });
        });
};


exports.deleteLogement = (req, res) => {
    const id = req.params.id;
    Logement.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Logement with. Maybe Logement was not found!`
                });
            } else {
                res.send({
                    message: "Logement was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Logement"
            });
        });
};


exports.findAll_logements = (req, res) => {
    Logement.aggregate([
        {
            $lookup: {
                from: "equipements",
                localField: "equipements",
                foreignField: '_id',
                as: "equipements"
            }
        },
        {
            $lookup: {
                from: "services",
                localField: "services_included",
                foreignField: '_id',
                as: "services_included"
            }
        },
        {
            $lookup: {
               from: "avis",
               localField: "_id",
               foreignField: "id_logement",
               as: "ratings",
            },
         },
         {
            $addFields: {
               "avis.score": { $avg: "$ratings.rating" },
               "avis.total": { $size: "$ratings" },
            },
         },
        {
            $project: {
            "__v":0,
            "equipements.__v":0,
            "services_included.__v":0
            }
        }

    ]).then(data => {
        res.send(data);
    })

};


// Find a single Logement with an Slug
exports.findOne = (req, res) => {
    const slug = req.params.slug;
    Logement.aggregate([
        {
            $lookup: {
                from: "equipements",
                localField: "equipements",
                foreignField: '_id',
                as: "equipements"
            }
        },
        {
            $lookup: {
                from: "services",
                localField: "services_included",
                foreignField: '_id',
                as: "services_included"
            }
        },
        {
        $lookup: {
            from: "avis",
            localField: "_id",
            foreignField: "id_logement",
            as: "ratings",
        },
        },
        {
        $addFields: {
            "avis.score": { $avg: "$ratings.rating" },
            "avis.total": { $size: "$ratings" },
        },
        },
        { $match: { "slug" : slug } },
        {
            $project: {
            "__v":0,
            "equipements.__v":0,
            "services_included.__v":0
            }
        }

    ]).then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Logement with slug"});
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Logement with slug" });
      });
};



