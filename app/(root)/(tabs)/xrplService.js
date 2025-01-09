import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as xrpl from 'xrpl';

const XRPLApp = () => {
  const [client, setClient] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    // Connect to XRPL Testnet
    const connectToXRPL = async () => {
      const newClient = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); // Testnet
      await newClient.connect();
      setClient(newClient);

      // Create a new wallet (for demo purposes)
      const newWallet = xrpl.Wallet.generate();
      setWallet(newWallet);
    };

    connectToXRPL();

    return () => {
      // Disconnect client when unmounted
      if (client) client.disconnect();
    };
  }, []);

  const checkBalance = async () => {
    if (client && wallet) {
      const accountInfo = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated',
      });
      setBalance(accountInfo.result.account_data.Balance);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>XRPL Integration</Text>
      {wallet && (
        <Text style={styles.text}>Wallet Address: {wallet.address}</Text>
      )}
      {balance && (
        <Text style={styles.text}>Balance: {balance} drops</Text>
      )}
      <Button title="Check Balance" onPress={checkBalance} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default XRPLApp;
