import Head from 'next/head'
import Link from 'next/link'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default class Home extends React.Component {
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

          <Form>
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



        </main>
      </Container>
    )
  }
}
