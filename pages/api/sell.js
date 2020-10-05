import {connectToDatabase} from '../../util/mongodb'

export default async (req, res) => {

    let stock = req['body']['symbol'];
    let shares = req['body']['quantity'];
    let price = req['body']['price'];

    const { client, db } = await connectToDatabase()
    const isConnected = await client.isConnected() // Returns true or false

    const balanceCollection = await db.collection("balance").find({}, { balance: 1, _id: 0 }).toArray();
    let balance = balanceCollection[0]['balance'];

    const portfolio = await db
    .collection("portfolio")
    .find({ name: stock })
    .toArray()
    ;
    let currentQuantity = portfolio[0]['quantity'];
    if (portfolio.length) {
        if (shares >= currentQuantity) {
            db.collection("portfolio").remove(
                { name: stock }, true
            )
        } else {
            db.collection("portfolio").updateOne(
                { name: stock },
                {
                    $set: { quantity: currentQuantity - shares },
                }
            )
        }
        db.collection("balance").updateOne(
            { name: "balance" },
            {
                $set: { balance: balance + Math.min(currentQuantity, shares) * price}
            }
        )
    } else {
        res.statusCode = 418;
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ name: 'John Doe' }));
        return;
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ name: 'John Doe' }))
}
