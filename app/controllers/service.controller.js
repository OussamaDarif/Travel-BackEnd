const db = require("../models");
const fs = require('fs');
const Service = db.service;

exports.addService = (req, res) => {
    let service = new Service({
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        unit_measure: req.body.unit_measure,
        description: req.body.description,
        created: new Date(),
        updated: new Date(),
    });

    if (req.body.image.includes("data:image") == true) {
        var matches = req.body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let fileName = req.params.id;
        fs.writeFileSync("./images/services/" + fileName, imageBuffer, 'utf8');
        service.image = "/images/services/" + fileName
    }

    service.save((err, service) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        }

        service.save(err => {
            if (err) {
                res.status(500).send({
                    message: err
                });
                return;
            }

            res.send({
                message: "Service was registered successfully!"
            });
        });
    });


};

exports.updateService = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    req.body.updated = new Date();
    if (req.body.image.includes("data:image") == true) {
        var matches = req.body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let fileName = req.params.id;
        fs.writeFileSync("./images/services/" + fileName, imageBuffer, 'utf8');
        req.body.image = "/images/services/" + fileName
    }
    
    Service.findByIdAndUpdate(req.body._id, req.body, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Service. Maybe Service was not found!`
                });
            } else res.send({
                message: "Service was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Service"
            });
        });
};

exports.findAllservices = (req, res) => {
    Service.find().select("-__v").exec()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving services."
            });
        });
};

exports.deleteService = (req, res) => {
    const id = req.params.id;
    Service.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Service with. Maybe Service was not found!`
                });
            } else {
                res.send({
                    message: "Service was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Service"
            });
        });
};

