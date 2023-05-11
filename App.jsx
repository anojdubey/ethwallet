import {View, TextInput, Button, Text} from 'react-native';
import React, {useState} from 'react';
import {encode, decode} from 'base-64';
import './global.js';
import Web3 from 'web3';
global.atob = encode;
global.btoa = decode;

const ETH_ENDPOINT =
  'https:///sepolia.infura.io/v3/5da5dad41625429d86f5beb01ab98360';
const PRIVATE_KEY =
  '0x31d0b41980794449fd9628b34db8220e24632bd56e86e9b425547e982b9a639c';
const GAS_PRICE = '20000000000';
const GAS_LIMIT = '21000';

const App = () => {
  const [transactionValue, setTransactionValue] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');

  const sendTransaction = async () => {
    setTransactionStatus('Preparing transaction...');
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT));
      const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
      const nonce = await web3.eth.getTransactionCount(account.address);
      const txParams = {
        nonce: nonce,
        gasPrice: GAS_PRICE,
        gas: GAS_LIMIT,
        to: toAddress,
        value: web3.utils.toWei(transactionValue, 'ether'),
      };
      const signedTx = await web3.eth.accounts.signTransaction(
        txParams,
        PRIVATE_KEY,
      );
      web3.eth
        .sendSignedTransaction(signedTx.rawTransaction)
        .on('transactionHash', hash => {
          setTransactionStatus(`Transaction completed and sent to: ${hash}`);
        })
        .on('receipt', receipt => {
          setTransactionStatus(
            `Transaction confirmed: ${receipt.transactionHash}`,
          );
        })
        .on('error', error => {
          setTransactionStatus(`Transaction failed: ${error.message}`);
        });
    } catch (error) {
      console.error('sendTransaction error:', error);
    }
  };
  console.log(transactionStatus);
  console.log('transactionValue');

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TextInput
        style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
        placeholder="Transaction value (in Ether)"
        keyboardType="numeric"
        onChangeText={text => setTransactionValue(text)}
        value={transactionValue}
      />
      <TextInput
        style={{
          height: 40,
          width: 200,
          borderColor: 'gray',
          borderWidth: 1,
          marginTop: 20,
        }}
        placeholder="To address"
        onChangeText={text => setToAddress(text)}
        value={toAddress}
      />
      <Button title="Submit" onPress={sendTransaction} />
      {transactionStatus ? (
        <Text style={{marginTop: 20}}>{transactionStatus}</Text>
      ) : null}
    </View>
  );
};

export default App;
