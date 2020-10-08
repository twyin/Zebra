import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import { connectToDatabase } from '../util/mongodb';
import React from 'react';

export async function getServerSideProps(context) {
  const { client, db } = await connectToDatabase()
  const isConnected = await client.isConnected() // Returns true or false
  const portfolio = await db.collection("portfolio").find({}, { name: 1, _id: 0 }).toArray();
  const balances = await db.collection("balance").find({}).toArray();
  console.log(portfolio);
  console.log(balances);
  return {
    props: {
      isConnected,
      portfolio: JSON.parse(JSON.stringify(portfolio)),
      balance: balances[0].balance,
    }
  }
}


export default class Home extends React.Component {

  constructor(props) {
    super(props);
    const portfolio = props.portfolio.map(x => {
      return {
        symbol: x.name,
        quantity: x.quantity,
        price: 0,
      };
    })
    console.log(portfolio)
    this.state = {
      balance: props.balance,
      portfolio: portfolio,
      purchase_symbol: "",
      purchase_input: undefined,
      purchase_price: 0,
      purchase_mode: "SHARES", // DOLLARS, SHARES
    };
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const {purchase_input, purchase_mode, purchase_symbol, purchase_price} = this.state;
    const purchase = {
      symbol: purchase_symbol,
      quantity: parseFloat(purchase_mode === "SHARES" ? purchase_input : purchase_input / purchase_price),
      price: parseFloat(purchase_price),
    }
    alert("submitting: "+purchase_mode)
    console.log(purchase);
    let response = await fetch('/api/buy', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    });
    let data = await response.json()
    console.log(data);
  }

  handlePurchaseModeChange = (event) => {
    this.setState({purchase_mode: event.target.value});
  }

  handlePurchaseSymbolChange = (event) => {
    this.setState({purchase_symbol: event.target.value});
  }

  handlePurchaseSymbolBlur = (event) => {
    this.getLastPrice(event.target.value).then(last_price => 
      this.setState({purchase_price: last_price})
    );
  }

  getLastPrice = async (symbol) => {
    let response = await fetch('https://finnhub.io/api/v1/quote?token=btt77bn48v6q0kg1na2g&symbol='+symbol, {
      method: 'GET'
    });
    let data = await response.json();
    return data.c;
  }

  handlePurchaseInputChange = (event) => {
    this.setState({purchase_input: event.target.value});
  }

  async componentDidMount() {
    const socket = new WebSocket('wss://ws.finnhub.io?token=btt77bn48v6q0kg1na2g');

    // Connection opened -> Subscribe
    socket.addEventListener('open', (event) => {
      for (const {symbol} of this.state.portfolio) {
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': symbol}))
      }
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
        // console.log('Message from server ', event.data);
        let message = JSON.parse(event.data);
        console.log(message);
        if (message.type === "trade") {
          const trade = message.data[0];
          const new_symbol = trade.s;
          const new_price = trade.p;
          this.setState((state, props) => {
            const portfolio = state.portfolio.map(holding => {
              let {symbol, quantity} = holding;
              return new_symbol === symbol ? {symbol, quantity, price: new_price} : holding;
            });
            return {portfolio};
          });
        }
    });
    this.socket = socket;
    const portfolio = await Promise.all(this.state.portfolio.map(async (holding) => {
      let {symbol, quantity} = holding;
      let last_price = await this.getLastPrice(symbol);
      return {symbol, quantity, price: last_price};
    }));
    this.setState({portfolio});
  }

  render() {
    let {balance, portfolio, purchase_mode, purchase_symbol, purchase_input, purchase_price} = this.state;
    let portfolio_value = portfolio.map(x => x.price * x.quantity).reduce((a, b) => a+b);
    return (
      <>
        <div style={{flexGrow: 1}}>
          <AppBar position="static">
              <Toolbar>
                  <IconButton edge="start" style={{marginRight: 20}} color="inherit" aria-label="menu">
                      <ShowChartIcon />
                  </IconButton>
                  <Typography variant="h6" style={{flexGrow: 1}}>
                      Bobinhood 1.0
                  </Typography>
              </Toolbar>
          </AppBar>
        </div>
        <Container style={{marginTop: 20}}>
          {/* <Form onSubmit={this.handleSubmit}> */}
          <Grid container spacing={3}>
            <Grid item xs={8}>
              <Paper style={{padding: 10}}>
                <h3 style={{marginTop: 0, marginBottom: 0}}>Portfolio</h3>
                <h1 style={{textAlign: "center"}}>${this.displayCurrency(portfolio_value)}</h1>
              </Paper>
              <Paper style={{padding: 10, marginTop: 20}}>
                <h3 style={{marginTop: 0, marginBottom: 0}}>Cash Balance</h3>
                <h1 style={{textAlign: "center"}}>${this.displayCurrency(balance)}</h1>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper style={{padding: 10}}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TextField
                      id="outlined-secondary"
                      label="Stock"
                      variant="outlined"
                      color="secondary"
                      value={purchase_symbol}
                      style={{width: "100%"}}
                      onChange={this.handlePurchaseSymbolChange}
                      onBlur={this.handlePurchaseSymbolBlur}
                    />
                  </Grid>
                  <Grid item xs={6} style={{display: "flex", alignItems: "center"}}>
                    <Typography variant="subtitle1">
                      Price: ${this.displayCurrency(purchase_price)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{display: "flex", justifyContent: "center"}}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Buy in</FormLabel>
                      <RadioGroup aria-label="Purchase Mode" name="purchase_mode" value={purchase_mode} onChange={this.handlePurchaseModeChange}>
                        <FormControlLabel value="DOLLARS" control={<Radio />} label="Dollars" />
                        <FormControlLabel value="SHARES" control={<Radio />} label="Shares" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField  
                      id="outlined-secondary"
                      label="Amount"
                      variant="outlined"
                      color="secondary"
                      value={purchase_input}
                      style={{width: "100%"}}
                      onChange={this.handlePurchaseInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" style={{width: "100%", paddingTop: 10, paddingBottom: 10, marginTop: 5, marginBottom: 5}} color="primary" size="large" onClick={this.handleSubmit}>
                      Buy
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <TableContainer component={Paper} style={{marginTop: 20}}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Stocks</TableCell>
                  <TableCell align="right">Number of Shares</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolio.map((row) => (
                  <TableRow key={row.symbol}>
                    <TableCell component="th" scope="row">
                      {row.symbol}
                    </TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell align="right">${this.displayCurrency(row.price)}</TableCell>
                    <TableCell align="right">${this.displayCurrency(row.price * row.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </>
    )
  }

  // Helpers
  displayCurrency(x) {
    return x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
