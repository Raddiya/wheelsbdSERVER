const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())
const jwtVerify = async (req, res, next) => {
    const authHeaders = req.headers.authorization
    if (!authHeaders) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.TOKEN_SECRATE, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}

const run = async () => {

    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bhhzy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        await client.connect()
        const productCollection = client.db("bike").collection("product");
        const userCollection = client.db("bike").collection("user");
        const orderCollection = client.db("bike").collection("order");
        const reviewCollection = client.db("bike").collection("review");

        console.log('database connect')

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find()
            const result = await cursor.toArray()
            res.send({ result });
        })
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const result = await productCollection.findOne({ _id: ObjectId(id) })
            res.send({ result });
        })
        app.get('/myitems', jwtVerify, async (req, res) => {
            const email = req.decoded.email;
            console.log(email)
            const cursor = orderCollection.find({ email })
            const result = await cursor.toArray()
            res.send({ result });
        })

        app.post('/products', async (req, res) => {
            const { name, about, image, price, quantity, email, supplier } = req.body;

            const result = await productCollection.insertOne({ name, about, image, price, quantity, email, supplier })
            res.send({ result });
        })
        app.post('/login', async (req, res) => {
            const { email } = req.body;
            const token = jwt.sign({ email }, process.env.TOKEN_SECRATE, {
                expiresIn: '1d'
            });
            res.send({ token });
        })
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const result = await productCollection.deleteOne({ _id: ObjectId(id) })
            res.send({ result });
        })


        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = req.body.quantity;
            const result = await productCollection.updateOne({ _id: ObjectId(id) }, { $set: { quantity } }, { upsert: true })
            res.send({ result });
        })


        // jwt token
        app.post('/jwt-generator', async (req, res) => {
            const email = req.body.email
            const result = await userCollection.findOne({ email })
            console.log(result)
            const token = jwt.sign({ email, role: result?.role ? result?.role : "user" }, process.env.TOKEN_SECRATE);
            res.send(token)
        })

        app.get('/jwt-decoded', jwtVerify, (req, res) => {
            const decoded = req.decoded

            res.send(decoded)
            console.log(decoded)
        })

        //    =========================user===============
        app.put(`/user`, async (req, res) => {

            const email = req.body.email

            const filter = { email }
            const updated = { $set: { email } }
            const itemUpdated = await userCollection.updateOne(filter, updated, { upsert: true })
            res.send(itemUpdated)
        })
        app.get(`/users`, async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.delete(`/user/:id`, async (req, res) => {
            const id = req.params.id
            const result = await userCollection.deleteOne({
                _id: ObjectId(id)
            })
            res.send(result)
        })

        // admin

        app.put(`/user/:id`, async (req, res) => {
            const updated = { $set: { role: "admin" } }
            const id = req.params.id
            const result = await userCollection.updateOne({
                _id: ObjectId(id)
            }, updated, { upsert: true })
            res.send(result)
        })


        // ==================review=======================

        app.post('/review', async (req, res) => {

            const { review, userName, email } = req.body
            const newReview = { userName, review, email }
            const insert = await reviewCollection.insertOne(newReview)
            if (insert) {
                res.status(200).send(insert)
            }


        })

        app.get(`/review`, async (req, res) => {
            const limit = req.query.limit || 100
            const result = await reviewCollection.find().sort({ _id: -1 }).limit(parseInt(limit)).toArray()
            res.send(result)
        })


        // ==============order=================================

        app.get('/orders', async (req, res) => {

            const query = {}
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray()
            res.status(200).send(result)

        })
        app.get('/userOrders', jwtVerify, async (req, res) => {
            const email = req.decoded.email
            const query = { email }
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray()
            res.status(200).send(result)

        })

        app.post('/orders', async (req, res) => {
            const result = await orderCollection.insertOne(req.body)
            res.send(result)

        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = {}
            const result = await orderCollection.deleteOne({
                _id: ObjectId(id)
            })
            res.status(200).send(result)

        })








    }
    finally {

    }


}

run().catch(console.log)

app.get('/', (req, res) => {
    res.send('Server is online...')
})

app.listen(port, () => {
    console.log('Listening to port', port)
})