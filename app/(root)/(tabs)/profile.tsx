import 'react-native-get-random-values';
const crypto = require('crypto-js');
import * as xrpl from 'xrpl';

import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { auth, db } from '@/firebase.config';
import { doc, setDoc, getDoc } from "firebase/firestore";

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({ username: '', email: '', contact: '' });
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            username: userData.username || '',
            email: userData.email || '',
            contact: userData.contact || '',
          });

          // Load wallet from Firestore
          if (userData.wallet) {
            setWallet(userData.wallet);
          }
        }
      }
    };

    // Connect to XRPL
    const connectToXRPL = async () => {
      const newClient = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); // Testnet
      await newClient.connect();
      setClient(newClient);
    };

    fetchUserProfile();
    connectToXRPL();

    return () => {
      if (client) client.disconnect();
    };
  }, []);

  // Save Profile Data
  const saveProfile = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const updatedProfile = {
          ...profile,
          email: user.email,
          wallet: wallet ? wallet.classicAddress : null, // Save wallet address
        };

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, updatedProfile);
        Alert.alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create New Wallet
  const createNewWallet = async () => {
    console.log('Create Wallet button pressed'); // Debugging step
    try {
      const newWallet = xrpl.Wallet.generate();
      setWallet(newWallet);
      Alert.alert('Wallet created!', `Your wallet address is: ${newWallet.classicAddress}`);
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  // Check Wallet Balance
  const checkBalance = async () => {
    if (client && wallet) {
      try {
        const accountInfo = await client.request({
          command: 'account_info',
          account: wallet.classicAddress,
          ledger_index: 'validated',
        });
        setBalance(xrpl.dropsToXrp(accountInfo.result.account_data.Balance));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <Text className="text-primary-300 font-rubik mt-4 text-5xl mb-4">
            User Profile
          </Text>

          <FormField
            title="Username:"
            value={profile.username}
            handleChangeText={(e) => setProfile({ ...profile, username: e })}
            placeholder="Enter your username"
          />

          <Text className="text-black mt-4">Email: {auth.currentUser.email}</Text>

          <FormField
            title="Contact Number:"
            value={profile.contact}
            handleChangeText={(e) => setProfile({ ...profile, contact: e })}
            keyboardType="phone-pad"
            placeholder="Enter your contact number"
          />

          {wallet ? (
            <View>
              <Text className="mt-4">Wallet Address: {wallet.classicAddress}</Text>
              <Text className="mt-4">Balance: {balance || 'Fetching...'}</Text>
              <Button
                title="Check Balance"
                handlePress={checkBalance}
                containerStyles="mt-4 bg-primary-400 p-3 rounded-xl"
              />
            </View>
          ) : (
            <Button
              title="Create Wallet"
              handlePress={createNewWallet}
              containerStyles="mt-4 bg-primary-400 p-3 rounded-xl"
            />
          )}

          <Button
            title="Save Profile"
            handlePress={saveProfile}
            containerStyles="mt-7 bg-primary-400 p-3 rounded-xl"
            textStyles="text-white"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
