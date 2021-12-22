import {colors} from 'assets/Colors';
import {BackButton, Text} from 'custom-components';
import React, {FC, Fragment} from 'react';
import {StyleSheet, View} from 'react-native';
import {scaler} from 'utils';

interface StepperProps {
  totalSteps: number;
  step: number;
  isBackButton?: boolean;
  paddingHorizontal?: any;
}

export const Stepper: FC<StepperProps> = props => {
  const {totalSteps, step, isBackButton = false, paddingHorizontal} = props;
  return (
    <View
      style={
        paddingHorizontal
          ? [styles.container, {paddingHorizontal: paddingHorizontal}]
          : styles.container
      }>
      {isBackButton && (
        <View style={{position: 'absolute', left: 0, alignItems: 'center'}}>
          <BackButton marginVertical={scaler(5)} />
        </View>
      )}
      <View style={styles.row}>
        {new Array(totalSteps).fill(1).map((_, i) => {
          return (
            <Fragment key={i}>
              {i != 0 ? <View style={styles.line} /> : null}
              {i + 1 == step ? (
                <View style={styles.selectedView}>
                  <Text style={styles.selectedText}>{i + 1}</Text>
                </View>
              ) : (
                <View style={styles.unSelectedView}>
                  <Text style={styles.unSelectedText}>{i + 1}</Text>
                </View>
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: scaler(25),
    paddingHorizontal: '15%',
    marginVertical: scaler(10),
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.colorPrimary,
  },
  selectedText: {
    fontWeight: '600',
    textAlign: 'center',
    // paddingHorizontal: 2,
    fontSize: scaler(16),
    color: colors.colorWhite,
  },
  unSelectedView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.colorPrimary,
    borderWidth: 1.5,
    height: scaler(25),
    width: scaler(25),
    borderRadius: scaler(14),
  },
  unSelectedText: {
    textAlign: 'center',
    fontSize: scaler(15),
    color: colors.colorPrimary,
  },
  selectedView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.colorPrimary,
    backgroundColor: colors.colorPrimary,
    borderWidth: 1.5,
    height: scaler(25),
    width: scaler(25),
    borderRadius: scaler(14),
  },
});
