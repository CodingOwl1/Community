import React, { useCallback, useContext, useEffect } from 'react'
import { StyleSheet, View, FlatList, Text, StatusBar, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@react-navigation/native'

import axios from '../utils/fetcher'
import { AuthContext } from '../context/authContext'
import { ThemeContext } from '../context/themeSwichContext'

import CategoryPicker from '../components/CategoryPicker'
import Post from '../components/Post'
import PostLoader from '../components/PostLoader'
import CategoryLoader from '../components/CategoryLoader'
import JoinRoom from '../components/JoinRoom'
import { RoomContext } from '../context/roomContext'
import instanceAxios from '../utils/fetcher'
import messaging from '@react-native-firebase/messaging'
import BannerImage from '../components/BannerImage'

export const getCategories = async () => {
  return await axios.get('/default_category')
}

const updateRoomData = async activeRoom => {
  const response = await instanceAxios.get(`room/${activeRoom.id}`)
  const responseData = await response.data
  if (responseData.status === 'error') {
    return null
  } else {
    return responseData
  }
}

const Header = ({ category, defaultCategories, setCategory, imageSrc, onRefresh }) => {
  return (
    <>
      <BannerImage imageSrc={imageSrc} onRefresh={onRefresh} />
      <CategoryPicker
        selectedCategory={category}
        defaultCategories={defaultCategories}
        onClick={setCategory}
        addAll
      />
    </>
  )
}

const Home = ({ navigation }) => {
  const { authState } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const { colors } = useTheme()
  const { activeRoom, setActiveRoom } = useContext(RoomContext)
  const [postData, setPostData] = React.useState(null)
  const [category, setCategory] = React.useState('all')
  const [isLoading, setIsLoaading] = React.useState(false)
  const [showJoinRoom, setShowJoinRoom] = React.useState(false)
  const [defaultCategories, setDefaultCategories] = React.useState([])

  useEffect(() => {
    checkNotification()
  }, [checkNotification])

  const checkNotification = async () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('onNotificationOpenedApp', remoteMessage)
      const { data } = remoteMessage
      const { type, remoteUser } = data
      const remoteUserJson = JSON.parse(remoteUser)
      console.log('remoteUserJson', remoteUserJson)
      switch (type) {
        case 'message':
          return navigation.navigate('Chat', { remoteUser: remoteUserJson })
      }
    })
  }

  const getPostData = React.useCallback(async () => {
    setIsLoaading(true)
    const { data } = await axios.get(
      !category || category === 'all' ? 'posts' : `posts/${category}`
    )
    setPostData(data)
    setIsLoaading(false)
  }, [category])

  const handleActiveRoomPosts = useCallback(async () => {
    console.log('getting room posts', activeRoom)
    const response = await instanceAxios.get(`room/posts/${activeRoom.id}`)
    const responseData = await response.data
    console.log('responseData', responseData)
    if (responseData.status === 'error') {
      return
    }
    setPostData(responseData.data)
  }, [activeRoom])

  useEffect(() => {
    if (activeRoom && category === 'all') {
      handleActiveRoomPosts()
    } else {
      getPostData()
    }
  }, [activeRoom, getPostData, handleActiveRoomPosts, category])

  React.useEffect(() => {
    if (!activeRoom) {
      getPostData()
      getCategories().then(result => {
        setDefaultCategories(result.data.data)
      })
    }
  }, [activeRoom, getPostData])

  React.useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) {
        const type = url.split('/').length > 2 && url.split('/').slice(-2)[0]
        const id = url.split('/').slice(-1)[0]
        // test app.community://room/invite/6209fd044bbafe2f8210f61c

        if (type === 'invite') {
          if (
            authState &&
            authState.userInfo &&
            authState.userInfo.rooms &&
            authState.userInfo.rooms.indexOf(id) !== -1
          ) {
            return
          }
          setShowJoinRoom(true)
        }
      }
    })
    Linking.addEventListener('url', data => {
      const { url } = data
      if (url) {
        const type = url.split('/').length > 2 && url.split('/').slice(-2)[0]
        const id = url.split('/').slice(-1)[0]
        // test app.community://room/invite/6209fd044bbafe2f8210f61c

        if (type === 'invite') {
          console.log('invite', id, authState && authState.userInfo && authState.userInfo.rooms)
          if (authState && authState.userInfo && authState.userInfo.rooms.indexOf(id) !== -1) {
            return
          }
          console.log('setShowJoinRoom')
          setShowJoinRoom(true)
          console.log('showJoinRoom set to true')
        }
      }
    })
  }, [authState])

  const onRefresh = async () => {
    if (activeRoom) {
      handleActiveRoomPosts()
      const result = await updateRoomData(activeRoom)
      setActiveRoom(result.data)
    } else {
      getPostData()
      getCategories().then(result => {
        setDefaultCategories(result.data.data)
      })
    }
  }

  return (
    <View as={SafeAreaView} style={styles.container}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      <JoinRoom visible={showJoinRoom} setVisible={setShowJoinRoom} />
      {postData ? (
        <FlatList
          data={postData}
          extraData={isLoading}
          refreshing={isLoading}
          onRefresh={onRefresh}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <Header
              category={category}
              defaultCategories={defaultCategories}
              setCategory={setCategory}
              imageSrc={activeRoom ? activeRoom.bannerImage : ''}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponentStyle={[styles.categoryPicker, { backgroundColor: colors.bgColor }]}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text }]}>Ups! Not found any post!</Text>
          }
          renderItem={({ item, index }) =>
            (authState &&
              authState.userInfo &&
              authState.userInfo.reports &&
              authState.userInfo.reports.indexOf(item.id) !== -1) ||
            (authState &&
              authState.userInfo &&
              authState.userInfo.blocks &&
              authState.userInfo.blocks.indexOf(item.author.id) !== -1) ? (
              <></>
            ) : (
              <Post
                index={index}
                swap={item.swap}
                postId={item.id}
                userId={authState && authState.userInfo && authState.userInfo.id}
                score={item.score}
                type={item.type}
                title={item.title}
                author={item.author}
                category={item.category}
                text={item.text}
                comments={item.comments}
                created={item.created}
                url={item.url}
                votes={item.votes}
                views={item.views}
                setIsLoaading={setIsLoaading}
                setData={setPostData}
                deleteButton={false}
              />
            )
          }
        />
      ) : (
        <>
          <CategoryLoader />
          {[1, 2, 3, 4, 5].map(i => (
            <PostLoader key={i} />
          ))}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  categoryPicker: {
    padding: 5,
    marginVertical: 7,
    elevation: 3
  },
  empty: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 22
  }
})

export default Home
