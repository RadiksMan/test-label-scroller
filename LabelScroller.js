import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, PanResponder, Dimensions } from 'react-native';

const LabelScroller = ({
  data,
  renderItem,
  columns,
  minLabelLength,
  minimumInRow,
  reverse,
  random
}) => {
  const scrollListRefs = useRef({}).current;
  const deviceWidth = Dimensions.get('window').width;
  const tempPanResponderMoveValue = useRef(null);
  const tempPanResponderStartValue = useRef(null);

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

  const divideArray = (dataArray, size) => {
    let array = [...dataArray];
    let i = size;
    let dividedArray = [];
    let tempCount = dataArray.length;
    while (0 < i) {
      // Don't slice last array
      if (i === 1) {
        dividedArray.push(array);
        return dividedArray;
      }

      let rowCount = Math.ceil((tempCount / i) * 0.6); // get 60% items from each sub-array
      if (rowCount < minimumInRow) rowCount = minimumInRow;
      tempCount = tempCount - rowCount;
      if (tempCount <= 0) return dividedArray;

      const reducedItems = array.slice(0, rowCount);
      dividedArray.push(reducedItems);
      array.splice(0, rowCount);
      i--;
    }
    return dividedArray;
  };

  const calculateScrollOffestPinch = (gesture, scrollRef) => {
    //console.table(gesture);
    const numberStrengthFix = Platform.OS === 'ios' ? 3.5 : 3.5; // number that decreases the strength of the gesture for different platforms
    const translatedX = gesture.dx;
    const currentScrollPositonX = scrollRef?.currentScrollPositonX || 0;
    const currentScrollWidth = scrollRef?.currentScrollWidth || 1;
    console.log('numberStrengthFix', numberStrengthFix);
    console.log('currentScrollWidth', currentScrollWidth);
    console.log('deviceWidth', deviceWidth);
    console.log('translatedX', translatedX);
    const calculatedOffset = parseInt(
      (translatedX * currentScrollWidth) / deviceWidth / numberStrengthFix / 2
    );
    const newOffset =
      translatedX < 0
        ? currentScrollPositonX + Math.abs(calculatedOffset) // translatedX < 0 - user scrolls right
        : currentScrollPositonX - Math.abs(calculatedOffset); // user scrolls left
    return newOffset;
  };

  const calculateScrollOffestMove = (gesture, scrollRef) => {
    // console.log('calculateScrollOffestMove');
    // console.table(gesture);
    let translatedX = gesture.dx;
    const isHasPreviousMoveValue = tempPanResponderMoveValue.current !== null;
    if (isHasPreviousMoveValue) {
      //console.log('isHasPreviousMoveValue',isHasPreviousMoveValue)
      //translatedX = tempPanResponderMoveValue.current < 0 ? (translatedX + Math.abs(tempPanResponderMoveValue.current)) : (translatedX - tempPanResponderMoveValue.current)
    }
    const currentScrollPositonX = scrollRef?.currentScrollPositonX || 0;
    const currentScrollWidth = scrollRef?.currentScrollWidth || 1;
    // console.log('currentScrollPositonX', currentScrollPositonX);
    // console.log('currentScrollWidth', currentScrollWidth);
    //console.log('translatedX', translatedX);
    const newOffset =
      gesture.dx < 0
        ? currentScrollPositonX + Math.abs(translatedX) // translatedX < 0 - user scrolls right
        : currentScrollPositonX - Math.abs(translatedX); // user scrolls left
    return newOffset;
  };

  const panResponder = useRef(
    PanResponder.create({
      // if user touch tochables button in children - do not intercept
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // skip if a tap
        return Math.abs(gestureState.dx) >= 1 || Math.abs(gestureState.dy) >= 1;
      }, //true,
      // onStartShouldSetPanResponder: () => true,
      //onMoveShouldSetPanResponder: () => true,
      //onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onMoveShouldSetResponderCapture: () => true,
      // onMoveShouldSetPanResponderCapture: (e, { dx }) => {
      //   return Math.abs(dx) > 20;
      // },
      //onPanResponderTerminationRequest: () => true,
      //onShouldBlockNativeResponder: () => false,
      // When user moves element
      onPanResponderGrant: (event, gestureState) => {
        console.log('onPanResponderGrant');
        console.table(gestureState);

        tempPanResponderStartValue.current = gestureState;
      },
      onPanResponderMove: (event, gestureState) => {
        if (tempPanResponderMoveValue.current) {
          const diff = gestureState.moveX - tempPanResponderMoveValue.current;
          console.log('diff', diff);

          for (const row in scrollListRefs) {
            let newOffset = null;
            const scrollRef = scrollListRefs[row];
            if (!scrollRef) return;

            const scrollPositionX = scrollRef?.currentScrollPositonX || 0;
            const scrollWidth = scrollRef?.currentScrollWidth;

            const calculatedOffset = (Math.abs(diff) * scrollWidth) / deviceWidth / 3;
            console.log('calculatedOffset', calculatedOffset);
            if (diff > 0) {
              newOffset = scrollPositionX - calculatedOffset;
            } else {
              newOffset = scrollPositionX + calculatedOffset;
            }
            console.log('newOffset', newOffset);
            scrollRef.scrollToOffset({ offset: newOffset, animated: false });
          }
        }

        // for (const row in scrollListRefs) {
        //   const scrollRef = scrollListRefs[row];
        //   if (!scrollRef) return;

        //   //const swipeStrength = Math.abs(gestureState.vx);
        //   // overscrollValue = swipeStrength >= 1.5 ? Math.min(swipeStrength, 3) : 1;
        //   //console.log('overscrollValue', overscrollValue);
        //   const offset = calculateScrollOffestMove(gestureState, scrollRef);
        //   //console.log('newOffset', offset);
        //   //const offset = newOffset;
        //   //console.log('onPanResponderMove row', row, '  newOffset', newOffset);
        //   scrollRef.scrollToOffset({ offset, animated: true });
        // }

        tempPanResponderMoveValue.current = gestureState.moveX;
        console.log('______________');
      },
      // When user drag ends
      onPanResponderRelease: (e, gestureState) => {
        
        // console.log('onPanResponderRelease');
        // console.table(gestureState);
        // for (const row in scrollListRefs) {
        //   const scrollRef = scrollListRefs[row];
        //   if (!scrollRef) return;
        //   const swipeStrength = Math.abs(gestureState.vx);
        //   const overscrollValue = swipeStrength >= 1.5 ? Math.min(swipeStrength, 3) : 1;
        //   //console.log('overscrollValue', overscrollValue);
        //   const newOffset = calculateScrollOffestPinch(gestureState, scrollRef);
        //   const offset = newOffset;
        //   //console.log('onPanResponderMove row', row, '  newOffset', newOffset);
        //   scrollRef.scrollToOffset({ offset, animated: true });
        // }
        const diff = gestureState.moveX - tempPanResponderMoveValue.current;
        console.log('diff', diff);

        for (const row in scrollListRefs) {
          const scrollRef = scrollListRefs[row];
          if (!scrollRef) return;
            const swipeStrength = Math.abs(gestureState.vx);
            const overscrollValue = swipeStrength >= 1.5 ? Math.min(swipeStrength, 3) : 1;
            console.log('overscrollValue',overscrollValue)
        }

        

        tempPanResponderStartValue.current = null;
        tempPanResponderMoveValue.current = null;
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
          scrollEventThrottle={16}
          onScroll={e => {
            scrollListRefs[i].currentScrollPositonX = e.nativeEvent.contentOffset.x;
          }}
          onContentSizeChange={contentWidth => {
            scrollListRefs[i].currentScrollWidth = contentWidth;
          }}
        />
      ))}
    </View>
  );
};

LabelScroller.defaultProps = {
  minLabelLength: 20,
  columns: 3,
  minimumInRow: 5
};

export default LabelScroller;

const styles = StyleSheet.create({
  containerWithoutScrolling: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});
