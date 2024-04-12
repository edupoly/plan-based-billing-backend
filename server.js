var express = require('express');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var cors = require('cors');
var Businessaccount = require('./models/businessAccount');
var Customer = require('./models/customer');
var app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
mongoose.connect('mongodb+srv://infoedupoly:edupoly83@cluster0.eitlw5l.mongodb.net/plan-based-billing');

app.post('/addBusinessAccount', (req, res) => {
    let newBusinessAccount = new Businessaccount(req.body);
    newBusinessAccount.save().then((bacc) => {
        res.json(bacc.businessName);
    });
});

app.post('/getBusiness', (req, res) => {
    Businessaccount.find({ primaryMobile: req.body.primaryMobile, password: req.body.password }).then((business) => {
        res.json(business);
    })
})

app.patch('/updatePlansById/:id', (req, res) => {
    Businessaccount.findByIdAndUpdate(
        { _id: req.params.id },
        { $push: { plans: { $each: req.body.plans } } },
        { new: true }
    ).then((business) => {
        res.json(business);
    })
})

app.patch('/updateServicesById/:id', (req, res) => {
    Businessaccount.findByIdAndUpdate(
        { _id: req.params.id },
        { $push: { services: { $each: req.body.services } } },
        { new: true }
    ).then((business) => {
        res.json(business);
    })
})

app.post('/addCustomer/:id', (req, res) => {
    Businessaccount.findByIdAndUpdate(
        { _id: req.params.id },
        { $push: { customers: req.body } },
        { new: true }
    ).then((business) => {
        let newCustomer = new Customer({ mobile: req.body.mobile });
        newCustomer.save().then((cust) => {
            res.json(req.body.mobile);
        });
    })
})

app.post('/getCustomer', (req, res) => {
    Customer.find({ mobile: req.body.mobile }).then((customer) => {
        res.json(customer);
    })
})

app.patch('/createPassword/:mobile', (req, res) => {
    Customer.findOneAndUpdate(
        { mobile: req.params.mobile },
        { $set: { password: req.body.password } },
        { new: true }
    ).then((customer) => {
        res.json(customer);
    })
})

app.get('/getCustomerDetails/:bId/:mobile', (req, res) => {
    Businessaccount.aggregate([
        { $match: { _id: new ObjectId(req.params.bId) } },
        {
            $project: {
                customers: {
                    $filter: {
                        input: "$customers",
                        as: "customer",
                        cond: { $eq: ["$$customer.mobile", req.params.mobile] }
                    }
                }
            }
        }
    ]).then((customer) => {
        res.json(customer);
    })
})

app.get('/getServices/:bId',(req,res)=>{
    Businessaccount.aggregate([
        { $match: { _id: new ObjectId(req.params.bId) } },
        { $project : { services: 1 } }
    ]).then((services)=>{
        res.json(services);
    })
})

app.post('/addTransaction/:bId', (req, res) => {
    Businessaccount.findByIdAndUpdate(
        { _id: req.params.bId },
        { $push: { transactions: req.body } },
        { new: true }
    ).then((business) => {
        res.json(req.body.totalBill);
    })
})




app.listen(4600, () => {
    console.log('running at 4600')
}
);