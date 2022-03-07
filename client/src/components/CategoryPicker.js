import React, { useContext } from 'react'
import { StyleSheet, TouchableOpacity, Text, FlatList, View } from 'react-native'
import { useTheme } from '@react-navigation/native'

import categories from '../constants/categories'
import { RoomContext } from '../context/roomContext'

const CategoryPicker = ({
  selectedCategory,
  onClick,
  addAll,
  setFieldValue,
  defaultCategories,
  ...props
}) => {
  const { colors } = useTheme()
  const { activeRoom } = useContext(RoomContext)

  return (
    <View {...props}>
      <FlatList
        data={
          activeRoom
            ? addAll
              ? ['all', ...activeRoom.topics]
              : activeRoom.topics
            : addAll
            ? ['all', ...defaultCategories]
            : defaultCategories
        }
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => (onClick ? onClick(item) : setFieldValue('category', item))}
          >
            <Text
              style={[
                styles.category,
                {
                  fontWeight: item === selectedCategory ? 'bold' : 'normal',
                  borderBottomColor: item === selectedCategory ? colors.blue : 'transparent',
                  color: item === selectedCategory ? colors.blue : colors.text
                }
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  category: {
    padding: 5,
    marginLeft: 5,
    marginRight: 5,
    borderBottomWidth: 1,
    fontFamily: 'OpenSans-SemiBold'
  }
})

export default CategoryPicker
