const db = require("../models");
const Category = db.category;

exports.addCategory = (req, res) => {
    let category = new Category({
        name: req.body.name,
        services: req.body.services,
        created: new Date(),
        updated: new Date(),
    });

    category.save((err, category) => {
        if (err) {
            res.status(500).send({
                message: err
            });
            return;
        }

        category.save(err => {
            if (err) {
                res.status(500).send({
                    message: err
                });
                return;
            }

            res.send({
                message: "La catégorie a été enregistrée avec succès!"
            });
        });
    });


};


exports.findAllcategories = (req, res) => {
    Category.find().select("-__v").exec()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving categories."
            });
        });
};


exports.categoriesAggregate = (req, res) => {
    Category.aggregate([
            {
               $lookup:
                  {
                     from: "services",
                     localField: "services",
                     foreignField: '_id',
                     as: "services"
                 }
            }
        ]).then(data => {
            res.send(data);
        })
};


exports.deleteCategory = (req, res) => {
    const id = req.params.id;
    Category.findByIdAndRemove(id, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Category with. Maybe Category was not found!`
                });
            } else {
                res.send({
                    message: "Category was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Category"
            });
        });
};


exports.updateCategory = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    req.body.updated = new Date();
    Category.findByIdAndUpdate(req.body._id, req.body, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Category. Maybe Category was not found!`
                });
            } else res.send({
                message: "Category was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Category"
            });
        });
};