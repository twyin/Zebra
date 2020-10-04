import {connectToDatabase} from '../../util/mongodb'

export default async (req, res) => {

    let stock = req['body']['symbol'];
    let shares = req['body']['quantity']

    const { client, db } = await connectToDatabase()
    const isConnected = await client.isConnected() // Returns true or false
    const portfolio = await db
    .collection("portfolio")
    .find({ name: stock })
    .toArray()
    ;
    console.log("previously had: ", portfolio[0] ? portfolio[0]['quantity'] : 'null');
    if (portfolio.length) {
        db.collection("portfolio").updateOne(
            { name: stock },
            {
                $set: { quantity: portfolio[0]['quantity'] + shares },
            }
        )
    } else {
        try {
            db.collection("portfolio").insertOne({ name: stock, quantity: shares });
        } catch (e) {
            console.log("insert fail");
        };
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ name: 'John Doe' }))
}
