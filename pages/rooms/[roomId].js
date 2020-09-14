import Link from 'next/link'

export async function getServerSideProps(context) {

  let id = context.params.roomId;
  
  let props = {id};
  // Pass data to the page via props
  return { props: { id } }
}

export default class Room extends React.Component {

  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    console.log("p: ", this.props);
    return (
      <>
        <h1>Room {this.props.id}</h1>
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
      </>
    )
  }
}