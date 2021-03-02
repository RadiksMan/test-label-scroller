import React, { useCallback, useMemo, useRef, useEffect } from 'react';
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

const LabelScroller = ({ data, renderItem, columns, minLabelLength, reverse, random }) => {
  const scrollListRefs = useRef({}).current;

  useEffect(() => {
    // reset refs if data/columns change
    for (const row in scrollListRefs) {
      const scrollRef = scrollListRefs[row];
      if (!scrollRef) {
        delete scrollListRefs[row];
        return;
      }
      scrollRef.scrollToOffset({ offset: 0, animated: false });
      scrollRef.currentScrollPositonX = 0;
    }
  }, [columns, data]);

  if (!data || !scrollListRefs) return null;

  if (data.length <= minLabelLength) {
    //render elems without scrolls
    return (
      <View style={styles.containerWithoutScrolling}>
        {data.map((item, index) => renderItem({ item, index }))}
      </View>
    );
  }

  const calculateNewScrollOffset = (gesture, scrollRef) => {
    const translatedX = gesture.dx;
    const currentScrollPositonX = scrollRef?.currentScrollPositonX || 0;
    const currentScrollWidth = scrollRef?.currentScrollWidth || 1;
    const calculatedOffset = parseInt(
      (translatedX * currentScrollWidth) / Dimensions.get('window').width / 3.5
    );
    const newOffset =
      translatedX < 0
        ? currentScrollPositonX + Math.abs(calculatedOffset) // translatedX < 0 - user scrolls right
        : currentScrollPositonX - Math.abs(calculatedOffset); // user scrolls left
    return newOffset;
  };

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
        //console.log('scrollListRefs', scrollListRefs);
        for (const row in scrollListRefs) {
          const scrollRef = scrollListRefs[row];
          if (!scrollRef) return;

          const newOffset = calculateNewScrollOffset(gestureState, scrollRef);

          //console.log('newOffset', newOffset);
          scrollRef.scrollToOffset({ offset: newOffset });
        }
      },
      // When user drag ends
      onPanResponderRelease: (e, gestureState) => {
        //console.log('onPanResponderRelease');
        //console.table(gestureState);
        // const overscrolledX = Math.abs(gestureState.vx) >= 1;
        // if (overscrolledX) {
        //   const overscrolled = Math.abs(gestureState.vx);
        //   const overscrolledNormilize = overscrolled > 3 ? 3 : overscrolled;
        //   for (const row in scrollListRefs) {
        //     const scrollRef = scrollListRefs[row];
        //     if (!scrollRef) return;
        //     const offset = calculateNewScrollOffset(gestureState, scrollRef);
        //     const newOffset = offset;
        //     scrollRef.scrollToOffset({ offset: newOffset });
        //   }
        //   console.log('Math.abs(gestureState.vx)', Math.abs(gestureState.vx));
        // }
      }
    })
  ).current;

  let divided = useMemo(() => {
    let array = divideArray(data, columns);
    if (reverse) return array.reverse();
    if (random) {
      return array.sort(() => 0.5 - Math.random());
    }
    return array;
  }, [data, columns, reverse, random]);

  console.log('divided', divided);
  return (
    <View>
      <View {...panResponder.panHandlers}>
        {divided.map((rowData, i) => (
          <FlatList
            key={i.toString()}
            ref={ref => (scrollListRefs[i] = ref)}
            data={rowData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            scrollEventThrottle={2}
            onScroll={e => {
              scrollListRefs[i].currentScrollPositonX = e.nativeEvent.contentOffset.x;
            }}
            onContentSizeChange={contentWidth => {
              scrollListRefs[i].currentScrollWidth = contentWidth;
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
