import { View, Text, ActivityIndicator, ScrollView, TextInput, Button, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase.config';

const ListingDetails = () => {
  const route = useRoute();
  const id = (route.params as { id: string })?.id; 

  const [listing, setListing] = useState<Record<string, any> | null>(null);
  const [bid, setBid] = useState(""); // New state for bid input
  const [loading, setLoading] = useState(false); // For bid submission

  useEffect(() => {
    if (!id) {
      console.error("❌ No ID provided to fetch listing details");
      return;
    }

    const fetchListingDetails = async () => {
      try {
        console.log(`🔍 Fetching listing for ID: ${id}`);
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Listing found:", docSnap.data());
          setListing(docSnap.data());
        } else {
          console.log("❌ No such document in Firestore!");
        }
      } catch (error) {
        console.error("❌ Error fetching listing details:", error);
      }
    };

    fetchListingDetails();
  }, [id]);

  // 🔹 Function to handle bid submission
  const placeBid = async () => {
    if (!listing || !id) return;
    const bidAmount = parseFloat(bid);

    if (isNaN(bidAmount) || bidAmount <= listing.currentBid) {
      Alert.alert("Invalid Bid", "Your bid must be higher than the current bid.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "listings", id);
      await updateDoc(docRef, { currentBid: bidAmount });

      // Update local state immediately
      setListing((prev) => ({ ...prev, currentBid: bidAmount }));
      setBid(""); // Clear input

      Alert.alert("Success", "Your bid has been placed!");
    } catch (error) {
      console.error("❌ Error placing bid:", error);
      Alert.alert("Error", "Failed to place bid.");
    } finally {
      setLoading(false);
    }
  };

  if (!listing) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          {/* Display the image */}
          {listing.image && (
            <Image
              source={{ uri: listing.image }}
              style={{ width: '100%', height: 200, resizeMode: 'cover' }}
            />
          )}

          <View className='justify-center items-center'>
            <Text className="text-primary-300 font-rubik mt-4 text-sm mb-4">ID: {id}</Text>
            <Text className="text-primary-400 font-rubik-bold mt-4 text-3xl mb-4">Name: {listing.name} </Text>
            <Text className="text-primary-300 font-rubik mt-4 text-2xl mb-4">Starting Bid: ${listing.startingBid}</Text>
            <Text className="text-danger font-rubik-bold mt-4 text-2xl mb-4">Current Bid: ${listing.currentBid}</Text>
          </View>

          <View className="justify-center items-center mt-6">
            <Text className="text-2xl font-bold mb-2">Place Your Bid</Text>
            <TextInput 
              className="border border-gray-300 rounded-md p-2 w-60 text-center" 
              placeholder="Enter your bid amount"
              keyboardType="numeric"
              value={bid}
              onChangeText={setBid}
            />
            <Button title={loading ? "Placing Bid..." : "Submit Bid"} onPress={placeBid} disabled={loading} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ListingDetails;
