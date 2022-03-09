import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import instanceAxios from '../utils/fetcher'
import Button from './Button'
import { Plus } from './icons/index'
import uploadImage from '../utils/uploadImage'
import Modal from 'react-native-modal'

export default function EditBannerImage({ visible, setVisible, roomId, onRefresh }) {
  const { colors } = useTheme()
  const [bannerImage, setBannerImage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)

  const resetState = () => {
    setBannerImage('')
    setLoading(false)
    setCreated(false)
    setError('')
  }

  useEffect(() => {
    return () => resetState()
  }, [])

  const handleImage = name => {
    try {
      ImagePicker.openPicker({
        width: 550,
        height: 550,
        cropping: true,
        multiple: false
      }).then(async image => {
        setBannerImage(image.path)
      })
    } catch (err) {
      console.log('error picking images', err)
    }
  }

  const handleUpdateBanner = async () => {
    if (!bannerImage.length) {
      return setError('Please Choose a banner image')
    }
    setLoading(true)
    const uploadImageResponse = await uploadImage(bannerImage)
    if (uploadImageResponse.err) {
      setLoading(false)
      return uploadImageResponse.err
    }
    const payload = {
      imageUrl: uploadImageResponse.url,
      roomId
    }
    const response = await instanceAxios.patch('room/update_banner', payload)
    const responseData = await response.data
    setLoading(false)
    if (responseData.status === 'error') {
      return
    }
    onRefresh()
    setCreated(true)
  }

  return (
    <Modal isVisible={visible} style={[styles.modal, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.background} />

      <TouchableOpacity
        onPress={() => {
          resetState()
          setVisible(false)
        }}
        style={{ position: 'absolute', right: 15, top: '10%', zIndex: 1000 }}
      >
        <Text style={{ color: colors.primary }}>Close</Text>
      </TouchableOpacity>

      {created ? (
        <View style={styles.successContainer}>
          <Text>Banner Updated Successfully!</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modal, { backgroundColor: colors.background }]}>
              <Text style={[styles.heading, { marginLeft: '10%', color: colors.text }]}>
                Choose Banner Image
              </Text>
              <TouchableWithoutFeedback onPress={handleImage}>
                <View style={[styles.bannerImage, { backgroundColor: colors.bgColor }]}>
                  {bannerImage ? (
                    <Image
                      style={[styles.bannerImage, { width: '100%' }]}
                      source={{ uri: bannerImage }}
                    />
                  ) : (
                    <Plus color={colors.text} />
                  )}
                </View>
              </TouchableWithoutFeedback>
              {error ? (
                <Text style={[styles.error, { textAlign: 'center' }]}>Please choose an image</Text>
              ) : null}
              <View style={{ marginTop: 20 }}>
                <Button onPress={handleUpdateBanner} title="Submit" bgColor={colors.signUpButton}>
                  {loading && <ActivityIndicator color="#fff" />}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
    paddingVertical: '20%'
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,

    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  bannerImage: {
    width: '80%',
    height: 150,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  heading: {
    fontSize: 20,
    marginTop: 25,
    fontWeight: 'bold'
  },
  input: {
    width: '80%',
    borderBottomWidth: 0.5,
    alignSelf: 'center',
    marginTop: 15
  },
  error: {
    color: 'crimson',
    marginTop: 2,
    fontSize: 12
  },
  tick: {
    height: 100,
    width: 100
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
