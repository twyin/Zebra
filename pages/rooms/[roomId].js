import Link from 'next/link'
import {connectToDatabase} from '../../util/mongodb'

export async function getServerSideProps(context) {

  const { client, db } = await connectToDatabase()
  const isConnected = await client.isConnected() // Returns true or false
  let id = context.params.roomId;

  const rooms = await db
    .collection("rooms")
    .find({ url : id })
    // .sort({ year: -1 })
    // .limit(3)
    .toArray();


  let props = {id};
  // Pass data to the page via props
  return { props: { 
    id,
    isConnected,
    // room } }
    rooms: JSON.parse(JSON.stringify(rooms)) } }
}

export default class Room extends React.Component {

  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    console.log("room ", this.props.rooms[0].url);
    return (
      <>
        {this.props.isConnected ? (
          <h2 className="subtitle">You are connected to MongoDB</h2>
        ) : (
          <h2 className="subtitle">
            You are NOT connected to MongoDB. Check the <code>README.md</code>{' '}
            for instructions.
          </h2>
        )}

        <h1>Room {this.props.rooms[0].url}</h1>
        { this.props.rooms[0].participants.map(participant => {
          return (<p>{participant.name}</p>)
        })}
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
      </>
    )
  }
}