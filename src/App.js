import React from 'react';
import NavBar from './components/NavBar';
import CustomGoogleMap from './components/CustomGoogleMap';
import './App.sass';

function App() {
  return (
    <div className="App">
      <NavBar/>
      <div>
        <CustomGoogleMap/>
      </div>
    </div>
  );
}

export default App;
