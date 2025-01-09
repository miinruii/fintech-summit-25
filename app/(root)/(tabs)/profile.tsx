import 'react-native-get-random-values';
const crypto = require('crypto-js');
import * as xrpl from 'xrpl';

import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/firebase.config';
import { doc, setDoc, getDoc } from "firebase/firestore";
import FormField from '@/components/FormField';
import Button from '@/components/Button';

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({ username: '', email: '', contact: '' });
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [client, setClient] = useState(null);

  // 🔹 Initialize XRPL Client
  useEffect(() => {
    const connectToXRPL = async () => {
      try {
        const newClient = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
        await newClient.connect();
        setClient(newClient);
        console.log("✅ Connected to XRPL Testnet.");
      } catch (error) {
        console.error("❌ Error connecting to XRPL:", error);
      }
    };

    connectToXRPL();

    return () => {
      if (client) {
        client.disconnect();
        console.log("🔌 Disconnected from XRPL Testnet.");
      }
    };
  }, []);

  // 🔹 Fetch User Profile
  useEffect(() => {
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
            setWallet(userData.wallet); // Public wallet details
          }

          // Load wallet locally
          const storedWallet = await loadWalletLocally(user.uid);
          if (storedWallet) {
            setWallet((prev) => ({
              ...prev,
              ...storedWallet, // Merge sensitive wallet details
            }));
          }
        }
      }
    };

    fetchUserProfile();
  }, []);

  // 🔹 Save Wallet Locally (User-Specific)
  const saveWalletLocally = async (uid, wallet) => {
    try {
      await AsyncStorage.setItem(
        `user_wallet_${uid}`,
        JSON.stringify({
          seed: wallet.seed,
          privateKey: wallet.privateKey,
          classicAddress: wallet.classicAddress,
          publicKey: wallet.publicKey,
        })
      );
      console.log(`✅ Wallet saved locally for user: ${uid}`);
    } catch (error) {
      console.error('❌ Error saving wallet locally:', error);
    }
  };

  // 🔹 Load Wallet Locally (User-Specific)
  const loadWalletLocally = async (uid) => {
    try {
      const walletData = await AsyncStorage.getItem(`user_wallet_${uid}`);
      if (walletData) {
        const wallet = JSON.parse(walletData);

        // Validate the wallet
        try {
          const validatedWallet = xrpl.Wallet.fromSeed(wallet.seed);
          console.log(`✅ Valid wallet loaded for user: ${uid}`, validatedWallet);
          return wallet;
        } catch (validationError) {
          console.error("❌ Invalid wallet data:", validationError);
          Alert.alert("Error", "Invalid wallet data found. Please recreate your wallet.");
          return null;
        }
      }
      console.warn(`⚠️ No wallet found for user: ${uid}`);
      return null;
    } catch (error) {
      console.error('❌ Error loading wallet locally:', error);
      return null;
    }
  };

  // 🔹 Save Profile to Firestore
  const saveProfile = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const updatedProfile = {
          ...profile,
          email: user.email,
          wallet: wallet ? {
            classicAddress: wallet.classicAddress, // Public wallet details
            publicKey: wallet.publicKey,
          } : null,
        };

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, updatedProfile);
        Alert.alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Create New Wallet
  const createNewWallet = async () => {
    console.log('⚙️ Creating new wallet...');
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      // Check if a wallet already exists
      const existingWallet = await AsyncStorage.getItem(`user_wallet_${user.uid}`);
      if (existingWallet) {
        Alert.alert("Wallet Exists", "A wallet already exists for this user.");
        console.log("❌ Wallet already exists:", existingWallet);
        return;
      }

      // Create a new wallet
      const newWallet = xrpl.Wallet.generate();
      setWallet(newWallet);

      // Save wallet locally
      await saveWalletLocally(user.uid, newWallet);

      // Save public wallet details to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        wallet: {
          classicAddress: newWallet.classicAddress,
          publicKey: newWallet.publicKey,
        },
      }, { merge: true });

      Alert.alert('Wallet created!', `Your wallet address is: ${newWallet.classicAddress}`);
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  // 🔹 Check Wallet Balance
  const checkBalance = async () => {
    if (!client || !wallet) {
      Alert.alert("Error", "Please ensure the wallet and client are loaded.");
      return;
    }

    try {
      console.log(`🔍 Fetching balance for: ${wallet.classicAddress}`);
      
      const accountInfo = await client.request({
        command: "account_info",
        account: wallet.classicAddress,
        ledger_index: "validated",
      });

      const balanceInXRP = xrpl.dropsToXrp(accountInfo.result.account_data.Balance);
      setBalance(balanceInXRP);
      Alert.alert("Balance Retrieved", `Your wallet balance is ${balanceInXRP} XRP`);
    } catch (error) {
      console.error("❌ Error fetching balance:", error);
      Alert.alert("Error", "Could not retrieve balance.");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <Text className="text-primary-300 font-rubik-extrabold mt-4 text-5xl mb-4">
            User Profile
          </Text>

          <FormField
            title="Username:"
            value={profile.username}
            handleChangeText={(e) => setProfile({ ...profile, username: e })}
            placeholder="Enter your username"
          />

          <Text className="text-black mt-7 mb-4">Email: {auth.currentUser?.email}</Text>

          <FormField
            title="Contact Number:"
            value={profile.contact}
            handleChangeText={(e) => setProfile({ ...profile, contact: e })}
            keyboardType="phone-pad"
            placeholder="Enter your contact number"
          />

          {wallet ? (
            <View>
              <Text className="underline mt-4 font-rubik-bold">Wallet Address: </Text>
              <Text>{wallet.classicAddress}</Text>
              <Text className="underline mt-4 font-rubik-bold">Public Key: </Text>
              <Text>{wallet.publicKey}</Text>
              <Text className="underline mt-4 font-rubik-bold"> Balance: </Text>
              <Text className="ml-1">{balance ?? 'Fetching...'} XRP</Text>
              
              <Button
                title="Check Balance"
                textStyles="text-white"
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
