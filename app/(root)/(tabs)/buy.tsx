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

  // 🔹 Fetch listings from Firestore
  const fetchListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "listings"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  // 🔹 Function to handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchListings(); // Fetch updated data
    setRefreshing(false);
  }, []);

  // 🔹 Fetch listings on mount
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