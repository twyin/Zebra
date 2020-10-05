import Head from 'next/head'
import Link from 'next/link'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { connectToDatabase } from '../util/mongodb';


export async function getServerSideProps(context) {
  const { client, db } = await connectToDatabase()
  const isConnected = await client.isConnected() // Returns true or false
  const portfolio = await db.collection("portfolio").find({}, { name: 1, _id: 0 }).toArray();
  console.log(portfolio);
  return {
    props: {
      isConnected,
      portfolio: JSON.parse(JSON.stringify(portfolio))
    }
  }
}


export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: "TRY",
      quantity: 1,
      price: 2
    }
  }
  handleSubmit = async (event) => {
    event.preventDefault();
    alert("submitting")
    let response = await fetch('/api/buy', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    });
    let data = await response.json()
    return data;
  }
  render() {
    return (
      <Container>
        <Head>
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <h1 className="title">
            Enter <Link href="/rooms/1"><a>test room!</a></Link>
          </h1>

          <p className="description">
            Get started by editing <code>pages/index.js</code>
          </p>

          <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="formGroupEmail">
              <Form.Label>Room</Form.Label>
              <Form.Control type="text" placeholder="Enter Room ID" />
            </Form.Group>
            <Form.Group controlId="formGroupPassword">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter Name" />
            </Form.Group>
            <Form.Group>
              <Button type="submit">Enter room</Button>
            </Form.Group>
          </Form>
          {
            this.props.portfolio.map((element) => {
              return (
                <div>
                  {element.name + ' - ' + element.quantity}
                </div>
              );
            })
          }
        </main>
      </Container>
    )
  }
}
