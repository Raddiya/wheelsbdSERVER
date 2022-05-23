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