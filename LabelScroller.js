import React, { useMemo, useRef, useEffect } from 'react';
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
  let tempPanResponderMoveX = useRef(null).current;
  const deviceWidth = Dimensions.get('window').width;

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

  if (!data || !renderItem) {
    console.warn("LabelScroller required 'data' and 'renderItem' prop - returned null!");
    return null;
  }

  if (data.length <= minLabelLength) {
    //if not enough elems - render without flatlist
    return (
      <View style={styles.containerWithoutScrolling}>
        {data.map((item, index) => renderItem({ item, index }))}
      </View>
    );
  }

  const splitArrayToUnequal = (dataArray, size) => {
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

  const panResponder = useRef(
    PanResponder.create({
      // if user touch tochables button in children - do not intercept
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // skip if a tap
        return Math.abs(gestureState.dx) >= 1 || Math.abs(gestureState.dy) >= 1;
      },
      // hooks for enabling scrolling outside panresponder
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onShouldBlockNativeResponder: () => false,
      onPanResponderTerminationRequest: () => false,
      // when user moves element
      onPanResponderMove: (event, gestureState) => {
        if (tempPanResponderMoveX) {
          const diff = gestureState.moveX - tempPanResponderMoveX;

          for (const row in scrollListRefs) {
            const scrollRef = scrollListRefs[row];
            if (!scrollRef) return;

            const scrollRowPositionX = scrollRef.currentScrollPositonX || 0;
            const scrollRowWidth = scrollRef.currentScrollWidth;
            const calculatedOffset = (Math.abs(diff) * scrollRowWidth) / deviceWidth / 4;

            const newOffset =
              gestureState.dx > 0
                ? scrollRowPositionX - calculatedOffset
                : scrollRowPositionX + calculatedOffset;

            scrollRef.scrollToOffset({ offset: newOffset, animated: false });
          }
        }

        tempPanResponderMoveX = gestureState.moveX;
      },
      // when user drag ends
      onPanResponderRelease: (e, gestureState) => {
        const { vx } = gestureState;
        const swipeEffort = Math.abs(vx) > 1.3;

        for (const row in scrollListRefs) {
          const scrollRef = scrollListRefs[row];
          const scrollRowPositionX = scrollRef.currentScrollPositonX || 0;
          const scrollRowWidth = scrollRef.currentScrollWidth;
          if (!scrollRef) return;

          let calculatedOffset = (deviceWidth * 0.1 * scrollRowWidth) / deviceWidth / 6;
          if (swipeEffort) {
            calculatedOffset = calculatedOffset * Math.abs(vx);
          }

          const newOffset =
            gestureState.dx > 0
              ? scrollRowPositionX - calculatedOffset
              : scrollRowPositionX + calculatedOffset;

          scrollRef.scrollToOffset({ offset: newOffset, animated: true });
        }

        tempPanResponderMoveX = null;
      }
    })
  ).current;

  let divided = useMemo(() => {
    let array = splitArrayToUnequal(data, columns);
    if (reverse) return array.reverse();
    if (random) {
      return array.sort(() => 0.5 - Math.random());
    }
    return array;
  }, [data, columns, reverse, random]);

  return (
    <View {...panResponder.panHandlers}>
      {divided.map((rowData, i) => (
        <FlatList
          nestedScrollEnabled
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
