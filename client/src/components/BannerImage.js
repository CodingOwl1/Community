import React, { useContext, useState } from 'react'
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native'
import defaultRoomBanner from '../assets/images/community.png'
import { RoomContext } from '../context/roomContext'
import Edit from '../components/icons/Edit'
import EditBannerImage from './EditBannerImage'

const BannerImage = ({ imageSrc, onRefresh }) => {
  const { activeRoom } = useContext(RoomContext)
  const [visible, setVisible] = useState(false)
  console.log('ROOM', activeRoom)
  return (
    <View style={styles.container}>
      {activeRoom && (!activeRoom.bannerImage || !activeRoom.bannerImage.length) ? (
        <Text style={styles.text}>Missing Banner</Text>
      ) : (
        <>
          <Image
            style={[styles.image, { transform: [{ scale: imageSrc ? 1 : 0.7 }] }]}
            source={imageSrc ? { uri: imageSrc } : defaultRoomBanner}
          />
        </>
      )}
      {activeRoom ? (
        <>
          <TouchableOpacity style={styles.editIcon} onPress={() => setVisible(true)}>
            <Edit />
          </TouchableOpacity>
          <EditBannerImage
            visible={visible}
            onRefresh={onRefresh}
            setVisible={setVisible}
            roomId={activeRoom.id}
          />
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 170,
    backgroundColor: '#50BDE4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  image: {
    height: 170,
    width: '100%',
    resizeMode: 'cover'
  },
  text: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 2
  }
})

export default BannerImage
