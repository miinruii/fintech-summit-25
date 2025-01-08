import { Text, View, Image, ScrollView } from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

import images from '@/constants/images';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { auth, db } from '@/firebase.config';

export default function App() {
    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView contentContainerStyle={{ height: '100%'}}>
                <View className="w-full min-h-[85vh] justify-center items-center px-4">
                    <Image
                        source={images.logo}
                        className={"w-[200px] h-[100px]"}
                        resizeMode='contain'
                    />
                        
                    <View className="relative mt-3">
                        <Text className="text-6xl text-black font-rubik text-center px-3">Welcome to  {' '}
                            <Text className="text-black font-rubik">SwiftBid {''}</Text> 
                        </Text>
                    </View>

                    <Button
                        title="Sign in"
                        handlePress={() => router.push('/sign-in')}
                        containerStyles="w-full mt-7"
                    />

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}