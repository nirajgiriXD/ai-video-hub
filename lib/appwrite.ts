import { ImagePickerAsset } from "expo-image-picker";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.react_native_crash_course.aora",
  projectId: "6677ba81003678c24269",
  databaseId: "6677bbe3003a5a3b609a",
  userCollectionId: "6677bc020034063ec0b4",
  videoCollectionId: "6677bc280012f3d8a9f8",
  storageId: "6677bdf300326dc3deae",
};

// Init your React Native SDK
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const database = new Databases(client);
const storage = new Storage(client);

export const createUser = async ({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error("Account creation failed");

    const avatarUrl = avatars.getInitials(username);

    await signIn({ email, password });

    const newUser = await database.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const signIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await database.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const searchPosts = async (query: string) => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const posts = await database.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const getFilePreview = async (fileId: string, type: string) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(config.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        config.storageId,
        fileId,
        2000,
        2000,
        "top" as ImageGravity,
        10
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error();

    return fileUrl;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const uploadFile = async (file: ImagePickerAsset, type: string) => {
  if (!file) return;

  const asset = {
    name: file.fileName as string,
    type: file.mimeType as string,
    size: file.fileSize as number,
    uri: file.uri as string,
  };

  try {
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const createVideo = async ({
  thumbnail,
  video,
  title,
  prompt,
  userId,
}: {
  title: string;
  prompt: string;
  thumbnail: ImagePickerAsset | null;
  video: ImagePickerAsset | null;
  userId: string | undefined;
}) => {
  if (!thumbnail || !video || !userId) return;

  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(thumbnail, "image"),
      uploadFile(video, "video"),
    ]);

    const newPost = await database.createDocument(
      config.databaseId,
      config.videoCollectionId,
      ID.unique(),
      {
        title,
        prompt,
        video: videoUrl,
        thumbnail: thumbnailUrl,
        creator: userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error as string);
  }
};
