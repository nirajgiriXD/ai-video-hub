import {
  View,
  Text,
  Image,
  FlatList,
  TextStyle,
  ViewStyle,
  ImageStyle,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import * as Animatable from "react-native-animatable";
import { CustomAnimation } from "react-native-animatable";
import { icons } from "@/constants";
import { Video, ResizeMode } from "expo-av";

export interface TrendingVideosProp {
  $id: string;
  title: string;
  thumbnail: string;
  prompt: string;
  video: string;
  creator: {
    username: string;
    avatar: string;
  };
}

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
} as CustomAnimation<TextStyle & ViewStyle & ImageStyle>;

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
} as CustomAnimation<TextStyle & ViewStyle & ImageStyle>;

const TrendingVideoItem = ({
  activeItem,
  item,
}: {
  activeItem: string;
  item: TrendingVideosProp;
}) => {
  const [playing, setPlaying] = useState(false);

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {playing ? (
        <Video
          source={{ uri: item.video }}
          className="w-52 h-72 mt-3 rounded-[35px] bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls={true}
          shouldPlay={true}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlaying(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="relative justify-center items-center"
          onPress={() => setPlaying(true)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className="w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image source={icons.play} className="h-12 w-12 absolute" />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const TrendingVideos = ({ posts }: { posts: TrendingVideosProp[] }) => {
  const [activeItem, setActiveItem] = useState("");

  const viewableItemsChanged = ({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems.length) {
      setActiveItem(viewableItems[0].item.$id);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => {
        return <TrendingVideoItem activeItem={activeItem} item={item} />;
      }}
      horizontal={true}
      ListEmptyComponent={() => {
        return <Text>Empty</Text>;
      }}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{
        x: 160,
        y: 0,
      }}
    />
  );
};

export default TrendingVideos;
