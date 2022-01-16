import { useTheme } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native'
import { AuthContext } from '../../../context/authContext'
import styles from './styles'
import axios from '../../../utils/fetcher'
import AsyncStorage from '@react-native-community/async-storage'

export default function({ navigation }) {
  const { colors } = useTheme()
  const { authState } = useContext(AuthContext)
  const [requests, setRequests] = useState([])

  useEffect(() => {
    handleGetData()
  }, [])

  const handleGetData = async () => {
    if (!authState.userInfo.requests || !authState.userInfo.requests.length) return
    const response = await axios.get(`users?ids=${authState.userInfo.requests}`)
    const data = await response.data
    if (data.status === 'success') setRequests(data.users)
  }

  const renderItem = ({ item }) => (
    <Tile item={item} navigation={navigation} setRequests={setRequests} />
  )

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={colors.card} />
      <FlatList
        data={requests}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  )
}

const Tile = ({ item, navigation }) => {
  const { colors } = useTheme()
  const { authState, setAuthState } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    const response = await axios.post(
      `user/request/accept?userId=${authState.userInfo.id}&userToAcceptId=${item.id}`
    )
    const data = await response.data
    setLoading(false)
    if (data.status === 'success') {
      setAccepted(true)
      // setRequests(prev => prev.filter(({ id }) => id !== item.id))
      setAuthState({ ...authState, userInfo: data.user })
      await AsyncStorage.setItem('userInfo', JSON.stringify(data.user))
    }
  }

  return (
    <>
      <View style={styles.friendTile}>
        <Text style={[styles.friendName, { color: colors.text }]}>{item.username}</Text>
        {accepted ? (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('Chat', { remoteUser: item })}
          >
            <View style={[styles.friendRequestTileButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.friendName, { color: '#fff' }]}>Message</Text>
            </View>
          </TouchableWithoutFeedback>
        ) : loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <TouchableWithoutFeedback disabled={loading} onPress={handleAccept}>
              <View
                style={[
                  styles.friendRequestTileButton,
                  { marginRight: 5, backgroundColor: colors.primary }
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>Accept</Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback disabled={loading}>
              <View
                style={[
                  styles.friendRequestTileButton,
                  { marginLeft: 5, borderColor: colors.primary, borderWidth: 1 }
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 16 }}>Decline</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>
      <View style={styles.seperator} />
    </>
  )
}
