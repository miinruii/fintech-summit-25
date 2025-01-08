import { Text, View } from "react-native";
import {Link} from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className= "font-rubik text-3xl">Welcome to SwiftBid</Text>
      <Link href = '/sign-in'>Sign In </Link>
      <Link href = '/explore'>Explore </Link>
      <Link href = '/profile'>Profile </Link>
      <Link href = '/items/1'>Item </Link>
      <Link href = '/sign-up'>Sign up </Link>

    </View>
  );
}
