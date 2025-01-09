import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, keyboardType }) => {
    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="underline text-base text-black font-rubik-bold">{title}</Text>

            <View className='w-full h-16 px-4 bg-primary-200 rounded-2xl focus:border-black items-center flex-row'>
                <TextInput 
                    className="text-black font-rubik text-base"
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={title === "Password"} // Always hide content for password fields
                />
            </View>
        </View>
    );
};

export default FormField;