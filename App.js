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
    console.log('pressOnItem item', item);
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <LabelScroller
            columns={12}
            data={data}
            renderItem={({ item, index }) => (
              <TouchableOpacity key={item.id} onPress={() => pressOnItem(item)} style={styles.item}>
                <Image style={styles.itemImage} source={{ uri: item.image }} />
                <Text style={styles.itemLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
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
    height: 20,
    marginHorizontal: 5
  }
});

export default App;
