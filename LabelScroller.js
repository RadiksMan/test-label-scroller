
import React,{useCallback,useMemo,useRef} from 'react';
import { ScrollView, StyleSheet, Text, View, FlatList,PanResponder, Animated } from 'react-native'
import {divideArray} from './helper'

const LabelScroller = ({
  data,
  renderItem,
  columns,
  minLabelLength,
  componentsArray
}) => {
  const scrollListRefs = useRef({});

  if(!data) return null;

  if(data.length <= minLabelLength) {
    //render elems without scrolls
    return <View style={styles.containerWithoutScrolling}>{data.map((item,index) => renderItem({item,index}))}</View>
  }

  const panResponder = useRef(PanResponder.create({
    //these things if for if user touch tochables button in children
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => false,

    onPanResponderMove: (event, gestureState) => {
      //console.log('gestureState',gestureState.dx)
      //const translatedX = Math.max(0, 0 + gestureState.dx);
      const translatedX = gestureState.dx;
      console.log('translatedX',translatedX)
      for (const row in scrollListRefs.current) {
        const scrollRef = scrollListRefs.current[row];
        console.log('scrollRef.currentScrollPositonX',scrollRef.currentScrollPositonX)
        const currentScrollPositonX = scrollRef.currentScrollPositonX || 0;
        const newOffset = currentScrollPositonX +translatedX
        console.log('scrollRef',scrollRef)
        console.log('newOffset',newOffset)
        scrollRef.scrollToOffset({offset:newOffset,animated:true})
      }
    },
    onPanResponderRelease: (e, gesture) => {
      //console.log('gesture',gesture)
      const overscrolledRight = gesture.vx <= 0.06;
     // console.log('overscrolledRight',overscrolledRight)

     // console.log('scrollListRefs.current',scrollListRefs.current)
      for (const row in scrollListRefs.current) {
        const scrollRef = scrollListRefs.current[row];

        //scrollRef.scrollToOffset({offset:300,animated:true})
      }
    },
  })).current;

  const divided = useMemo(() => divideArray(data,columns),[data,columns]);

  return (
    <View>
      
        <Animated.View
          {...panResponder.panHandlers}
        >
          {
            divided.map((rowData,i) => (
              <FlatList
                key={i.toString()}
                ref={ref => scrollListRefs.current[i] = ref}
                data={rowData}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                scrollEventThrottle={16}
                onScroll={(e) => {
                  scrollListRefs.current[i].currentScrollPositonX = e.nativeEvent.contentOffset.x;
                  //console.log('FlatList onScroll e',i, '  ',e.nativeEvent)
                }}
              />
            ))
          }
        </Animated.View>
      
    </View>
  )
}

LabelScroller.defaultProps = {
  minLabelLength: 20,
  columns:3
}

export default LabelScroller

const styles = StyleSheet.create({
  containerWithoutScrolling:{
    flexDirection:'row',
    flexWrap:'wrap'
  }
})
