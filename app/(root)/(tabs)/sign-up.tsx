import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Link } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection} from "firebase/firestore"

import images from '@/constants/images';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { auth, db } from '@/firebase.config';


const SignUp = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {
        
        setIsSubmitting(true);

        try {
            const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const userDocRef = doc(collection(db, "users"), user.uid);
            await setDoc(userDocRef, {
                email: user.email,
            }); 
        } catch (error) {
            setIsSubmitting(false);
            console.error('Error signing up:', error.code, error.message);
            if (error.code === 'auth/invalid-email') {
                Alert.alert("Invalid email format", "Please enter a valid email address.");
            } else if (error.code == 'auth/email-already-in-use') {
                Alert.alert("Email already exists", "Try another email.")
            } else if (error.code == 'auth/weak-password') {
                Alert.alert("Invalid password", "Password needs to be longer than 6 characters.")
            } else {
                Alert.alert("Sign Up Error", "Please try again.")
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="bg-bgc h-full">
            <ScrollView>
                <View className="w-full h-full justify-center px-4 py-10">
                    <Image
                        source={images.logo}
                        className={"w-[190px] h-[160px]"}
                        resizeMode='contain'
                    />

                    <Text className="text-black text-2xl font-rubik">Sign up
                        <Text className="text-black text-2xl font-rubik">:</Text>
                    </Text>

                    <FormField
                        title="Email"
                        placeholder="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({...form, email: e})}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        placeholder="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({...form, password: e})}
                        otherStyles="mt-7"
                        keyboardType="default"
                    />

                    <Button
                        title="Sign up"
                        handlePress={submit}
                        containerStyles="mt-7 bg-primary-300"
                        isLoading={isSubmitting}
                        textStyles="text-white"
                    />

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp