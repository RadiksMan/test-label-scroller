import React, { useMemo, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, PanResponder, Dimensions } from 'react-native';

const LabelScroller = ({
  data,
  renderItem,
  rows,
  minLabelLength,
  minimumInRow,
  reverse,
  random
}) => {
  const scrollListRefs = useRef({}).current;
  let tempPanResponderMoveX = useRef(null).current;
  const deviceWidth = Dimensions.get('window').width;

  useEffect(() => {
    // reset refs if data/rows change
    for (const row in scrollListRefs) {
      const scrollRef = scrollListRefs[row];
      if (!scrollRef) {
        delete scrollListRefs[row];
        return;
      }
      scrollRef.scrollToOffset({ offset: 0, animated: false });
      scrollRef.scrollPositonX = 0;
      tempPanResponderMoveX = null;
    }
  }, [rows, data]);

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
      // don't slice last array
      if (i === 1) {
        dividedArray.push(array);
        return dividedArray;
      }

      let rowCount = Math.ceil((tempCount / i) * 0.6); // get 60% items from each sub-array
      if (rowCount < minimumInRow) rowCount = minimumInRow;
      tempCount = tempCount - rowCount; //at each iteration take piece from the entire array
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
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // skip if a tap
        return Math.abs(gestureState.dx) >= 1 || Math.abs(gestureState.dy) >= 1;
      },
      // some hooks for enabling scrolling outside panresponder
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onShouldBlockNativeResponder: () => false,
      onPanResponderTerminationRequest: () => false,
      // when user moves element
      onPanResponderMove: (e, gestureState) => {
        if (tempPanResponderMoveX) {
          const diff = gestureState.moveX - tempPanResponderMoveX;

          for (const row in scrollListRefs) {
            const scrollRef = scrollListRefs[row];
            if (!scrollRef) return;

            const scrollRowPositionX = scrollRef.scrollPositonX || 0;
            const scrollRowFullWidth = scrollRef.scrollFullWidth;
            const calculatedOffset = (Math.abs(diff) * scrollRowFullWidth) / deviceWidth / 4;

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
          const scrollRowPositionX = scrollRef.scrollPositonX || 0;
          const scrollRowFullWidth = scrollRef.scrollFullWidth;
          if (!scrollRef) return;

          let calculatedOffset = (scrollRowFullWidth * 0.1) / 7;
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

  const dividedByRow = useMemo(() => {
    let array = splitArrayToUnequal(data, rows);
    if (reverse) return array.reverse();
    if (random) {
      return array.sort(() => 0.5 - Math.random());
    }
    return array;
  }, [data, rows, reverse, random]);

  return (
    <View {...panResponder.panHandlers}>
      {dividedByRow.map((rowData, i) => (
        <FlatList
          nestedScrollEnabled
          key={i.toString()}
          ref={ref => (scrollListRefs[i] = ref)}
          data={rowData}
          renderItem={renderItem}
          keyExtractor={(item, index) => 'key' + index}
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          scrollEventThrottle={16}
          onScroll={e => {
            scrollListRefs[i].scrollPositonX = e.nativeEvent.contentOffset.x;
          }}
          onContentSizeChange={contentWidth => {
            scrollListRefs[i].scrollFullWidth = contentWidth;
          }}
        />
      ))}
    </View>
  );
};

LabelScroller.defaultProps = {
  minLabelLength: 20,
  rows: 3,
  minimumInRow: 5
};

export default LabelScroller;

const styles = StyleSheet.create({
  containerWithoutScrolling: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});
