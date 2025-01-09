import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, router, Link } from 'expo-router'
import { getAuth, signInWithEmailAndPassword} from 'firebase/auth'

import images from '@/constants/images';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { auth, db } from '@/firebase.config';

const SignIn = () => {

    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {

        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(auth, form.email, form.password);
            router.push({pathname: '/profile'})    
        } catch (error) {
            setIsSubmitting(false);
            console.error('Error signing up:', error.code, error.message);
            if (error.code === 'auth/invalid-email') {
                Alert.alert("Invalid email format", "Please enter a valid email address.")
            } else if (error.code == 'auth/invalid-credential') {
                Alert.alert("Oops, wrong email/password!", "Please try again.")
            } else if (error.code == 'auth/too-many-requests') {
                Alert.alert("Too many log in attempts", "Please try again later.")
            } else {
                Alert.alert("Sign In Error", "Please try again.")
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <SafeAreaView className="bg-bgc h-full">
            <ScrollView>
                <View className="w-full h-full justify-start px-4">
                    <Image
                        source={images.logo}
                        className={"w-[190px] h-[160px]"}
                        resizeMode='contain'
                    />

                    <Text className="text-black text-2xl font-rubik">Sign in to SwiftBid</Text>

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
                    />

                    <Button
                        title="Sign In"
                        handlePress={submit}
                        containerStyles="mt-7 bg-primary-300"
                        isLoading={isSubmitting}
                    />

                    <View className="justify-center pt-5 flex-row gap-1">
                        <Text className="text-md text-black font-rubik">Don't have an account?</Text>
                        <Link href="/sign-up" className=" underline text-md text-danger font-rubik">Sign up now!</Link>

                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn