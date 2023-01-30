const express = require( "express" );
const mongoose = require( 'mongoose' );
const app = express();
const router = express.Router()
const cors = require( "cors" );
const { MongoClient, ServerApiVersion, ObjectId } = require( "mongodb" );
const port = process.env.PORT || 5000;
require( "dotenv" ).config();

// middleware
app.use( cors() );
app.use( express.json() );
// const usersCollection = require( './Model/UserSchema' )

const uri = `mongodb+srv://${ process.env.DB_user }:${ process.env.DB_password }@cluster0.mdoqsyi.mongodb.net/?retryWrites=true&w=majority`;
// console.log( uri );
const client = new MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 } );

// mongoose.connect( uri, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// } ).then( () => {
//     console.log( 'connected' )
// } )
//     .catch( ( error ) =>
//         console.log( 'not connected' ) );

async function run () {
    const billsCollection = client.db( 'BillCalculation' ).collection( 'bills' )
    const usersCollection = client.db( 'BillCalculation' ).collection( 'users' )

    try {
        // post bills
        app.post( '/api/add-billing', async ( req, res ) => {
            const service = req.body;
            const result = await billsCollection.insertOne( service );
            res.json( result );
        } );

        // get bills
        app.get( '/api/billing-list', async ( req, res ) => {
            const query = {}
            const cursor = billsCollection.find( query );
            const bills = await cursor.toArray();
            res.send( bills );
        } );

        // update billing
        app.put( '/api/update-billing/:id', async ( req, res ) => {
            const id = req.params.id;
            const filter = { _id: ObjectId( id ) };
            const bill = req.body;
            const option = { upsert: true };
            const updatedBill = {
                $set: {
                    name: bill.name,
                    email: bill.email,
                    phone: bill.phone,
                    amount: bill.amount
                }
            }
            const result = await billsCollection.updateOne( filter, updatedBill, option )
            res.send( result )
        } )

        // delete bills
        app.delete( '/api/delete-billing/:id', async ( req, res ) => {
            const id = req.params.id;
            const query = { _id: ObjectId( id ) }
            const result = await billsCollection.deleteOne( query );
            // console.log( result )
            res.send( result )
        } )

        // register
        app.post( '/api/registration', async ( req, res ) => {
            const { name, email, password } = req.body;
            const query = { email: email };
            const user = await usersCollection.findOne( query );
            if ( user ) {
                const message = 'Email already Exist'
                return res.send( { acknowledged: false, message } )
            }
            // console.log( user );
            const result = await usersCollection.insertOne( { name, email, password } );
            res.json( result );
            // console.log( result );
            res.status( 201 ).json( { message: "user registration successfully" } )
        } )
    }
    finally {

    }
}

run().catch( error => console.log( error ) )

app.get( "/", ( req, res ) => {
    res.send( "Billing server is running..." );
} );

app.listen( port, () => {
    console.log( `Billing server is running on ${ port }` );
} );
module.exports = router;
