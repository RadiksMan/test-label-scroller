import React, { useCallback, useMemo, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import { divideArray } from './helper';

const LabelScroller = ({ data, renderItem, columns, minLabelLength, componentsArray }) => {
  const scrollListRefs = useRef({});

  if (!data) return null;

  if (data.length <= minLabelLength) {
    //render elems without scrolls
    return (
      <View style={styles.containerWithoutScrolling}>
        {data.map((item, index) => renderItem({ item, index }))}
      </View>
    );
  }

  const panResponder = useRef(
    PanResponder.create({
      //these things if for if user touch tochables button in children
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
      // When user moves element
      onPanResponderMove: (event, gestureState) => {
        //console.log('gestureState',gestureState.dx)
        //const translatedX = Math.max(0, 0 + gestureState.dx);
        const translatedX = gestureState.dx;
        console.log('onPanResponderMove');
        //console.log('scrollListRefs.current', scrollListRefs.current);
        console.table(gestureState);
        for (const row in scrollListRefs.current) {
          const scrollRef = scrollListRefs.current[row];
          //console.log('scrollRef.currentScrollPositonX', scrollRef.currentScrollPositonX);
          const currentScrollPositonX = scrollRef.currentScrollPositonX || 0;
          const currentScrollWidth = scrollRef.currentScrollWidth || 0;
          //console.log('currentScrollPositonX', currentScrollPositonX);
          //console.log('currentScrollWidth', currentScrollWidth);

          const calculatedOffset = parseInt(
            (translatedX * currentScrollWidth) / Dimensions.get('window').width / 3
          );
          console.log('calculatedOffset', calculatedOffset);
          const newOffset =
            translatedX < 0
              ? currentScrollPositonX + Math.abs(calculatedOffset) // translatedX < 0 - user scrolls right
              : currentScrollPositonX - Math.abs(calculatedOffset); // translatedX > 0 - user scrolls left

          //console.log('scrollRef', scrollRef);
          console.log('newOffset', newOffset);
          scrollRef.scrollToOffset({ offset: newOffset, animated: true });
        }
      },
      // When user drag ends
      onPanResponderRelease: (e, gestureState) => {
        //console.log('onPanResponderRelease');
        //console.table(gestureState);
        const overscrolledRight = gestureState.vx <= 0.06;
        // console.log('overscrolledRight',overscrolledRight)

        // console.log('scrollListRefs.current',scrollListRefs.current)
        for (const row in scrollListRefs.current) {
          const scrollRef = scrollListRefs.current[row];

          //scrollRef.scrollToOffset({offset:300,animated:true})
        }
      },
      // When user gesture is moved outside of direct parent
      onPanResponderTerminate: (evt, gesture) => {
        console.log('onPanResponderTerminate', gesture);
      }
    })
  ).current;

  const divided = useMemo(() => divideArray(data, columns), [data, columns]);

  return (
    <View>
      <View {...panResponder.panHandlers}>
        {divided.map((rowData, i) => (
          <FlatList
            key={i.toString()}
            ref={ref => (scrollListRefs.current[i] = ref)}
            data={rowData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            scrollEventThrottle={2}
            onScroll={e => {
              scrollListRefs.current[i].currentScrollPositonX = e.nativeEvent.contentOffset.x;
            }}
            onContentSizeChange={contentWidth => {
              scrollListRefs.current[i].currentScrollWidth = contentWidth;
            }}
          />
        ))}
      </View>
    </View>
  );
};

LabelScroller.defaultProps = {
  minLabelLength: 20,
  columns: 3
};

export default LabelScroller;

const styles = StyleSheet.create({
  containerWithoutScrolling: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});
