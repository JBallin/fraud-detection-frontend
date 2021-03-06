import React, { Component } from 'react';
import './App.css';
import EventList from './components/EventList';
import Spinner from './components/Spinner';

const isHeroku = window.location.host.includes('heroku');
const apiHref = isHeroku ? 'https://fraud-api.herokuapp.com' : 'http://localhost:8082';
const api = `${apiHref}/events`;

class App extends Component {

  state = {
    events: [],
    loading: true,
    apiError: false
  }

  componentDidMount = async () => {
    let events;
    const eventsJSON = await fetch(api).catch(e => {if(e) this.setState({apiError: true})})
    if (!this.state.apiError) {
      eventsJSON.json().then(data => events = data);
      setTimeout(() => {
        while (!events) {};
        this.setState({
          events: this.state.events.concat(events),
          loading: false
        })
      }, 500)
    }
  }

  toggleFraud = async (event) => {
    if (event.fraud === null) {
      event.fraud = true
    } else if (event.fraud === true) {
      event.fraud = false
    } else {
      event.fraud = null
    }
    await fetch(api + '/' + event.id, {
      headers: {  'Content-Type': 'application/json' },
      method: "PATCH",
      body: JSON.stringify(event)
    })
    .then(res => res.json())
    .then(updatedEvent => {
      this.setState({
        events: this.state.events.map(event => (
          event.id === updatedEvent.id ? updatedEvent : event
        ))
      });
    })
  }

  render() {
    return (
      <div className='container'>
        <h3>Fraud Monitor</h3>
        {
          this.state.apiError ?
            <p style={{color:'red'}}>Failed to fetch: {api}</p> :
          this.state.loading ?
            <Spinner /> :
            <EventList
              events={this.state.events}
              toggleFraud={this.toggleFraud}
            />
        }
      </div>
    );
  }
}

export default App;
