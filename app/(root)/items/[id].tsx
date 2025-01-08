import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const item = () => {
  const {id} = useLocalSearchParams();
  return (
    <View>
      <Text>item {id}</Text>
    </View>
  )
}

export default item