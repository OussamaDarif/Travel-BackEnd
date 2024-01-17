const db = require("../models");
const fs = require('fs');
const Equipement = db.equipement;


exports.addEquipement = (req, res) => {
    let equipement = new Equipement({
        name: req.body.name,
        icon: req.body.icon,
        created: new Date(),
        updated: new Date()
    });

    if (req.body.icon.includes("data:image") == true) {
        var matches = req.body.icon.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let type = decodedImg.type;
        let fileName = req.params.id;
        fs.writeFileSync("./images/equipements/" + fileName, imageBuffer, 'utf8');
        equipement.icon = "/images/equipements/" + fileName
    }

    equipement.save((err, equipement) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        }

        equipement.save(err => {
            if (err) {
                res.status(500).send({
                    message: err
                });
                return;
            }

            res.send({
                message: "Equipement was registered successfully!"
            });
        });
    });


};

exports.updateEquipement = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    req.body.updated = new Date();
    if (req.body.icon.includes("data:image") == true) {
        var matches = req.body.icon.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let type = decodedImg.type;
        let fileName = req.params.id;
        fs.writeFileSync("./images/equipements/" + fileName, imageBuffer, 'utf8');
        req.body.icon = "/images/equipements/" + fileName
    }
    
    Equipement.findByIdAndUpdate(req.body._id, req.body, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Equipement. Maybe Equipement was not found!`
                });
            } else res.send({
                message: "Equipement was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Equipement"
            });
        });
};

exports.findAllequipement = (req, res) => {
    Equipement.find().select("-__v").exec()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving equipements."
            });
        });
};

exports.deleteEquipement = (req, res) => {
    const id = req.params.id;
    Equipement.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Equipement with. Maybe Equipement was not found!`
                });
            } else {
                res.send({
                    message: "Equipement was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Equipement"
            });
        });
};

