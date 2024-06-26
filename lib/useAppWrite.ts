import { Alert } from "react-native";
import { useState, useEffect } from "react";
import { Models } from "react-native-appwrite";

const useAppWrite = (callback: () => Promise<Models.Document[]>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([] as Models.Document[]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await callback();
      setData(response);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const reFetch = () => fetchData();

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, reFetch };
};

export default useAppWrite;
