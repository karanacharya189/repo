import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Form, Button, Card, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import avaSvg from './ava.svg';
import 'bootstrap/dist/js/bootstrap.min.js';
import PriceFeed from './artifacts/contracts/PriceFeed.sol/PriceFeed.json';

function App() {
  const [storedPrice, setStoredPrice] = useState('');
  const [selectedPair, setSelectedPair] = useState('');
  const [clickedRadioButtonId, setClickedRadioButtonId] = useState('');

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, PriceFeed.abi, provider);

  const getPair = async () => {
    try {
      // Check if MetaMask is installed and connected
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed.');
      }
  
      // Request account access from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found in MetaMask.');
      }
  
      // Get the first account address
      const account = accounts[0];
  
      // Connect to the contract with the signer
      const contractWithSigner = contract.connect(provider.getSigner());
  
      // Update the price with the selected pair
      const transaction = await contractWithSigner.updatePrice(clickedRadioButtonId);
      await transaction.wait();
  
      // Get the latest fetched price
      const latestFetchedPrice = await contract.getLastFetchedPrice(clickedRadioButtonId);
      setStoredPrice('$' + parseInt(latestFetchedPrice) / 100000000); 
    } catch (error) {
      console.error('Error fetching pair:', error.message);
    }
  };
  

  const handleChange = (e) => {
    setStoredPrice('');
    setSelectedPair(e.target.value);
    setClickedRadioButtonId(e.target.id);
  };

  return (
    <div className='container-fluid mt-5 d-flex justify-content-center align-items-center'>
      <Card className='mt-2 shadow' style={{ width: '32rem', borderRadius: '15px' }}>
        <Card.Header className='text-center bg-primary text-white'>
          <Image src={avaSvg} width={170} height={55} fluid className='mt-5' />
          <hr></hr>
          Conversion Pair
        </Card.Header>
        <Card.Body>
          <div className='d-flex justify-content-center'>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group controlId='pairs'>
                {['BTC/USD', 'ETH/USD', 'LINK/USD', 'BTC/ETH'].map((pair, index) => (
                  <Form.Check
                    key={index}
                    id={index + 1}
                    value={pair}
                    type='radio'
                    aria-label={`radio ${index + 1}`}
                    label={pair}
                    onChange={handleChange}
                    checked={selectedPair === pair}
                    style={{ marginRight: '1rem' }}
                  />
                ))}
              </Form.Group>
            </Form>
          </div>
          <div className='mt-4 d-flex justify-content-center'>
            <Button variant='outline-primary' size='sm' onClick={getPair}>
              Submit
            </Button>
          </div>
        </Card.Body>
        <Card.Footer>
          {storedPrice !== '' ? (
            <div className='d-flex justify-content-center'>
              <h5>{selectedPair} ➡ {storedPrice}</h5>
            </div>
          ) : (
            <div style={{ height: '20px' }}></div>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
}

export default App;
