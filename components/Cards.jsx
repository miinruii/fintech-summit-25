import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  item: {
    id: string;
    name: string;
    image: string;
    startingBid: number;
    currentBid: number;
    status?: string; // Sold status (optional)
    auctionStart?: any; // Firestore Timestamp or number (optional)
    auctionEnd?: any; // Firestore Timestamp or number (optional)
  };
  onPress?: () => void;
}

export const Card = ({ item, onPress }: Props) => {
  // Ensure auctionStart and auctionEnd exist
  const auctionStart = item.auctionStart
    ? item.auctionStart.toMillis
      ? item.auctionStart.toMillis()
      : item.auctionStart * 1000 // If it's in seconds
    : null;

  const auctionEnd = item.auctionEnd
    ? item.auctionEnd.toMillis
      ? item.auctionEnd.toMillis()
      : item.auctionEnd * 1000 // If it's in seconds
    : null;

  const currentTime = Date.now();

  console.log("auctionStart:", auctionStart, "auctionEnd:", auctionEnd, "currentTime:", currentTime);

  // Determine Auction Status
  let statusText = "Available for Bidding";
  let statusColor = "text-green-500";

  if (item.status === "sold") {
    statusText = "Sold";
    statusColor = "text-red-500";
  } else if (!auctionStart || !auctionEnd) {
    statusText = "Auction Data Missing";
    statusColor = "text-gray-500";
  } else if (currentTime < auctionStart) {
    statusText = "Auction Not Started";
    statusColor = "text-yellow-500";
  } else if (currentTime > auctionEnd) {
    statusText = "Auction Ended";
    statusColor = "text-gray-500";
  }

  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70"
      onPress={onPress}
    >
      <View className="flex flex-row justify-between mt-1">
        <Text className="text-sm font-rubik-extrabold text-gray-500 mb-2">
          {item.name}
        </Text>
      </View>

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
      <Text className={`mt-2 text-sm font-rubik-bold ${statusColor}`}>
        {statusText}
      </Text>
    </TouchableOpacity>
  );
};
