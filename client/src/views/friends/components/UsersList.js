import AsyncStorage from '@react-native-community/async-storage'
import { useTheme } from '@react-navigation/native'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { AuthContext } from '../../../context/authContext'
import axios from '../../../utils/fetcher'
import styles from './styles'

export default function({ navigation, users, setUsers }) {
  const { authState, setAuthState } = useContext(AuthContext)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    const response = await axios.get(`user/id/${authState.userInfo.id}`)
    const data = await response.data
    setAuthState({ ...authState, userInfo: data.user })
    await AsyncStorage.setItem('userInfo', JSON.stringify(data.user))
    setRefreshing(false)
  }

  const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

  return (
    <FlatList
      style={{ marginTop: 20 }}
      refreshControl={refreshControl}
      data={users}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => <Tile item={item} navigation={navigation} />}
    />
  )
}

const Tile = ({ item, navigation }) => {
  const { colors } = useTheme()
  const { authState } = useContext(AuthContext)
  const isFriends = authState.userInfo.friends && authState.userInfo.friends.indexOf(item.id) !== -1
  const [isRequested, setIsRequested] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRequest = async () => {
    setLoading(true)
    const response = await axios.post(
      `/user/request?userId=${authState.userInfo.id}&userToFriendId=${item.id}`
    )
    setLoading(false)
    const data = await response.data
    if (data.status === 'success') {
      setIsRequested(true)
    }
  }

  return item.id === authState.userInfo.id ? (
    <></>
  ) : (
    <>
      <View style={styles.friendTile}>
        <Text style={[styles.friendName, { color: colors.text }]}>{item.username}</Text>

        {isFriends ? (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('Chat', { remoteUser: item })}
          >
            <View style={[styles.friendRequestTileButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.friendName, { color: '#fff' }]}>Message</Text>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <TouchableWithoutFeedback disabled={loading || isRequested} onPress={handleRequest}>
            <View style={[styles.friendRequestTileButton, { backgroundColor: colors.primary }]}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.friendName, { color: '#fff' }]}>
                  {isRequested ? 'Requested' : 'Request'}
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
      <View style={styles.seperator} />
    </>
  )
}
