import React, { useContext, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native'
import { RoomContext } from '../context/roomContext'
import Edit from './icons/Edit'
import EditMainLinks from './EditMainLinks'
import { AuthContext } from '../context/authContext'

const MainLinks = ({ onRefresh }) => {
  const [visible, setVisible] = useState(false)
  const { activeRoom } = useContext(RoomContext)
  const { authState } = useContext(AuthContext)

  const getLink = number => {
    if (activeRoom) {
      const { links } = activeRoom
      return links[number]
    }
    return ''
  }

  const handleClick = url => {
    if (!url) {
      return
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        console.log("Don't know how to open URI: " + url)
      }
    })
  }

  console.log('ACTIVE', activeRoom)

  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text>Funded Local Link:{' '}</Text>
        {getLink(0) ? (
          <TouchableOpacity onPress={() => handleClick(getLink(0))}>
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
              {getLink(0)}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.text}>
        <Text>Link 1:{' '}</Text>
        {getLink(1) ? (
          <TouchableOpacity onPress={() => handleClick(getLink(1))}>
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
              {getLink(1)}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {activeRoom && authState && activeRoom?.ownerId === authState.userInfo.id ? (
        <>
          <TouchableOpacity style={styles.editIcon} onPress={() => setVisible(true)}>
            <Edit fill={'black'} size={22} />
          </TouchableOpacity>
          <EditMainLinks visible={visible} setVisible={setVisible} onRefresh={onRefresh} />
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    position: 'relative'
  },
  text: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    marginBottom: 5,
    color: 'rgb(28, 28, 30)',
    fontWeight: 'normal',
    width: '100%'
  },
  editIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2
  },
  label: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    maxWidth: 200
  }
})

export default MainLinks
