import { View, Text, FlatList, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase.config'; // Firebase initialization
import { Card } from '@/components/Cards'; // Ensure correct path
import { useRouter } from 'expo-router'; // Import the useRouter hook

const Buy = () => {
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // Track refresh state
  const router = useRouter(); // Initialize the router

  const fetchListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "listings"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Default status to "available for bidding" if not set in Firestore
        status: doc.data().status || "available for bidding", 
      }));

      // Sort items: available items come first, sold items at the bottom
      const sortedData = data.sort((a, b) => {
        if (a.status === "sold" && b.status !== "sold") return 1;
        if (a.status !== "sold" && b.status === "sold") return -1;
        return 0; // Keep the order for items with the same status
      });

      setListings(sortedData);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchListings(); 
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-xl font-rubik-bold text-black-300">Up for Bidding</Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card 
            item={item} 
            onPress={() => router.push({ pathname: "/details", params: { id: item.id } })} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        } 
      />
    </SafeAreaView>
  );
};

export default Buy;
