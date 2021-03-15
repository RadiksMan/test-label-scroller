import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import LabelScroller from './LabelScroller';
import data from './data300.json';

const App = () => {
  const pressOnItem = item => {
    //do something with selected label
  };

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <LabelScroller
          rows={3}
          data={data}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => pressOnItem(item)}
              style={styles.item}
              activeOpacity={0.8}>
              <Image style={styles.itemImage} source={{ uri: item.image }} />
              <Text style={styles.itemLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 5,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    margin: 3
  },
  itemLabel: {},
  itemImage: {
    width: 20,
    height: 40,
    marginHorizontal: 5
  }
});

export default App;
