import { useTheme } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import instanceAxios from '../utils/fetcher'
import Button from './Button'
import Modal from 'react-native-modal'
import { RoomContext } from '../context/roomContext'

export default function EditMainLinks({ visible, setVisible, onRefresh }) {
  const { colors } = useTheme()
  const { activeRoom } = useContext(RoomContext)
  const [link1, setLink1] = useState(activeRoom?.links?.[0] ?? '')
  const [link2, setLink2] = useState(activeRoom?.links?.[1] ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)
  const roomId = activeRoom?.id

  const resetState = () => {
    setLoading(false)
    setCreated(false)
    setError('')
  }

  useEffect(() => {
    return () => resetState()
  }, [])

  const handleUpdateLinks = async () => {
    if (!link1.length && !link2.length) {
      return setError('Please Enter Links First')
    }

    setLoading(true)
    const payload = {
      links: [link1, link2],
      roomId
    }
    const response = await instanceAxios.patch('room/update_links', payload)
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
          <Text>Links Updated Successfully!</Text>
        </View>
      ) : (
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <Text style={[styles.heading, { marginLeft: '10%', color: colors.text }]}>Link 1:</Text>
          <TextInput
            style={[styles.input, { borderBottomColor: 'grey', color: colors.text }]}
            placeholder="https://exmaple.com"
            placeholderTextColor={'grey'}
            autoCapitalize={'none'}
            autoCorrect={false}
            value={link1}
            onChangeText={e => setLink1(e)}
          />
          <Text style={[styles.heading, { marginLeft: '10%', color: colors.text }]}>Link 2:</Text>
          <TextInput
            style={[styles.input, { borderBottomColor: 'grey', color: colors.text }]}
            placeholder="https://exmaple.com"
            placeholderTextColor={'grey'}
            value={link2}
            autoCapitalize={'none'}
            autoCorrect={false}
            capitalize={false}
            onChangeText={e => setLink2(e)}
          />
          <View style={{ marginTop: 20, height: 70 }}>
            <Button onPress={handleUpdateLinks} title="Submit" bgColor={colors.signUpButton}>
              {loading && <ActivityIndicator color="#fff" />}
            </Button>
          </View>
          {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
        </View>
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
  input: {
    width: '80%',
    borderBottomWidth: 0.5,
    alignSelf: 'center',
    marginTop: 15
  },
  heading: {
    fontSize: 20,
    marginTop: 25,
    fontWeight: 'bold'
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
