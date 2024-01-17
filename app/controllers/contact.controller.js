const db = require("../models");
const Contact = db.contact;

exports.addContact = (req, res) => {
    let contact = new Contact(req.body);
    contact.created = new Date();
    contact.updated = new Date();
    contact.save((err, contact) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        }

        contact.save(err => {
            if (err) {
                res.status(500).send({
                    message: err
                });
                return;
            }

            res.send({
                message: "contact was registered successfully!"
            });
        });
    });


};

exports.updateContact = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    req.body.updated = new Date();
    Contact.findByIdAndUpdate(req.body._id, req.body, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update contact. Maybe contact was not found!`
                });
            } else res.send({
                message: "contact was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating contact"
            });
        });
};

exports.findAllContacts = (req, res) => {
    Contact.find().select("-__v").exec()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving contacts."
            });
        });
};

exports.deleteContact = (req, res) => {
    const id = req.params.id;
    Contact.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete contact with. Maybe contact was not found!`
                });
            } else {
                res.send({
                    message: "contact was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete contact"
            });
        });
};

