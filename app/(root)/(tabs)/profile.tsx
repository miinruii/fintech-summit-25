import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {router} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { auth, db, storage} from '@/firebase.config';
import { doc, setDoc, getDoc, deleteDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ImageViewer from '@/components/ImageViewer';
import icons from "@/constants/icons";


const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    contact: '',
  });
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(collection(db, "users"), user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            username: userData.username || '',
            email: userData.email || '',
            contact: userData.contact || '',
          });
        }
      }
    };

    fetchUserProfile();
  }, []);

  const saveProfile = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const updatedProfile = {
          ...profile,
          email: user.email,
        };

        const userDocRef = doc(collection(db, "users"), user.uid);
        await setDoc(userDocRef, updatedProfile);
        console.log('Profile saved:', updatedProfile);
        Alert.alert('Profile saved successfully!')
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const deleteProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Delete user data from Firestore
        const userDocRef = doc(collection(db, "users"), user.uid);
        await deleteDoc(userDocRef);
  
        // Delete user authentication entry
        await user.delete();
  
        console.log('Profile deleted successfully');
        Alert.alert('Profile deleted successfully!');
  
        // Redirect user to a different screen or log them out
        router.push('/sign-up'); // Adjust the route as needed
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const confirmDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProfile },
      ]
    );
  };
  

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <View className='justify-center flex-center items-center'>
            <Text className="text-primary-300 font-rubik mt-4 text-5xl mb-4">
              User Profile
            </Text>
          </View>

          <View className='border-b border-black'>
            <FormField
              title="Username:"
              value={profile.username}
              handleChangeText={(e) => setProfile({ ...profile, username: e })}
              otherStyles="mt-4 mb-4"
              placeholder="username"
            />
          </View>

          <View className='border-b border-black'>
            <Text className="text-black font-rubik mt-4 text-base mb-4">
              Email: {auth.currentUser.email}
            </Text>
          </View>

          <View className='border-b border-black'>
            <FormField
              title="Contact Number:"
              value={profile.contact}
              handleChangeText={(e) => setProfile({ ...profile, contact: e })}
              keyboardType='phone-pad'
              otherStyles="mt-4 mb-4"
              placeholder="number"
            />
          </View>

        <TouchableOpacity
          onPress={() => router.push({ pathname: 'viewyourposts', params: { userId: auth.currentUser.uid } })}
          activeOpacity={0.7}
          className={`mt-10 bg-primary-300 rounded-xl min-h-[62px] justify-center items-center  `}
        >
          <Text className={`text-white font-rubik `}>
            View your posts
          </Text>
        </TouchableOpacity>

          <Button
            title="Save Profile"
            handlePress={saveProfile}
            containerStyles="mt-7 bg-primary-400 p-3 rounded-xl"
            textStyles="text-white"
            isLoading={isSubmitting}
          />

          <TouchableOpacity onPress={confirmDeleteProfile} className="mt-7 bg-danger p-3 rounded-xl min-h-[62px] justify-center items-center">
            <Text className="font-pbold text-white text-center">Delete Profile</Text>
          </TouchableOpacity>


          

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Profile;
