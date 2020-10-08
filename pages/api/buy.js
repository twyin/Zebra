import {connectToDatabase} from '../../util/mongodb'

export default async (req, res) => {

    let stock = req['body']['symbol'];
    let shares = req['body']['quantity'];
    let price = req['body']['price'];

    console.log("start");
    const { client, db } = await connectToDatabase();
    console.log("1");
    const isConnected = await client.isConnected(); // Returns true or false

    const balanceCollection = await db.collection("balance").find({}, { balance: 1, _id: 0 }).toArray();
    console.log("2");
    let balance = balanceCollection[0]['balance'];
    if (shares * price > balance) {
        res.statusCode = 418;
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ name: 'John Doe' }));
        return;
    }
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
        console.log("insert yes");
    } else {
        try {
            db.collection("portfolio").insertOne({ name: stock, quantity: shares });
        } catch (e) {
            console.log("insert fail");
        };
    }
    // db.collection("transactionHistory").insert({name: stock, quantity: shares});
    console.log("old bal: ", balance);
    // db.collection("balance").updateOne(
    //     { name: "balance" },
    //     {
    //         $set: { balance: balance - shares * price}
    //     }
    // )
    console.log("new bal: ", balance - shares * price);

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ name: 'John Doe' }))
}
