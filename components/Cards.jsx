import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  item: {
    id: string;
    image: string;
    startingBid: number;
    currentBid: number;
    status: string; // Add status field
  };
  onPress?: () => void;
}

export const Card = ({ item, onPress }: Props) => {
  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70"
      onPress={onPress}
    >
      {/* Image */}
      <Image
        source={{ uri: item.image }}
        className="w-full h-40 rounded-lg"
        resizeMode="cover"
      />

      {/* Pricing Details */}
      <View className="flex flex-row justify-between mt-2">
        <Text className="text-sm font-rubik-bold text-gray-500">
          Starting Bid: {item.startingBid ?? "N/A"} XRP
        </Text>
        <Text className="text-sm font-rubik-bold text-primary-300">
          Current Bid: {item.currentBid ?? "N/A"} XRP
        </Text>
      </View>

      {/* Item Status */}
      <Text
        className={`mt-2 text-sm font-rubik-bold ${
          item.status === "sold" ? "text-red-500" : "text-green-500"
        }`}
      >
        {item.status === "sold" ? "Sold" : "Available for Bidding"}
      </Text>
    </TouchableOpacity>
  );
};
