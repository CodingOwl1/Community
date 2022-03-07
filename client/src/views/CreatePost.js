import React, { useContext, useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  Switch,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@react-navigation/native'

import axios from '../utils/fetcher'
import { Formik } from 'formik'
import * as Yup from 'yup'

import { Plus } from '../components/icons'
import CategoryPicker from '../components/CategoryPicker'
import { RoomContext } from '../context/roomContext'
import ImagePicker from 'react-native-image-crop-picker'
import uploadImage from '../utils/uploadImage'
import {getCategories} from "./Home";

const TypeSwichContainer = ({ children }) => {
  return <View style={styles.typeContainer}>{children}</View>
}

const TypeSwichButton = ({ selected, onClick, type }) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.typeButton,
        type === 'photo' ? styles.typeButtonRight : styles.typeButtonLeft,
        selected === type ? { backgroundColor: colors.blue } : '',
        { borderColor: colors.border }
      ]}
      onPress={() => onClick('type', type)}
    >
      <View>
        <Text
          style={[
            styles.typeButtonLabel,
            { color: colors.text },
            selected === type ? { color: 'white' } : ''
          ]}
        >
          {type}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const CreatePost = () => {
  const { colors } = useTheme()
  const { activeRoom } = useContext(RoomContext)
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState(null)
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const [swapEnabled, setSwapEnabled] = useState(false)
  const toggleSwitch = () => setSwapEnabled(previousState => !previousState)
  const [defaultCategories, setDefaultCategories] = React.useState([])

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true
    }).start()

    setTimeout(() => {
      setMessage(null)
    }, 6000)
  }

  React.useEffect(() => {
    if (!activeRoom) {
      getCategories().then(result => {
        setDefaultCategories(result.data.data)
      })
    }
  }, [activeRoom])

  return (
    <ScrollView as={SafeAreaView} style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <Formik
        initialValues={{
          type: 'text',
          category: '',
          title: '',
          url: '',
          text: ''
        }}
        onSubmit={async (values, { setStatus, resetForm }) => {
          console.log('onSubmit', values)
          setIsLoading(true)
          try {
            let payload
            if (values.url.length) {
              const uploadImageResponse = await uploadImage(values.url)
              console.log('uplodaImageResponse', uploadImageResponse)
              if (uploadImageResponse.err) return err

              payload = activeRoom
                ? {
                    ...values,
                    inRoom: activeRoom.id,
                    swap: swapEnabled,
                    url: uploadImageResponse.url
                  }
                : { ...values, swap: swapEnabled, url: uploadImageResponse.url }
            } else {
              payload = activeRoom
                ? {
                    ...values,
                    inRoom: activeRoom.id,
                    swap: swapEnabled
                  }
                : { ...values, swap: swapEnabled }
            }

            console.log('payload', payload)
            await axios.post('posts', payload)
            resetForm({ ...values, type: 'text' })
            setMessage('Successfully Created!')
            fadeIn()
          } catch (error) {
            console.log('error', error)
            setStatus(error.response.data.message)
          }
          setIsLoading(false)
        }}
        validationSchema={Yup.object({
          type: Yup.mixed().oneOf(['text', 'photo']),
          category: Yup.string().required('Required'),
          title: Yup.string()
            .required('Required')
            .max(100, 'Must be at most 100 characters long'),
          text: Yup.string().when('type', {
            is: 'text',
            then: Yup.string()
              .required('Required')
              .min(4, 'Must be at least 4 characters long'),
            otherwise: Yup.string().min(4, 'Must be at least 4 characters long')
          }),
          url: Yup.string().when('type', {
            is: 'photo',
            then: Yup.string()
              .required('Required')
              .url('Invalid Url')
          })
        })}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          touched,
          errors,
          status,
          values,
          setFieldValue
        }) => (
          <View>
            {message && (
              <Animated.View
                style={{
                  opacity: fadeAnim
                }}
              >
                {!!message && <Text style={styles.message}>{message}</Text>}
              </Animated.View>
            )}
            {!!status && <Text style={styles.status}>{status}</Text>}
            <View style={styles.flexRow}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Type</Text>
              {touched.type && errors.type && (
                <Text style={styles.errorMessage}>{errors.type}</Text>
              )}
            </View>
            <TypeSwichContainer>
              <TypeSwichButton selected={values.type} onClick={setFieldValue} type="text" />
              <TypeSwichButton selected={values.type} onClick={setFieldValue} type="photo" />
            </TypeSwichContainer>
            <View style={styles.flexRow}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Category</Text>
              {touched.category && errors.category && (
                <Text style={styles.errorMessage}>{errors.category}</Text>
              )}
            </View>
            <CategoryPicker
              defaultCategories={defaultCategories}
              selectedCategory={values.category}
              setFieldValue={setFieldValue}
            />

            <View style={styles.flexRow}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Title / Topic</Text>
              {touched.title && errors.title && (
                <Text style={styles.errorMessage}>{errors.title}</Text>
              )}
            </View>

            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text, height: 40 },
                touched.title && errors.title && { borderColor: colors.red }
              ]}
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
            />

            {values.type === 'photo' ? (
              <>
                <View style={styles.flexRow}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Photo</Text>
                  {touched.url && errors.url && (
                    <Text style={styles.errorMessage}>{errors.url}</Text>
                  )}
                </View>
                {values.url ? (
                  <Image source={{ uri: values.url }} style={styles.image} />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      try {
                        ImagePicker.openPicker({
                          width: 550,
                          height: 550,
                          cropping: true,
                          multiple: false
                        }).then(async image => {
                          setFieldValue('url', image.path)
                        })
                      } catch (err) {
                        console.log('error picking images', err)
                      }
                    }}
                  >
                    <Text style={[styles.formLabel, { color: colors.primary }]}>Choose photo</Text>
                  </TouchableOpacity>
                )}
                {/* <TextInput
                  style={[
                    styles.textInput,
                    { borderColor: colors.border, color: colors.text },
                    touched.url && errors.url && { borderColor: colors.red }
                  ]}
                  multiline
                  value={values.url}
                  onChangeText={handleChange('url')}
                  onBlur={handleBlur('url')}
                /> */}
              </>
            ) : (
              <>
                <View style={styles.flexRow}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Text</Text>
                  {touched.text && errors.text && (
                    <Text style={styles.errorMessage}>{errors.text}</Text>
                  )}
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    { borderColor: colors.border, color: colors.text },
                    touched.text && errors.text && { borderColor: colors.red }
                  ]}
                  multiline
                  value={values.text}
                  onChangeText={handleChange('text')}
                  onBlur={handleBlur('text')}
                />
              </>
            )}
            <View style={[styles.flexRow, { justifyContent: 'space-between' }]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Topic Suggestion</Text>
              <Switch onValueChange={toggleSwitch} value={swapEnabled} />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.blue }]}
                onPress={() => {
                  console.log('handleSubmit')
                  handleSubmit()
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Plus color="white" />
                )}
                <Text style={styles.submitButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 7
  },
  typeContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10
  },
  typeButton: {
    flex: 0.5,
    justifyContent: 'center',
    height: 30,
    borderWidth: 1
  },
  typeButtonLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  typeButtonRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  },
  typeButtonLabel: {
    textAlign: 'center',
    textTransform: 'capitalize',
    fontFamily: 'OpenSans-SemiBold'
  },
  textInput: {
    borderWidth: 1,
    textAlignVertical: 'top',
    marginTop: 5,
    paddingLeft: 10
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 40,
    borderRadius: 10,
    flex: 0.4
  },
  formLabel: {
    fontFamily: 'OpenSans-ExtraBold',
    fontSize: 16
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15
  },
  status: {
    color: 'red',
    marginVertical: 15,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center'
  },
  errorMessage: {
    color: 'red',
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 15
  },
  flexRow: {
    flexDirection: 'row',
    marginTop: 15
  },
  message: {
    color: '#5b715d',
    marginVertical: 15,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    borderRadius: 10
  },
  image: {
    alignSelf: 'center',
    width: 200,
    height: 200
  }
})

export default CreatePost
