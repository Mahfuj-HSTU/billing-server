const express = require( "express" );
const app = express();
const cors = require( "cors" );
const { MongoClient, ServerApiVersion, ObjectId } = require( "mongodb" );
const port = process.env.PORT || 5000;
require( "dotenv" ).config();

// middleware
app.use( cors() );
app.use( express.json() );


const uri = `mongodb+srv://${ process.env.DB_user }:${ process.env.DB_password }@cluster0.mdoqsyi.mongodb.net/?retryWrites=true&w=majority`;
// console.log( uri );
const client = new MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 } );

async function run () {
    const billsCollection = client.db( 'BillCalculation' ).collection( 'bills' )

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

