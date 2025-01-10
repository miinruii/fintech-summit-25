import 'react-native-get-random-values';
const crypto = require('crypto-js');
import * as xrpl from 'xrpl';

import { View, Text, ActivityIndicator, ScrollView, Alert, Image, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase.config'; // Ensure Firebase auth is imported
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Button from '@/components/Button';

// Utility function for dynamic wallet reconstruction and signing
const demoSignTransaction = (preparedTx, wallet) => {
  if (!wallet || !wallet.seed) {
    throw new Error("Invalid wallet object: Seed is required for signing.");
  }
  const validWallet = xrpl.Wallet.fromSeed(wallet.seed); // Reconstruct dynamically
  return validWallet.sign(preparedTx);
};

const ListingDetails = () => {
  const ownerAddress = "rfW1HYHhj5Ahs2wm7Anms2BSc1msAehxfv";

  if (xrpl.isValidAddress(ownerAddress)) {
    console.log("✅ Valid owner address:", ownerAddress);
  } else {
    console.error("❌ Invalid owner address:", ownerAddress);
  }

  const route = useRoute();
  const id = (route.params as { id: string })?.id;

  const [listing, setListing] = useState<Record<string, any> | null>(null);
  const [bid, setBid] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [client, setClient] = useState<xrpl.Client | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔹 Initialize Wallet and Client
  useEffect(() => {
    const initializeXRPL = async () => {
      try {
        const newClient = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await newClient.connect();
        setClient(newClient);
        console.log("✅ Connected to XRPL Testnet.");

        // Load wallet for the current user
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Error", "User not logged in.");
          return;
        }

        const storedWallet = await AsyncStorage.getItem(`user_wallet_${user.uid}`);
        if (storedWallet) {
          const parsedWallet = JSON.parse(storedWallet);
          console.log("✅ Loaded wallet for user:", parsedWallet);
          setWallet(parsedWallet);
        } else {
          console.error("❌ Wallet not found for the current user.");
          Alert.alert("Error", "No wallet found. Please create a wallet in your profile.");
        }
      } catch (error) {
        console.error("❌ Error initializing XRPL:", error);
        Alert.alert("Error", "Failed to initialize XRPL client and wallet.");
      }
    };

    initializeXRPL();

    return () => {
      if (client) {
        client.disconnect();
        console.log("🔌 Disconnected from XRPL Testnet.");
      }
    };
  }, []);

  const fetchListingDetails = async () => {
    try {
      if (!id) return;
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        console.log("✅ Listing fetched:", docSnap.data());
      } else {
        console.log("❌ No such document in Firestore!");
      }
    } catch (error) {
      console.error("❌ Error fetching listing details:", error);
    }
  };

  // Refresh Handler
  const handleRefresh = async () => {
    if (!id) return;

    try {
      setRefreshing(true);
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        console.log("✅ Listing refreshed:", docSnap.data());
      } else {
        console.log("❌ No such document in Firestore!");
      }
    } catch (error) {
      console.error("❌ Error refreshing listing details:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
  }, [id]);



  // 🔹 Check if Account is Activated
  const checkAccountActivated = async () => {
    if (!wallet || !client) {
      console.error("❌ Wallet or client not initialized.");
      Alert.alert("Error", "Ensure the wallet and client are initialized.");
      return false;
    }

    try {
      const accountInfo = await client.request({
        command: "account_info",
        account: wallet.classicAddress,
      });
      console.log("✅ Account is active:", accountInfo);
      return true;
    } catch (error) {
      if (error.data?.error === "actNotFound") {
        console.error(`❌ Account not found: ${wallet.classicAddress}. Please fund the wallet.`);
        Alert.alert(
          "Account Not Found",
          `The account ${wallet.classicAddress} is not activated. Please fund it with the Testnet XRP Faucet and try again.`
        );
      } else {
        console.error(`❌ Error checking account activation for ${wallet.classicAddress}:`, error);
        Alert.alert(
          "Error",
          `Failed to check activation for account ${wallet.classicAddress}. Please try again later.`
        );
      }
      return false;
    }
  };

  // 🔹 Handle Buy Now
  const handleBuyNow = async () => {
    if (!listing || !id || !wallet || !client) {
      Alert.alert("Error", "Ensure the listing, wallet, and client are initialized.");
      return;
    }

    if (!await checkAccountActivated()) return;

    const buyNowPrice = listing.currentBid > 0 ? listing.currentBid * 1.5 : listing.startingBid * 1.5;

    try {
      setLoading(true);

      const buyNowPriceInDrops = xrpl.xrpToDrops(buyNowPrice);

      const preparedTx = await client.autofill({
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Amount: buyNowPriceInDrops,
        Destination: ownerAddress, // Seller's XRP wallet
      });

      // Use demoSignTransaction to dynamically reconstruct and sign
      const signedTx = demoSignTransaction(preparedTx, wallet);

      const result = await client.submitAndWait(signedTx.tx_blob);

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        Alert.alert(
          "Success",
          `Purchase completed! Transaction Hash: ${result.result.hash}`
        );

        const docRef = doc(db, "listings", id);
        await updateDoc(docRef, { status: "sold" });

        console.log("Purchase successful:", result);
      } else {
        Alert.alert(
          "Transaction Failed",
          `Error: ${result.result.meta.TransactionResult} for account ${wallet.classicAddress}`
        );
      }
    } catch (error) {
      console.error(`❌ Error processing XRPL transaction for account ${wallet.classicAddress}:`, error);
      Alert.alert(
        "Error",
        `Failed to complete the purchase for account ${wallet.classicAddress}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!listing || !listing.auctionEnd) return;

    const timer = setInterval(async () => {
      const currentTime = Date.now();

      if (currentTime >= listing.auctionEnd.toMillis()) {
        clearInterval(timer);

        if (listing.highestBid) {
          try {
            console.log("🔔 Auction has ended. Processing for highest bidder...");

            // Mark as sold and process payment
            await closeBid();

            const docRef = doc(db, "listings", id);
            await updateDoc(docRef, { status: "sold" });

            Alert.alert("Auction Ended", `The auction has ended, and the winner is ${listing.highestBid}!`);
          } catch (error) {
            console.error("❌ Error processing post-auction:", error);
          }
        } else {
          console.log("🔔 Auction ended with no bids.");
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [listing]);


  const closeBid = async () => {
    if (!listing || !wallet || !client) {
      console.error("❌ Ensure the listing, wallet, and client are initialized.");
      return;
    }
  
    try {
      console.log(`🔄 Processing payment for listing: ${listing.id}`);

      const buyerWallet = listing.highestBid;
      const highestBidInDrops = xrpl.xrpToDrops(listing.currentBid); // Convert to drops (smallest XRP unit)
  
      // Prepare transaction
      const preparedTx = await client.autofill({
        TransactionType: "Payment",
        Account: buyerWallet, // Seller's wallet
        Amount: highestBidInDrops,
        Destination: ownerAddress, // Owner's XRP wallet
      });
  
      // Sign and submit transaction
      const signedTx = demoSignTransaction(preparedTx, wallet);

      const result = await client.submitAndWait(signedTx.tx_blob);
  
      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        console.log(`✅ Payment successful for listing: ${listing.name}`);
        console.log(`Transaction Hash: ${result.result.hash}`);
  
        // Update Firestore to mark as sold
        const docRef = doc(db, "listings", listing.id);
        await updateDoc(docRef, {
          status: "sold",
          transactionHash: result.result.hash,
        });
  
        Alert.alert("Success", "The payment has been processed successfully.");
      } else {
        console.error(`❌ Payment failed: ${result.result.meta.TransactionResult}`);
        Alert.alert("Error", `Payment failed: ${result.result.meta.TransactionResult}`);
      }
    } catch (error) {
      console.error("❌ Error during payment processing:", error);
      Alert.alert("Error", "An error occurred during payment processing. Please try again.");
    }
  };
  

  // 🔹 Handle Bid (No money deduction)
  const handleBid = async () => {
    if (!listing || !id || !wallet || !client) {
      Alert.alert("Error", "Ensure the listing, wallet, and client are initialized.");
      return;
    }

    console.log("Before time check");
    const currentTime = Date.now();;
    console.log("Current Time:", currentTime);
    if (currentTime < listing.auctionStart.toMillis() || currentTime > listing.auctionEnd.toMillis()) {
      Alert.alert("Error", "Bidding is not allowed at this time.");
      console.log("Time check failed.");
      return;
    }
    console.log("Time check passed.");


    if (!await checkAccountActivated()) return;

    const bidAmount = parseFloat(bid);
    if (isNaN(bidAmount) || bidAmount <= listing.currentBid) {
      Alert.alert("Error", "Your bid must be higher than the current bid.");
      return;
    }

    try {
      setLoading(true);

      const bidInDrops = xrpl.xrpToDrops(bidAmount);

      // Only reflect the bid in the Firestore listing, without reducing the wallet balance.
      const docRef = doc(db, "listings", id);
      await updateDoc(docRef, { currentBid: bidAmount, highestBid: wallet.classicAddress });

      Alert.alert("Success", `Bid placed successfully! Your bid: ${bidAmount} XRP`);

      console.log("Bid placed successfully, but no wallet deduction:", bidAmount);
    } catch (error) {
      console.error(`❌ Error placing bid for account ${wallet.classicAddress}:`, error);
      Alert.alert(
        "Error",
        `Failed to place the bid for account ${wallet.classicAddress}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!listing) return <ActivityIndicator size="large" color="#0000ff" />;

  const buyNowPrice = listing.currentBid > 0 ? listing.currentBid * 1.5 : listing.startingBid * 1.5;

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View className="w-full h-full justify-start px-4 py-10">
          {listing.image && (
            <Image
              source={{ uri: listing.image }}
              style={{ width: '100%', height: 200, resizeMode: 'cover' }}
            />
          )}

          <View className="justify-center items-center">
            <Text className="text-black font-rubik-bold mt-4 text-3xl mb-4">Name: {listing.name}</Text>
          </View>
          <View className="justify-center ml-6">
            <Text className="text-primary-300 font-rubik-bold mt-4 text-2xl">Starting Bid: {listing.startingBid} XRP</Text>
            <Text className="text-danger font-rubik-bold mt-4 text-2xl">Current Bid: {listing.currentBid} XRP</Text>
            <Text className="text-green-500 font-rubik-bold mt-4 text-2xl">Buy Now Price: {buyNowPrice.toFixed(2)} XRP</Text>
          </View>

          <View className="mt-6">
            <Button
              title={`Buy Now for ${buyNowPrice.toFixed(2)} XRP`}
              handlePress={handleBuyNow}
              containerStyles="mt-7 bg-primary-400 p-3 rounded-xl"
              textStyles="text-white"
              disabled={loading}
            />
            {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}
          </View>

          <View className="mt-6">
          <TextInput
            placeholder="Enter your bid amount"
            value={bid}
            onChangeText={setBid}
            keyboardType="numeric"
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
            }}
            placeholderTextColor="#888"  // Change this to the desired color
          />

            <Button
              title="Place Bid"
              handlePress={handleBid}
              containerStyles="mt-7 bg-primary-400 p-3 rounded-xl"
              textStyles="text-white"
              disabled={loading || !bid}
            />
            {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ListingDetails;